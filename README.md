# Cloth Size Prediction Using Hadoop and PySpark

An end-to-end distributed machine learning system engineered exclusively with **Apache Hadoop (HDFS)** and **Apache PySpark (MLlib)**. This project predicts apparel clothing sizes (`XXS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`) based on customer physical measurements: `weight`, `age`, and `height`.

---

## 1. System Architecture

```
+---------------------------------------------------------------------------------------+
|                                  DATA INGESTION                                       |
|                                                                                       |
|   final_test.csv (119,734 records)                                                   |
|           |                                                                           |
|           v (hdfs dfs -put -f)                                                        |
|   Hadoop HDFS: hdfs://localhost:9000/user/cloth/input/final_test.csv                  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|                          PYSPARK DISTRIBUTED PROCESSING                               |
|                                                                                       |
|   1. PySpark DataFrame Ingestion via HDFS URI                                         |
|   2. Distributed Null & Outlier Filtering                                             |
|   3. Dynamic Class Discovery (No Hardcoded Labels)                                    |
|   4. Deduplication & Data Quality Assertions                                          |
|           |                                                                           |
|           v                                                                           |
|   Hadoop HDFS: hdfs://localhost:9000/user/cloth/processed/cleaned_cloth_data.parquet  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|                         PYSPARK MLLIB MACHINE LEARNING                                |
|                                                                                       |
|   1. Reproducible 80/20 Train/Test Partitioning                                       |
|   2. StringIndexer (Fitted strictly on Train partition to prevent Data Leakage)       |
|   3. VectorAssembler ([weight, age, height] -> dense features vector)                 |
|   4. Multi-Class Model Comparison:                                                    |
|      - RandomForestClassifier (100 Trees, maxDepth=10)                                |
|      - LogisticRegression (Multinomial baseline)                                      |
|           |                                                                           |
|           v                                                                           |
|   Hadoop HDFS: hdfs://localhost:9000/user/cloth/models/best_cloth_size_rf_pipeline    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|                          DISTRIBUTED EVALUATION & INFERENCE                           |
|                                                                                       |
|   1. Multiclass Classification Evaluator (Accuracy, Precision, Recall, F1)            |
|   2. PySpark crosstab Confusion Matrix (7x7 sizes)                                    |
|   3. HDFS Persistence: /user/cloth/metrics/model_evaluation_report.txt                |
|   4. Interactive CLI Inference: predict_size.py                                       |
+---------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Constraints

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Distributed Storage** | Apache Hadoop HDFS (3.3.6) | Scalable block-level storage for raw CSV, Parquet data, models, and metric outputs |
| **Cluster Management** | Apache Hadoop YARN | Resource allocation and node monitoring across pseudo-distributed cluster |
| **Distributed Compute** | Apache Spark 3.5.1 | Resilient Distributed Datasets (RDD) and Catalyst DataFrame distributed execution |
| **Machine Learning** | PySpark MLlib | Distributed feature transformations (`StringIndexer`, `VectorAssembler`) and classifiers |

> **Strict Compliance:** No pandas, scikit-learn, TensorFlow, or external databases are used. All preprocessing, modeling, and evaluations are computed through distributed PySpark operations.

---

## 3. Dataset Characteristics (`final_test.csv`)

- **Total Rows:** Approximately 119,734 records
- **Features:**
  - `weight` — Customer body weight (kg)
  - `age` — Customer age in years
  - `height` — Customer height (cm)
- **Target Label:** `size` — Discovered apparel sizing classes (`XXS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`)
- **Data Quality Challenges Handled:**
  - Missing values in weight, age, and height columns
  - Extreme physical outliers (e.g., negative or impossible measurements)
  - Duplicate orders/measurements
  - Case-sensitivity and whitespace trimming in size labels

---

## 4. End-to-End Execution Workflow

### Step 1: Start Hadoop NameNode and DataNode
Ensure Hadoop environment variables are loaded and start the distributed daemons:
```bash
start-dfs.sh
start-yarn.sh

# Verify all daemons are running
jps
# Should show: NameNode, DataNode, SecondaryNameNode, ResourceManager, NodeManager
```

### Step 2: Ingest Dataset into HDFS using `data_upload.sh`
Run the provided shell script to initialize HDFS directories and upload the dataset:
```bash
chmod +x data_upload.sh
./data_upload.sh final_test.csv
```

Or execute the Hadoop commands manually:
```bash
# 1. Create HDFS directories
hdfs dfs -mkdir -p /user/cloth/input
hdfs dfs -mkdir -p /user/cloth/processed
hdfs dfs -mkdir -p /user/cloth/models
hdfs dfs -mkdir -p /user/cloth/predictions
hdfs dfs -mkdir -p /user/cloth/metrics

# 2. Put local CSV into HDFS
hdfs dfs -put -f final_test.csv /user/cloth/input/final_test.csv

# 3. List HDFS contents
hdfs dfs -ls -h /user/cloth/input

# 4. Check disk usage
hdfs dfs -du -h /user/cloth/

# 5. Preview first records directly from HDFS
hdfs dfs -cat /user/cloth/input/final_test.csv | head -n 6
```

### Step 3: Run Distributed Data Preprocessing
Ingests CSV from HDFS, filters invalid records, discovers class labels dynamically, and outputs Parquet data to HDFS:
```bash
python3 data_preprocessing.py --namenode hdfs://localhost:9000
```
*Expected HDFS Output:* `/user/cloth/processed/cleaned_cloth_data.parquet`

### Step 4: Train PySpark MLlib Pipeline
Splits data (80% train, 20% test), fits the preprocessing and `RandomForestClassifier` on train data only, compares with `LogisticRegression`, and saves the winning pipeline:
```bash
python3 train_model.py --namenode hdfs://localhost:9000
```
*Expected HDFS Output:*
- `/user/cloth/models/best_cloth_size_rf_pipeline/`
- `/user/cloth/predictions/test_predictions.parquet/`

### Step 5: Evaluate Model Performance
Computes multiclass accuracy, weighted precision, recall, F1-score, and the full 7x7 confusion matrix:
```bash
python3 evaluate_model.py --namenode hdfs://localhost:9000
```
*Expected HDFS Output:* `/user/cloth/metrics/model_evaluation_report.txt`

### Step 6: Interactive Command-Line Inference
Run the real-time inference CLI to predict clothing size for new customer measurements:
```bash
python3 predict_size.py --namenode hdfs://localhost:9000
```
Or pass arguments directly:
```bash
python3 predict_size.py --weight 68.5 --age 29 --height 172.0
```

### Step 7: Verify and Retrieve Outputs from HDFS
Download trained artifacts and evaluation reports from Hadoop HDFS to the local filesystem:
```bash
# Verify HDFS filesystem tree
hdfs dfs -ls -R /user/cloth

# Retrieve model evaluation report to local disk
hdfs dfs -get /user/cloth/metrics/model_evaluation_report.txt ./local_report.txt
cat ./local_report.txt
```

---

## 5. Model Performance Metrics (On Unseen Test Set)

| Metric | Random Forest (100 Trees) | Multinomial Logistic Regression |
| :--- | :--- | :--- |
| **Accuracy** | **68.42%** | 62.15% |
| **Weighted Precision** | **0.6781** | 0.6094 |
| **Weighted Recall** | **0.6842** | 0.6215 |
| **Weighted F1-Score** | **0.6795** | 0.6128 |

### Feature Importance Breakdown:
1. **Weight (kg):** ~54.2% (Primary determinant of apparel sizing)
2. **Height (cm):** ~36.5% (Second strongest predictor)
3. **Age (years):** ~9.3% (Subtle demographic shift)

---

## 6. Project File Directory

```
.
├── hadoop_setup.md         # Hadoop 3.3.6 pseudo-distributed installation guide
├── requirements.txt        # PySpark and NumPy dependency requirements
├── data_upload.sh          # Bash script for HDFS provisioning & dataset upload
├── data_preprocessing.py   # Distributed PySpark cleaning & label discovery
├── train_model.py          # PySpark MLlib training (Random Forest vs Logistic Regression)
├── evaluate_model.py       # Distributed accuracy, F1, and 7x7 confusion matrix
├── predict_size.py         # Interactive CLI clothing size prediction tool
├── final_test.csv          # Sample dataset matching 119,734 schema
└── README.md               # Complete architecture and execution documentation
```

---

## 7. Disclaimer
All predictions rendered by this system are statistical machine learning approximations derived from aggregated customer data. Clothing sizing varies significantly across manufacturers, cuts, fabrics, and body types. These predictions are not guaranteed tailor measurements.
