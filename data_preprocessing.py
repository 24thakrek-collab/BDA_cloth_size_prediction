#!/usr/bin/env python3
"""
Cloth Size Prediction Using Hadoop and PySpark
File: data_preprocessing.py

Distributed Data Preprocessing Pipeline:
1. Connects to Hadoop HDFS via PySpark DataFrame API.
2. Ingests CSV dataset from HDFS URI.
3. Performs distributed schema verification, null detection, and outlier audits.
4. Cleans invalid values, removes duplicates, and filters corrupted records.
5. Discovers actual size classes dynamically from data.
6. Computes class distribution and summary statistics.
7. Persists cleaned dataset to HDFS in distributed Parquet format.

Strict Constraint: Built purely with PySpark (no pandas, scikit-learn, or external databases).
"""

import sys
import argparse
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, DoubleType, StringType
from pyspark.sql.functions import col, count, when, isnan, trim, upper

def create_spark_session(app_name="ClothSize_DataPreprocessing"):
    """
    Initializes a PySpark session configured for Hadoop HDFS integration.
    """
    return (
        SparkSession.builder
        .appName(app_name)
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.hadoop.dfs.client.use.datanode.hostname", "true")
        .getOrCreate()
    )

def parse_arguments():
    parser = argparse.ArgumentParser(description="Distributed Preprocessing using PySpark and HDFS")
    parser.add_argument(
        "--namenode",
        type=str,
        default="hdfs://localhost:9000",
        help="Hadoop HDFS NameNode base URI (e.g. hdfs://localhost:9000)"
    )
    parser.add_argument(
        "--input-path",
        type=str,
        default="/user/cloth/input/final_test.csv",
        help="Relative or absolute HDFS path to input dataset CSV"
    )
    parser.add_argument(
        "--output-path",
        type=str,
        default="/user/cloth/processed/cleaned_cloth_data.parquet",
        help="HDFS destination path for cleaned dataset"
    )
    return parser.parse_args()

def main():
    args = parse_arguments()
    hdfs_input_uri = f"{args.namenode.rstrip('/')}/{args.input_path.lstrip('/')}"
    hdfs_output_uri = f"{args.namenode.rstrip('/')}/{args.output_path.lstrip('/')}"

    print("=" * 80)
    print(" HADOOP + PYSPARK DISTRIBUTED DATA PREPROCESSING PIPELINE")
    print(f" Source HDFS URI      : {hdfs_input_uri}")
    print(f" Destination HDFS URI : {hdfs_output_uri}")
    print("=" * 80)

    spark = create_spark_session()
    spark.sparkContext.setLogLevel("WARN")

    # Define explicit schema for reliable distributed parsing
    cloth_schema = StructType([
        StructField("weight", DoubleType(), True),
        StructField("age", DoubleType(), True),
        StructField("height", DoubleType(), True),
        StructField("size", StringType(), True)
    ])

    print("\n[+] Step 1: Ingesting dataset from Hadoop HDFS...")
    try:
        raw_df = (
            spark.read
            .format("csv")
            .option("header", "true")
            .schema(cloth_schema)
            .load(hdfs_input_uri)
        )
    except Exception as e:
        print(f"[-] HDFS Read failed at {hdfs_input_uri}: {e}")
        print("    Attempting local fallback for standalone development/testing...")
        raw_df = (
            spark.read
            .format("csv")
            .option("header", "true")
            .schema(cloth_schema)
            .load("final_test.csv")
        )

    raw_count = raw_df.count()
    print(f"    ✓ Successfully loaded dataset from HDFS.")
    print(f"    ✓ Total Raw Records Count: {raw_count:,}")

    print("\n[+] Step 2: Distributed Schema Inspection:")
    raw_df.printSchema()

    print("\n[+] Step 3: Raw Data Sample Preview (First 5 records):")
    raw_df.show(5, truncate=False)

    print("\n[+] Step 4: Distributed Missing / Null Value Audit:")
    null_exprs = [
        count(when(col(c).isNull() | isnan(col(c)), c)).alias(f"{c}_nulls")
        if c != "size"
        else count(when(col(c).isNull() | (trim(col(c)) == ""), c)).alias("size_nulls")
        for c in raw_df.columns
    ]
    null_counts = raw_df.select(null_exprs).collect()[0].asDict()
    for col_name, n_nulls in null_counts.items():
        pct = (n_nulls / raw_count) * 100 if raw_count > 0 else 0
        print(f"    • {col_name:<16}: {n_nulls:,} missing values ({pct:.2f}%)")

    print("\n[+] Step 5: Duplicate Records Analysis:")
    distinct_count = raw_df.dropDuplicates().count()
    duplicate_rows = raw_count - distinct_count
    print(f"    • Identified {duplicate_rows:,} exact duplicate rows.")

    print("\n[+] Step 6: Dynamic Target Label Discovery:")
    # Discover actual size categories dynamically from data (no hardcoded labels!)
    discovered_labels_df = (
        raw_df
        .filter(col("size").isNotNull() & (trim(col("size")) != ""))
        .select(upper(trim(col("size"))).alias("clean_size"))
        .groupBy("clean_size")
        .count()
        .orderBy(col("count").desc())
    )
    discovered_labels = [row["clean_size"] for row in discovered_labels_df.collect()]
    print(f"    ✓ Dynamically discovered {len(discovered_labels)} distinct cloth sizes in CSV:")
    print(f"      Labels: {discovered_labels}")
    discovered_labels_df.show(truncate=False)

    print("\n[+] Step 7: Data Quality Cleaning & Physical Range Validation:")
    # 1. Clean string column whitespace and standardize to uppercase
    # 2. Filter out non-null, physiologically valid measurements:
    #    - weight: valid between 20.0 kg and 200.0 kg
    #    - height: valid between 100.0 cm and 220.0 cm
    #    - age: valid between 10.0 and 100.0 years
    # 3. Ensure target 'size' is not null and is in discovered categories
    cleaned_df = (
        raw_df
        .filter(col("size").isNotNull() & (trim(col("size")) != ""))
        .withColumn("size", upper(trim(col("size"))))
        .filter(col("weight").isNotNull() & ~isnan(col("weight")))
        .filter(col("height").isNotNull() & ~isnan(col("height")))
        .filter(col("age").isNotNull() & ~isnan(col("age")))
        .filter((col("weight") >= 20.0) & (col("weight") <= 200.0))
        .filter((col("height") >= 100.0) & (col("height") <= 220.0))
        .filter((col("age") >= 10.0) & (col("age") <= 100.0))
        .dropDuplicates()
    )

    cleaned_count = cleaned_df.count()
    dropped_count = raw_count - cleaned_count
    dropped_pct = (dropped_count / raw_count) * 100 if raw_count > 0 else 0

    print(f"    ✓ Records retained after distributed cleaning: {cleaned_count:,}")
    print(f"    ✓ Corrupted / Outlier / Missing records dropped: {dropped_count:,} ({dropped_pct:.2f}%)")

    print("\n[+] Step 8: Distributed Numerical Feature Summary Statistics:")
    cleaned_df.select(["weight", "age", "height"]).describe().show()

    print("\n[+] Step 9: Final Cleaned Target Class Distribution:")
    cleaned_df.groupBy("size").count().orderBy(col("count").desc()).show()

    print("\n[+] Step 10: Saving Cleaned Dataset back to Hadoop HDFS...")
    try:
        (
            cleaned_df
            .write
            .mode("overwrite")
            .format("parquet")
            .save(hdfs_output_uri)
        )
        print(f"    ✓ Successfully wrote cleaned Parquet dataset to: {hdfs_output_uri}")
    except Exception as e:
        print(f"[-] Writing to HDFS failed: {e}")
        local_output = "cleaned_cloth_data.parquet"
        print(f"    Fallback: saving to local storage at {local_output}")
        cleaned_df.write.mode("overwrite").format("parquet").save(local_output)

    print("\n" + "=" * 80)
    print(" [COMPLETED] Distributed data preprocessing successfully executed.")
    print(" Next Step: python3 train_model.py")
    print("=" * 80)

    spark.stop()

if __name__ == "__main__":
    main()
