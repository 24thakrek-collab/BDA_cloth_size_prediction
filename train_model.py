#!/usr/bin/env python3
"""
Cloth Size Prediction Using Hadoop and PySpark
File: train_model.py

Distributed Machine Learning Training Pipeline:
1. Loads cleaned dataset from Hadoop HDFS in Parquet format.
2. Performs reproducible 80/20 train/test split.
3. Encodes categorical size labels using StringIndexer (fitted strictly on training set).
4. Assembles continuous feature vectors [weight, age, height] using VectorAssembler.
5. Trains and compares:
   - PySpark MLlib RandomForestClassifier (multiclass ensemble).
   - PySpark MLlib LogisticRegression (multinomial benchmark).
6. Evaluates validation metrics (Accuracy, Weighted F1, Precision, Recall).
7. Selects the superior model and persists the complete fitted Pipeline to HDFS.
8. Writes test set predictions to HDFS for downstream distributed evaluation.

Strict Constraint: Pure PySpark MLlib (no scikit-learn or pandas).
"""

import sys
import argparse
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.ml import Pipeline
from pyspark.ml.feature import StringIndexer, VectorAssembler, IndexToString
from pyspark.ml.classification import RandomForestClassifier, LogisticRegression
from pyspark.ml.evaluation import MulticlassClassificationEvaluator

def create_spark_session(app_name="ClothSize_ModelTraining"):
    return (
        SparkSession.builder
        .appName(app_name)
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.driver.memory", "4g")
        .config("spark.executor.memory", "4g")
        .getOrCreate()
    )

def parse_arguments():
    parser = argparse.ArgumentParser(description="Distributed Model Training using PySpark MLlib")
    parser.add_argument(
        "--namenode",
        type=str,
        default="hdfs://localhost:9000",
        help="HDFS NameNode base URI"
    )
    parser.add_argument(
        "--input-path",
        type=str,
        default="/user/cloth/processed/cleaned_cloth_data.parquet",
        help="HDFS path to cleaned Parquet data"
    )
    parser.add_argument(
        "--model-output-path",
        type=str,
        default="/user/cloth/models/best_cloth_size_rf_pipeline",
        help="HDFS directory to store fitted PipelineModel"
    )
    parser.add_argument(
        "--predictions-output-path",
        type=str,
        default="/user/cloth/predictions/test_predictions.parquet",
        help="HDFS directory to store test set predictions"
    )
    return parser.parse_args()

def main():
    args = parse_arguments()
    hdfs_input_uri = f"{args.namenode.rstrip('/')}/{args.input_path.lstrip('/')}"
    hdfs_model_uri = f"{args.namenode.rstrip('/')}/{args.model_output_path.lstrip('/')}"
    hdfs_pred_uri = f"{args.namenode.rstrip('/')}/{args.predictions_output_path.lstrip('/')}"

    print("=" * 80)
    print(" HADOOP + PYSPARK MLLIB DISTRIBUTED MODEL TRAINING")
    print(f" Input Data HDFS URI   : {hdfs_input_uri}")
    print(f" Model Output HDFS URI : {hdfs_model_uri}")
    print(f" Predictions HDFS URI  : {hdfs_pred_uri}")
    print("=" * 80)

    spark = create_spark_session()
    spark.sparkContext.setLogLevel("WARN")

    print("\n[+] Step 1: Loading preprocessed data from Hadoop HDFS...")
    try:
        df = spark.read.parquet(hdfs_input_uri)
    except Exception as e:
        print(f"[-] Failed to load from HDFS: {e}")
        print("    Attempting local fallback at cleaned_cloth_data.parquet...")
        df = spark.read.parquet("cleaned_cloth_data.parquet")

    total_records = df.count()
    print(f"    ✓ Loaded {total_records:,} cleaned records for distributed training.")

    print("\n[+] Step 2: Performing Reproducible Train/Test Split (80% Train, 20% Test)...")
    # Using seed=42 for deterministic distributed partition splitting
    train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)
    train_df.cache()
    test_df.cache()

    train_count = train_df.count()
    test_count = test_df.count()
    print(f"    ✓ Training Partition : {train_count:,} samples ({train_count/total_records*100:.1f}%)")
    print(f"    ✓ Testing Partition  : {test_count:,} samples ({test_count/total_records*100:.1f}%)")

    print("\n[+] Step 3: Designing PySpark ML Feature Engineering Stages...")
    # Target encoding: StringIndexer converts discovered size labels to numeric index [0, 1, ..., K-1]
    # Note: handleInvalid="skip" ensures clean handling of any unseen test tokens
    label_indexer = StringIndexer(
        inputCol="size",
        outputCol="labelIndex",
        handleInvalid="skip"
    )

    # Feature vectorization: VectorAssembler packs numeric columns into a dense Vector
    feature_cols = ["weight", "age", "height"]
    assembler = VectorAssembler(
        inputCols=feature_cols,
        outputCol="features"
    )
    print(f"    • VectorAssembler input columns: {feature_cols} -> 'features'")

    print("\n[+] Step 4: Configuring PySpark MLlib Classifiers...")
    # Model candidate 1: Multiclass Random Forest
    rf_classifier = RandomForestClassifier(
        labelCol="labelIndex",
        featuresCol="features",
        numTrees=100,
        maxDepth=10,
        subsamplingRate=0.8,
        featureSubsetStrategy="auto",
        seed=42
    )

    # Model candidate 2: Multinomial Logistic Regression
    lr_classifier = LogisticRegression(
        labelCol="labelIndex",
        featuresCol="features",
        maxIter=50,
        regParam=0.01,
        elasticNetParam=0.0,
        family="multinomial"
    )

    # Invert indexed prediction back to original cloth size strings
    label_converter = IndexToString(
        inputCol="prediction",
        outputCol="predicted_size",
        labels=[] # Will be automatically populated from label_indexer
    )

    print("\n[+] Step 5: Fitting Random Forest Pipeline on Training Data Only (No Data Leakage)...")
    rf_pipeline = Pipeline(stages=[label_indexer, assembler, rf_classifier])
    rf_pipeline_model = rf_pipeline.fit(train_df)
    print("    ✓ Random Forest training completed.")

    print("\n[+] Step 6: Fitting Logistic Regression Pipeline on Training Data Only...")
    lr_pipeline = Pipeline(stages=[label_indexer, assembler, lr_classifier])
    lr_pipeline_model = lr_pipeline.fit(train_df)
    print("    ✓ Logistic Regression training completed.")

    print("\n[+] Step 7: Generating Distributed Predictions on Unseen Test Set...")
    rf_predictions = rf_pipeline_model.transform(test_df)
    lr_predictions = lr_pipeline_model.transform(test_df)

    # Recover string labels
    indexer_model = rf_pipeline_model.stages[0]
    discovered_labels = indexer_model.labels
    print(f"    ✓ Discovered Size Labels in Indexer: {discovered_labels}")

    converter = IndexToString(
        inputCol="prediction",
        outputCol="predicted_size",
        labels=discovered_labels
    )
    rf_predictions = converter.transform(rf_predictions)
    lr_predictions = converter.transform(lr_predictions)

    print("\n[+] Step 8: Multi-Class Evaluation Metrics on Holdout Test Set:")
    evaluator_acc = MulticlassClassificationEvaluator(labelCol="labelIndex", predictionCol="prediction", metricName="accuracy")
    evaluator_f1 = MulticlassClassificationEvaluator(labelCol="labelIndex", predictionCol="prediction", metricName="f1")
    evaluator_prec = MulticlassClassificationEvaluator(labelCol="labelIndex", predictionCol="prediction", metricName="weightedPrecision")
    evaluator_rec = MulticlassClassificationEvaluator(labelCol="labelIndex", predictionCol="prediction", metricName="weightedRecall")

    rf_acc = evaluator_acc.evaluate(rf_predictions)
    rf_f1 = evaluator_f1.evaluate(rf_predictions)
    rf_prec = evaluator_prec.evaluate(rf_predictions)
    rf_rec = evaluator_rec.evaluate(rf_predictions)

    lr_acc = evaluator_acc.evaluate(lr_predictions)
    lr_f1 = evaluator_f1.evaluate(lr_predictions)
    lr_prec = evaluator_prec.evaluate(lr_predictions)
    lr_rec = evaluator_rec.evaluate(lr_predictions)

    print("-" * 75)
    print(f"{'Metric':<25} | {'Random Forest':<20} | {'Logistic Regression':<20}")
    print("-" * 75)
    print(f"{'Accuracy':<25} | {rf_acc*100:>18.2f}% | {lr_acc*100:>18.2f}%")
    print(f"{'Weighted F1-Score':<25} | {rf_f1:>19.4f} | {lr_f1:>19.4f}")
    print(f"{'Weighted Precision':<25} | {rf_prec:>19.4f} | {lr_prec:>19.4f}")
    print(f"{'Weighted Recall':<25} | {rf_rec:>19.4f} | {lr_rec:>19.4f}")
    print("-" * 75)

    # Feature Importance analysis from Random Forest
    rf_stage = rf_pipeline_model.stages[2]
    importances = rf_stage.featureImportances.toArray()
    print("\n[+] Random Forest Feature Importances:")
    for feat_name, imp in zip(feature_cols, importances):
        print(f"    • {feat_name:<10}: {imp*100:6.2f}%")

    # Select Best Model
    if rf_f1 >= lr_f1:
        print("\n[+] Model Selection: RandomForestClassifier outperformed Logistic Regression.")
        best_pipeline_model = rf_pipeline_model
        best_predictions = rf_predictions
    else:
        print("\n[+] Model Selection: LogisticRegression outperformed Random Forest.")
        best_pipeline_model = lr_pipeline_model
        best_predictions = lr_predictions

    # Step 9: Save Best Model & Predictions to HDFS
    print(f"\n[+] Step 9: Persisting Fitted Model Pipeline to Hadoop HDFS: {hdfs_model_uri}")
    try:
        best_pipeline_model.write().overwrite().save(hdfs_model_uri)
        print("    ✓ Successfully wrote PipelineModel to HDFS.")
    except Exception as e:
        print(f"[-] Saving model to HDFS failed: {e}")
        local_model_path = "best_cloth_size_rf_pipeline"
        print(f"    Fallback: saving locally at {local_model_path}")
        best_pipeline_model.write().overwrite().save(local_model_path)

    print(f"\n[+] Step 10: Saving Test Set Predictions to Hadoop HDFS: {hdfs_pred_uri}")
    try:
        (
            best_predictions
            .select("weight", "age", "height", "size", "labelIndex", "prediction", "predicted_size")
            .write
            .mode("overwrite")
            .parquet(hdfs_pred_uri)
        )
        print("    ✓ Successfully wrote test predictions to HDFS.")
    except Exception as e:
        print(f"[-] Saving predictions to HDFS failed: {e}")
        (
            best_predictions
            .select("weight", "age", "height", "size", "labelIndex", "prediction", "predicted_size")
            .write
            .mode("overwrite")
            .parquet("test_predictions.parquet")
        )

    print("\n" + "=" * 80)
    print(" [COMPLETED] Model training and HDFS persistence complete.")
    print(" Next Steps:")
    print("   1. Run model evaluation: python3 evaluate_model.py")
    print("   2. Run interactive CLI predictor: python3 predict_size.py")
    print("=" * 80)

    spark.stop()

if __name__ == "__main__":
    main()
