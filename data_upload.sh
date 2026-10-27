#!/usr/bin/env bash
# ==============================================================================
# Script: data_upload.sh
# Project: Cloth Size Prediction Using Hadoop and PySpark
# Purpose: Configure HDFS directories and ingest final_test.csv into Hadoop
# ==============================================================================

set -euo pipefail

# Configuration
HDFS_NAMENODE_URI="${HDFS_NAMENODE_URI:-hdfs://localhost:9000}"
HDFS_BASE_DIR="/user/cloth"
LOCAL_CSV_PATH="${1:-final_test.csv}"

echo "======================================================================"
echo " [HDFS Ingestion] Cloth Size Prediction - Hadoop Pipeline"
echo " Target HDFS NameNode : ${HDFS_NAMENODE_URI}"
echo " Target Base Path     : ${HDFS_BASE_DIR}"
echo " Source CSV File      : ${LOCAL_CSV_PATH}"
echo "======================================================================"

# 1. Verify Hadoop HDFS CLI is installed
if ! command -v hdfs &> /dev/null; then
    echo "[-] Error: 'hdfs' command not found."
    echo "    Please verify Apache Hadoop is installed and added to PATH."
    echo "    Refer to hadoop_setup.md for full configuration instructions."
    exit 1
fi

# 2. Check if local CSV file exists
if [ ! -f "${LOCAL_CSV_PATH}" ]; then
    echo "[-] Error: Local dataset '${LOCAL_CSV_PATH}' not found."
    echo "    Please ensure final_test.csv is present in the working directory."
    exit 1
fi

echo "[+] Step 1: Checking HDFS cluster connectivity..."
if ! hdfs dfs -test -d / 2>/dev/null; then
    echo "[-] Error: Cannot connect to HDFS at ${HDFS_NAMENODE_URI}."
    echo "    Check if NameNode and DataNode are active with 'jps'."
    echo "    Start daemons using 'start-dfs.sh'."
    exit 1
fi
echo "    ✓ HDFS cluster is alive and responding."

echo ""
echo "[+] Step 2: Creating HDFS directory hierarchy under ${HDFS_BASE_DIR}..."
hdfs dfs -mkdir -p "${HDFS_BASE_DIR}/input"
hdfs dfs -mkdir -p "${HDFS_BASE_DIR}/processed"
hdfs dfs -mkdir -p "${HDFS_BASE_DIR}/models"
hdfs dfs -mkdir -p "${HDFS_BASE_DIR}/predictions"
hdfs dfs -mkdir -p "${HDFS_BASE_DIR}/metrics"
echo "    ✓ Created directories: input, processed, models, predictions, metrics."

echo ""
echo "[+] Step 3: Uploading local dataset to HDFS (${HDFS_BASE_DIR}/input/)..."
hdfs dfs -put -f "${LOCAL_CSV_PATH}" "${HDFS_BASE_DIR}/input/final_test.csv"
echo "    ✓ Upload completed successfully."

echo ""
echo "[+] Step 4: Inspecting HDFS directory contents (hdfs dfs -ls -h)..."
hdfs dfs -ls -h "${HDFS_BASE_DIR}/input"

echo ""
echo "[+] Step 5: Checking HDFS disk space utilization (hdfs dfs -du -h)..."
hdfs dfs -du -h "${HDFS_BASE_DIR}"

echo ""
echo "[+] Step 6: Previewing first 5 records stored directly on HDFS (hdfs dfs -cat)..."
hdfs dfs -cat "${HDFS_BASE_DIR}/input/final_test.csv" | head -n 6

echo ""
echo "======================================================================"
echo " [SUCCESS] final_test.csv ingested into Hadoop HDFS successfully."
echo " HDFS URI for PySpark: ${HDFS_NAMENODE_URI}${HDFS_BASE_DIR}/input/final_test.csv"
echo " Ready to run: python3 data_preprocessing.py"
echo "======================================================================"
