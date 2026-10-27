export interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  type: 'system' | 'hdfs' | 'spark' | 'python' | 'error';
}

export const INITIAL_TERMINAL_ENTRIES: TerminalEntry[] = [
  {
    id: 'init-1',
    command: 'jps',
    type: 'system',
    timestamp: '22:11:30',
    output: `51204 NameNode
51382 DataNode
51610 SecondaryNameNode
51920 ResourceManager
52055 NodeManager
52210 Jps`
  },
  {
    id: 'init-2',
    command: 'hdfs dfs -ls -h /user/cloth',
    type: 'hdfs',
    timestamp: '22:11:42',
    output: `drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth/input
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth/processed
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth/models
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth/predictions
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth/metrics`
  }
];

export function executeTerminalCommand(rawCommand: string): TerminalEntry {
  const cmd = rawCommand.trim();
  const time = new Date().toLocaleTimeString();
  const id = `cmd-${Date.now()}`;

  if (!cmd) {
    return { id, command: '', output: '', timestamp: time, type: 'system' };
  }

  const lower = cmd.toLowerCase();

  if (lower === 'help') {
    return {
      id,
      command: cmd,
      type: 'system',
      timestamp: time,
      output: `Available Hadoop HDFS and PySpark commands:
  • hdfs dfs -mkdir -p /user/cloth/{input,processed,models,predictions,metrics}
  • hdfs dfs -put -f final_test.csv /user/cloth/input/
  • hdfs dfs -ls -h /user/cloth/input
  • hdfs dfs -ls -R /user/cloth
  • hdfs dfs -du -h /user/cloth
  • hdfs dfs -cat /user/cloth/input/final_test.csv | head -n 5
  • hdfs dfsadmin -report
  • jps
  • python3 data_preprocessing.py --namenode hdfs://localhost:9000
  • python3 train_model.py --namenode hdfs://localhost:9000
  • python3 evaluate_model.py --namenode hdfs://localhost:9000
  • python3 predict_size.py --weight 68 --age 28 --height 170
  • clear`
    };
  }

  if (lower === 'jps') {
    return {
      id,
      command: cmd,
      type: 'system',
      timestamp: time,
      output: `51204 NameNode
51382 DataNode
51610 SecondaryNameNode
51920 ResourceManager
52055 NodeManager
53412 Jps`
    };
  }

  if (lower.includes('hdfs dfsadmin -report')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `Configured Capacity: 245.82 GB
Present Capacity: 188.45 GB (76.66%)
DFS Remaining: 182.11 GB (74.08%)
DFS Used: 6.34 GB (2.58%)
DFS Used%: 2.58%
Replicated Blocks:
	Under replicated blocks: 0
	Blocks with corrupt replicas: 0
	Missing blocks: 0
-------------------------------------------------
Live datanodes (1):
Name: 127.0.0.1:9866 (localhost)
Hostname: localhost
Decommission Status : Normal
Configured Capacity: 245.82 GB
DFS Used: 6.34 GB (2.58%)
Non DFS Used: 57.37 GB
DFS Remaining: 182.11 GB (74.08%)
DFS Used%: 2.58%
DFS Remaining%: 74.08%
Configured Cache Capacity: 0 B
Cache Used: 0 B
Cache Remaining: 0 B
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Last contact: Mon Oct 26 22:12:00 UTC 2026`
    };
  }

  if (lower.startsWith('hdfs dfs -mkdir')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `2026-10-26 22:12:02 INFO fs.FSHttpClient: Connecting to NameNode at localhost:9000
2026-10-26 22:12:02 INFO hdfs.DFSClient: Created directory /user/cloth/input (permission: 755)
2026-10-26 22:12:02 INFO hdfs.DFSClient: Created directory /user/cloth/processed (permission: 755)
2026-10-26 22:12:02 INFO hdfs.DFSClient: Created directory /user/cloth/models (permission: 755)
2026-10-26 22:12:02 INFO hdfs.DFSClient: Created directory /user/cloth/predictions (permission: 755)
2026-10-26 22:12:02 INFO hdfs.DFSClient: Created directory /user/cloth/metrics (permission: 755)
Directories successfully allocated on HDFS.`
    };
  }

  if (lower.startsWith('hdfs dfs -put')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `2026-10-26 22:12:15 INFO fs.FSHttpClient: Ingesting local file 'final_test.csv' to HDFS
2026-10-26 22:12:15 INFO hdfs.DFSClient: Allocating Block blk_1073741825_1001 length 3.42 MB
2026-10-26 22:12:15 INFO hdfs.DataStreamer: Writing block blk_1073741825_1001 to DataNode localhost:9866
2026-10-26 22:12:16 INFO hdfs.DataStreamer: Block blk_1073741825_1001 written with replication 1
Uploaded final_test.csv (119,734 records, 3.42 MB) to hdfs://localhost:9000/user/cloth/input/final_test.csv`
    };
  }

  if (lower.startsWith('hdfs dfs -ls -r') || lower.startsWith('hdfs dfs -ls -r')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:10 /user/cloth
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:12 /user/cloth/input
-rw-r--r--   1 hadoop supergroup    3592040 2026-10-26 22:12 /user/cloth/input/final_test.csv
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:14 /user/cloth/processed
-rw-r--r--   1 hadoop supergroup    1482012 2026-10-26 22:14 /user/cloth/processed/cleaned_cloth_data.parquet
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:16 /user/cloth/models
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:16 /user/cloth/models/best_cloth_size_rf_pipeline
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:16 /user/cloth/predictions
-rw-r--r--   1 hadoop supergroup     482110 2026-10-26 22:16 /user/cloth/predictions/test_predictions.parquet
drwxr-xr-x   - hadoop supergroup          0 2026-10-26 22:17 /user/cloth/metrics
-rw-r--r--   1 hadoop supergroup       1420 2026-10-26 22:17 /user/cloth/metrics/model_evaluation_report.txt`
    };
  }

  if (lower.startsWith('hdfs dfs -ls')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `Found 1 items
-rw-r--r--   1 hadoop supergroup     3.42 M 2026-10-26 22:12 /user/cloth/input/final_test.csv`
    };
  }

  if (lower.startsWith('hdfs dfs -du')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `3.42 M   3.42 M   /user/cloth/input
1.41 M   1.41 M   /user/cloth/processed
8.60 M   8.60 M   /user/cloth/models
470.8 K  470.8 K  /user/cloth/predictions
1.4 K    1.4 K    /user/cloth/metrics`
    };
  }

  if (lower.includes('hdfs dfs -cat') && lower.includes('final_test.csv')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `weight,age,height,size
62.0,28,165.0,M
52.5,24,160.0,S
75.0,34,172.0,L
46.0,21,153.0,XXS
84.0,41,168.0,XL`
    };
  }

  if (lower.startsWith('hdfs dfs -get')) {
    return {
      id,
      command: cmd,
      type: 'hdfs',
      timestamp: time,
      output: `2026-10-26 22:18:01 INFO fs.FSHttpClient: Downloading block blk_1073741829 from localhost:9866
Retrieved /user/cloth/metrics/model_evaluation_report.txt -> ./local_report.txt (1.4 KB)`
    };
  }

  if (lower.includes('data_preprocessing.py')) {
    return {
      id,
      command: cmd,
      type: 'spark',
      timestamp: time,
      output: `================================================================================
 HADOOP + PYSPARK DISTRIBUTED DATA PREPROCESSING PIPELINE
 Source HDFS URI      : hdfs://localhost:9000/user/cloth/input/final_test.csv
 Destination HDFS URI : hdfs://localhost:9000/user/cloth/processed/cleaned_cloth_data.parquet
================================================================================

[+] Step 1: Ingesting dataset from Hadoop HDFS...
    ✓ Successfully loaded dataset from HDFS.
    ✓ Total Raw Records Count: 119,734

[+] Step 2: Distributed Schema Inspection:
root
 |-- weight: double (nullable = true)
 |-- age: double (nullable = true)
 |-- height: double (nullable = true)
 |-- size: string (nullable = true)

[+] Step 3: Raw Data Sample Preview (First 5 records):
+------+----+------+----+
|weight|age |height|size|
+------+----+------+----+
|62.0  |28.0|165.0 |M   |
|52.5  |24.0|160.0 |S   |
|75.0  |34.0|172.0 |L   |
|46.0  |21.0|153.0 |XXS |
|84.0  |41.0|168.0 |XL  |
+------+----+------+----+

[+] Step 4: Distributed Missing / Null Value Audit:
    • weight_nulls    : 418 missing values (0.35%)
    • age_nulls       : 257 missing values (0.21%)
    • height_nulls    : 157 missing values (0.13%)
    • size_nulls      : 0 missing values (0.00%)

[+] Step 5: Duplicate Records Analysis:
    • Identified 382 exact duplicate rows.

[+] Step 6: Dynamic Target Label Discovery:
    ✓ Dynamically discovered 7 distinct cloth sizes in CSV:
      Labels: ['M', 'L', 'S', 'XL', 'XXS', 'XXL', 'XXXL']

[+] Step 7: Data Quality Cleaning & Physical Range Validation:
    ✓ Records retained after distributed cleaning: 118,520
    ✓ Corrupted / Outlier / Missing records dropped: 1,214 (1.01%)

[+] Step 8: Distributed Numerical Feature Summary Statistics:
+-------+------------------+------------------+------------------+
|summary|            weight|               age|            height|
+-------+------------------+------------------+------------------+
|  count|            118520|            118520|            118520|
|   mean| 61.84291258859264| 34.02738778265272|165.81249578130273|
| stddev| 9.782019482910482| 8.163920192837411| 6.840192847291048|
|    min|              22.0|              14.0|             137.0|
|    max|             180.0|              92.0|             200.0|
+-------+------------------+------------------+------------------+

[+] Step 9: Final Cleaned Target Class Distribution:
+----+-----+
|size|count|
+----+-----+
|   M|33645|
|   L|29810|
|   S|21930|
|  XL|15420|
| XXS| 9940|
| XXL| 5610|
|XXXL| 2165|
+----+-----+

[+] Step 10: Saving Cleaned Dataset back to Hadoop HDFS...
    ✓ Successfully wrote cleaned Parquet dataset to: hdfs://localhost:9000/user/cloth/processed/cleaned_cloth_data.parquet

================================================================================
 [COMPLETED] Distributed data preprocessing successfully executed.
 Next Step: python3 train_model.py
================================================================================`
    };
  }

  if (lower.includes('train_model.py')) {
    return {
      id,
      command: cmd,
      type: 'spark',
      timestamp: time,
      output: `================================================================================
 HADOOP + PYSPARK MLLIB DISTRIBUTED MODEL TRAINING
 Input Data HDFS URI   : hdfs://localhost:9000/user/cloth/processed/cleaned_cloth_data.parquet
 Model Output HDFS URI : hdfs://localhost:9000/user/cloth/models/best_cloth_size_rf_pipeline
 Predictions HDFS URI  : hdfs://localhost:9000/user/cloth/predictions/test_predictions.parquet
================================================================================

[+] Step 1: Loading preprocessed data from Hadoop HDFS...
    ✓ Loaded 118,520 cleaned records for distributed training.

[+] Step 2: Performing Reproducible Train/Test Split (80% Train, 20% Test)...
    ✓ Training Partition : 94,816 samples (80.0%)
    ✓ Testing Partition  : 23,704 samples (20.0%)

[+] Step 3: Designing PySpark ML Feature Engineering Stages...
    • VectorAssembler input columns: ['weight', 'age', 'height'] -> 'features'
    • StringIndexer: inputCol='size', outputCol='labelIndex' (fitted on train partition)

[+] Step 4: Configuring PySpark MLlib Classifiers...
    • RandomForestClassifier: 100 Trees, maxDepth=10, subsamplingRate=0.8
    • LogisticRegression: maxIter=50, regParam=0.01, family='multinomial'

[+] Step 5: Fitting Random Forest Pipeline on Training Data Only (No Data Leakage)...
2026-10-26 22:15:20 INFO TaskSetManager: Finished task 0.0 in stage 12.0 (TID 42) in 1842 ms
2026-10-26 22:15:35 INFO RandomForest: Fitting 100 decision trees across worker executors...
    ✓ Random Forest training completed.

[+] Step 6: Fitting Logistic Regression Pipeline on Training Data Only...
2026-10-26 22:15:48 INFO OWLQN: Iteration 42 / 50 completed, loss = 1.0428
    ✓ Logistic Regression training completed.

[+] Step 7: Generating Distributed Predictions on Unseen Test Set...
    ✓ Discovered Size Labels in Indexer: ['M', 'L', 'S', 'XL', 'XXS', 'XXL', 'XXXL']

[+] Step 8: Multi-Class Evaluation Metrics on Holdout Test Set:
---------------------------------------------------------------------------
Metric                    | Random Forest        | Logistic Regression 
---------------------------------------------------------------------------
Accuracy                  |              68.42%  |              62.15%
Weighted F1-Score         |              0.6795  |              0.6128
Weighted Precision        |              0.6781  |              0.6094
Weighted Recall           |              0.6842  |              0.6215
---------------------------------------------------------------------------

[+] Random Forest Feature Importances:
    • weight    :  54.20%
    • height    :  36.50%
    • age       :   9.30%

[+] Model Selection: RandomForestClassifier outperformed Logistic Regression.

[+] Step 9: Persisting Fitted Model Pipeline to Hadoop HDFS: hdfs://localhost:9000/user/cloth/models/best_cloth_size_rf_pipeline
    ✓ Successfully wrote PipelineModel to HDFS.

[+] Step 10: Saving Test Set Predictions to Hadoop HDFS: hdfs://localhost:9000/user/cloth/predictions/test_predictions.parquet
    ✓ Successfully wrote test predictions to HDFS.

================================================================================
 [COMPLETED] Model training and HDFS persistence complete.
 Next Steps:
   1. Run model evaluation: python3 evaluate_model.py
   2. Run interactive CLI predictor: python3 predict_size.py
================================================================================`
    };
  }

  if (lower.includes('evaluate_model.py')) {
    return {
      id,
      command: cmd,
      type: 'spark',
      timestamp: time,
      output: `================================================================================
 HADOOP + PYSPARK DISTRIBUTED MODEL EVALUATION
 Predictions Source HDFS URI : hdfs://localhost:9000/user/cloth/predictions/test_predictions.parquet
 Metrics Report HDFS URI     : hdfs://localhost:9000/user/cloth/metrics/model_evaluation_report.txt
================================================================================

[+] Step 1: Ingesting test predictions from Hadoop HDFS...
    ✓ Successfully loaded 23,704 test set predictions.

[+] Step 2: Sample Test Predictions (Actual vs Predicted):
+------+----+------+----+--------------+
|weight|age |height|size|predicted_size|
+------+----+------+----+--------------+
|62.0  |28.0|165.0 |M   |M             |
|52.5  |24.0|160.0 |S   |S             |
|75.0  |34.0|172.0 |L   |L             |
|46.0  |21.0|153.0 |XXS |XXS           |
|84.0  |41.0|168.0 |XL  |XL            |
|68.0  |32.0|166.0 |M   |L             |
|55.0  |25.0|162.0 |S   |S             |
|96.5  |45.0|170.0 |XXL |XXL           |
|110.0 |48.0|173.0 |XXXL|XXXL          |
|71.0  |35.0|167.0 |L   |L             |
+------+----+------+----+--------------+

[+] Step 3: Computing Distributed MLlib Classification Metrics:
============================================================
  Accuracy           : 68.42%
  Weighted Precision : 0.6781
  Weighted Recall    : 0.6842
  Weighted F1-Score  : 0.6795
============================================================

[+] Step 4: Distributed Confusion Matrix (Actual vs. Predicted):
+-------------+----+----+----+----+----+----+----+
|size_predicted|XXS |S   |M   |L   |XL  |XXL |XXXL|
+-------------+----+----+----+----+----+----+----+
|XXS          |1580|310 |65  |15  |2   |0   |0   |
|S            |240 |3120|890 |110 |12  |2   |0   |
|M            |45  |750 |4710|1140|75  |8   |2   |
|L            |8   |95  |1020|4280|520 |32  |5   |
|XL           |2   |8   |90  |680 |2140|150 |14  |
|XXL          |0   |1   |8   |45  |230 |810 |30  |
|XXXL         |0   |0   |1   |5   |22  |98  |306 |
+-------------+----+----+----+----+----+----+----+

[+] Step 5: Actual vs Predicted Label Totals:
+----------+------------+---------------+
|Cloth_Size|Actual_Count|Predicted_Count|
+----------+------------+---------------+
|M         |6,730       |6,784          |
|L         |5,960       |6,275          |
|S         |4,374       |4,284          |
|XL        |3,084       |3,001          |
|XXS       |1,972       |1,875          |
|XXL       |1,124       |1,100          |
|XXXL      |432         |357            |
+----------+------------+---------------+

[+] Step 6: Persisting Evaluation Report to Hadoop HDFS...
    ✓ Evaluation report written to HDFS: hdfs://localhost:9000/user/cloth/metrics/model_evaluation_report.txt

================================================================================
 [COMPLETED] Model evaluation finished successfully.
================================================================================`
    };
  }

  if (lower.includes('predict_size.py')) {
    // Extract weight, age, height if provided
    const wMatch = cmd.match(/--weight\s+([\d.]+)/);
    const aMatch = cmd.match(/--age\s+([\d.]+)/);
    const hMatch = cmd.match(/--height\s+([\d.]+)/);

    const w = wMatch ? parseFloat(wMatch[1]) : 68.0;
    const a = aMatch ? parseFloat(aMatch[1]) : 28.0;
    const h = hMatch ? parseFloat(hMatch[1]) : 170.0;

    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);

    return {
      id,
      command: cmd,
      type: 'python',
      timestamp: time,
      output: `======================================================================
 CLOTH SIZE INFERENCE ENGINE (Apache PySpark MLlib & Hadoop HDFS)
======================================================================

[+] Loading trained pipeline model from: hdfs://localhost:9000/user/cloth/models/best_cloth_size_rf_pipeline
    ✓ Loaded model successfully from Hadoop HDFS.

============================================================
 PREDICTION RESULT
============================================================
 Input Features  : Weight = ${w.toFixed(1)} kg | Height = ${h.toFixed(1)} cm | Age = ${a.toFixed(0)} yrs
 Computed BMI    : ${bmi} kg/m²
 Predicted Size  : >>> M <<<
------------------------------------------------------------
 Model Class Probability Distribution:
   Size M     :  56.4%  |████████████████              |
   Size L     :  28.2%  |████████                      |
   Size S     :  10.8%  |███                           |
   Size XL    :   3.4%  |█                             |
   Size XXS   :   0.8%  |                              |
   Size XXL   :   0.3%  |                              |
   Size XXXL  :   0.1%  |                              |
============================================================
* DISCLAIMER:
  The predicted clothing size is an algorithmic machine learning estimate
  computed from the statistical distribution of customer heights, weights,
  and ages in this dataset. Sizing varies widely across apparel brands,
  cuts, fabrics, and regions. These results should NOT be used as definitive
  bespoke tailoring measurements or medical body metrics.
============================================================`
    };
  }

  return {
    id,
    command: cmd,
    type: 'error',
    timestamp: time,
    output: `bash: ${cmd.split(' ')[0]}: command not found.
Type 'help' to inspect available Hadoop HDFS and PySpark commands.`
  };
}
