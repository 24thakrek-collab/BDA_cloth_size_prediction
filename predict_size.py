#!/usr/bin/env python3
"""
Cloth Size Prediction Using Hadoop and PySpark
File: predict_size.py

Command-Line Inference Interface:
1. Loads trained PySpark PipelineModel directly from Hadoop HDFS (or local fallback).
2. Prompts user interactively (or accepts CLI args) for:
   - Weight (in kilograms, e.g., 65.5)
   - Age (in years, e.g., 28)
   - Height (in centimeters, e.g., 170.0)
3. Validates inputs with physiological range boundaries and descriptive error recovery.
4. Feeds single-record Spark DataFrame through fitted PipelineModel.
5. Inverts predicted index to human-readable size label (XXS, S, M, L, XL, XXL, XXXL).
6. Displays estimated probabilities across all classes.
7. Includes explicit sizing disclaimer that predictions are statistical estimates.

Strict Constraint: PySpark MLlib (no scikit-learn or pandas).
"""

import sys
import argparse
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, DoubleType
from pyspark.ml import PipelineModel

DISCLAIMER_TEXT = """
* DISCLAIMER:
  The predicted clothing size is an algorithmic machine learning estimate
  computed from the statistical distribution of customer heights, weights,
  and ages in this dataset. Sizing varies widely across apparel brands,
  cuts, fabrics, and regions. These results should NOT be used as definitive
  bespoke tailoring measurements or medical body metrics.
"""

def create_spark_session(app_name="ClothSize_PredictionCLI"):
    return (
        SparkSession.builder
        .appName(app_name)
        .master("local[2]")
        .config("spark.ui.enabled", "false")
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .getOrCreate()
    )

def validate_float(prompt, min_val, max_val, unit=""):
    while True:
        try:
            raw_input = input(f"{prompt} [{min_val}-{max_val} {unit}]: ").strip()
            if not raw_input:
                print("  [!] Error: Value cannot be empty. Please enter a number.")
                continue
            val = float(raw_input)
            if val < min_val or val > max_val:
                print(f"  [!] Error: Value {val} is out of realistic physical range ({min_val} to {max_val} {unit}).")
                continue
            return val
        except ValueError:
            print(f"  [!] Error: '{raw_input}' is not a valid floating-point number. Please try again.")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting prediction interface.")
            sys.exit(0)

def parse_args():
    parser = argparse.ArgumentParser(description="Cloth Size Inference using PySpark MLlib")
    parser.add_argument(
        "--namenode",
        type=str,
        default="hdfs://localhost:9000",
        help="HDFS NameNode URI"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        default="/user/cloth/models/best_cloth_size_rf_pipeline",
        help="HDFS or local path to saved PySpark PipelineModel"
    )
    parser.add_argument("--weight", type=float, default=None, help="Customer weight in kg (e.g. 68.0)")
    parser.add_argument("--age", type=float, default=None, help="Customer age in years (e.g. 32)")
    parser.add_argument("--height", type=float, default=None, help="Customer height in cm (e.g. 172.0)")
    return parser.parse_args()

def predict(spark, pipeline_model, weight, age, height):
    # Create single-record DataFrame with explicit schema
    schema = StructType([
        StructField("weight", DoubleType(), False),
        StructField("age", DoubleType(), False),
        StructField("height", DoubleType(), False)
    ])
    input_df = spark.createDataFrame([(float(weight), float(age), float(height))], schema)

    # Transform through pipeline
    result_df = pipeline_model.transform(input_df)
    row = result_df.select("prediction", "probability").collect()[0]

    # Retrieve labels from StringIndexerModel (stage 0 of PipelineModel)
    indexer_model = pipeline_model.stages[0]
    labels = indexer_model.labels
    pred_idx = int(row["prediction"])
    predicted_size = labels[pred_idx] if pred_idx < len(labels) else f"Class_{pred_idx}"

    probabilities = row["probability"].toArray()
    class_probs = [
        (labels[i] if i < len(labels) else f"Class_{i}", float(prob))
        for i, prob in enumerate(probabilities)
    ]
    # Sort by probability descending
    class_probs.sort(key=lambda x: x[1], reverse=True)

    # Compute Body Mass Index (BMI) for context
    height_m = height / 100.0
    bmi = weight / (height_m * height_m)

    return predicted_size, class_probs, bmi

def main():
    args = parse_args()
    hdfs_model_uri = f"{args.namenode.rstrip('/')}/{args.model_path.lstrip('/')}"

    print("=" * 70)
    print(" CLOTH SIZE INFERENCE ENGINE (Apache PySpark MLlib & Hadoop HDFS)")
    print("=" * 70)

    spark = create_spark_session()
    spark.sparkContext.setLogLevel("ERROR")

    print(f"\n[+] Loading trained pipeline model from: {hdfs_model_uri}")
    try:
        pipeline_model = PipelineModel.load(hdfs_model_uri)
        print("    ✓ Loaded model successfully from Hadoop HDFS.")
    except Exception as e:
        print(f"[-] Could not load model from HDFS ({e}).")
        print("    Attempting local fallback: 'best_cloth_size_rf_pipeline'...")
        try:
            pipeline_model = PipelineModel.load("best_cloth_size_rf_pipeline")
            print("    ✓ Loaded model from local directory.")
        except Exception as local_e:
            print(f"[-] Critical: Failed to load model locally: {local_e}")
            print("    Please train the model first by running: python3 train_model.py")
            spark.stop()
            sys.exit(1)

    # Check if inputs passed via command-line arguments
    if args.weight is not None and args.age is not None and args.height is not None:
        weight = args.weight
        age = args.age
        height = args.height
        interactive = False
    else:
        interactive = True

    while True:
        if interactive:
            print("\nPlease provide customer physical measurements:")
            weight = validate_float("  Enter Customer Weight (kg)", 25.0, 180.0, "kg")
            age = validate_float("  Enter Customer Age (years)", 12.0, 95.0, "years")
            height = validate_float("  Enter Customer Height (cm)", 120.0, 215.0, "cm")

        pred_size, class_probs, bmi = predict(spark, pipeline_model, weight, age, height)

        print("\n" + "=" * 60)
        print(" PREDICTION RESULT")
        print("=" * 60)
        print(f" Input Features  : Weight = {weight:.1f} kg | Height = {height:.1f} cm | Age = {age:.0f} yrs")
        print(f" Computed BMI    : {bmi:.1f} kg/m²")
        print(f" Predicted Size  : >>> {pred_size} <<<")
        print("-" * 60)
        print(" Model Class Probability Distribution:")
        for label, prob in class_probs:
            bar = "█" * int(prob * 30)
            print(f"   Size {label:<5} : {prob*100:5.1f}%  |{bar:<30}|")
        print("=" * 60)
        print(DISCLAIMER_TEXT.strip())
        print("=" * 60)

        if not interactive:
            break

        again = input("\nWould you like to predict for another customer? (y/n) [default: y]: ").strip().lower()
        if again in ("n", "no", "exit", "q"):
            print("Thank you for using the PySpark Cloth Size Prediction engine.")
            break

    spark.stop()

if __name__ == "__main__":
    main()
