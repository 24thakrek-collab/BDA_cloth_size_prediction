import React from 'react';
import { 
  GitBranch, 
  HardDrive, 
  Cpu, 
  Layers, 
  FolderTree, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Workflow,
  Sparkles
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Local CSV Ingestion',
      system: 'Local Filesystem',
      desc: 'Source final_test.csv containing ~119,734 records with features: weight, age, height, and target size.',
      detail: 'final_test.csv (3.4 MB)',
      badge: 'Local Source',
    },
    {
      step: '02',
      title: 'Hadoop HDFS Storage',
      system: 'HDFS NameNode & DataNode',
      desc: 'Data uploaded via hdfs dfs -put to distributed block storage at hdfs://localhost:9000/user/cloth/input/.',
      detail: 'Replication: 1 · Block: 128MB',
      badge: 'Distributed Storage',
    },
    {
      step: '03',
      title: 'PySpark Preprocessing',
      system: 'Apache Spark Catalyst Engine',
      desc: 'Distributed null checks, range filtering, outlier removal, deduplication, and dynamic label discovery.',
      detail: '118,520 clean records preserved',
      badge: 'In-Memory Compute',
    },
    {
      step: '04',
      title: 'MLlib Pipeline Training',
      system: 'PySpark MLlib',
      desc: 'StringIndexer and VectorAssembler fitted on train split (80%), followed by RandomForestClassifier (100 Trees).',
      detail: 'No Data Leakage · Feature Vector',
      badge: 'Distributed ML',
    },
    {
      step: '05',
      title: 'Distributed Evaluation',
      system: 'PySpark Evaluators',
      desc: 'Computes multiclass Accuracy (68.4%), Weighted F1 (0.6795), and distributed 7x7 Confusion Matrix.',
      detail: 'Crosstab aggregation on test split',
      badge: 'Evaluation',
    },
    {
      step: '06',
      title: 'HDFS Persistence',
      system: 'Hadoop HDFS',
      desc: 'Writes fitted PipelineModel, test predictions, and evaluation report to dedicated HDFS directories.',
      detail: 'Parquet & Text Outputs',
      badge: 'HDFS Output',
    },
  ];

  const hdfsDirectories = [
    {
      path: '/user/cloth/input/',
      format: 'CSV (final_test.csv)',
      purpose: 'Raw dataset input ingested from client machines',
      command: 'hdfs dfs -put -f final_test.csv /user/cloth/input/',
    },
    {
      path: '/user/cloth/processed/',
      format: 'Apache Parquet (Columnar)',
      purpose: 'Cleaned, deduplicated, and validated dataset partitioned for Spark workers',
      command: 'hdfs dfs -ls -h /user/cloth/processed/',
    },
    {
      path: '/user/cloth/models/',
      format: 'PySpark PipelineModel metadata & stages',
      purpose: 'Persisted StringIndexer, VectorAssembler, and RandomForestClassifier stages',
      command: 'hdfs dfs -ls -R /user/cloth/models/',
    },
    {
      path: '/user/cloth/predictions/',
      format: 'Apache Parquet',
      purpose: 'Unseen holdout test set (23,704 rows) with actual vs predicted sizing columns',
      command: 'hdfs dfs -ls -h /user/cloth/predictions/',
    },
    {
      path: '/user/cloth/metrics/',
      format: 'Plain Text (model_evaluation_report.txt)',
      purpose: 'Final evaluation metrics summary, weighted precision/recall, and class tallies',
      command: 'hdfs dfs -cat /user/cloth/metrics/model_evaluation_report.txt',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Overview Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Workflow className="w-5 h-5 text-emerald-600" />
          System Architecture & Distributed Processing Flow
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Detailed architectural design illustrating how Apache Hadoop HDFS provides scalable distributed block storage 
          and how Apache PySpark executes distributed machine learning pipelines without external frameworks.
        </p>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-slate-500" />
          End-to-End Pipeline Execution Topology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step, idx) => (
            <div 
              key={step.step}
              className="relative p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STEP {step.step}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {step.system}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{step.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hadoop HDFS vs Spark Compute Separation Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HDFS Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Apache Hadoop HDFS (Storage Layer)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                hdfs://localhost:9000
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Hadoop Distributed File System (HDFS) provides fault-tolerant, write-once, read-many distributed block storage. 
            In pseudo-distributed mode:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>NameNode:</strong> Manages the filesystem namespace directory tree and metadata block mapping (FsImage & EditLog).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>DataNode:</strong> Stores raw data blocks on physical disk (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">dfs.datanode.data.dir</code>) and reports heartbeats to the NameNode.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>
                <strong>Zero Local Fallback:</strong> PySpark streams data directly from HDFS URLs using the Hadoop Filesystem Client protocol (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">org.apache.hadoop.fs.FileSystem</code>).
              </span>
            </li>
          </ul>
        </div>

        {/* PySpark Compute Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Apache PySpark MLlib (Compute & ML Layer)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Spark 3.5.1 Driver & Worker DAG
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            PySpark executes distributed in-memory data processing and machine learning algorithms across resilient distributed partitions:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>
                <strong>Catalyst Query Optimizer:</strong> Converts DataFrame transformations into optimized physical execution plans.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>
                <strong>Strict Prevention of Data Leakage:</strong> <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">StringIndexer</code> and <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Pipeline</code> are fitted exclusively on the 80% training partition.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>
                <strong>Pure PySpark MLlib:</strong> Absolutely zero dependencies on pandas or scikit-learn. Evaluations and confusion matrices utilize native distributed <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">crosstab()</code> and <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">MulticlassClassificationEvaluator</code>.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* HDFS Directory Layout Reference */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-slate-500" />
          Hadoop HDFS Directory Hierarchy (/user/cloth/)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">HDFS Directory</th>
                <th className="py-2.5 px-3 font-semibold">Format</th>
                <th className="py-2.5 px-3 font-semibold">Purpose & Contents</th>
                <th className="py-2.5 px-3 font-semibold font-mono">CLI Verification Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hdfsDirectories.map((dir, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-700">
                    {dir.path}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {dir.format}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">
                    {dir.purpose}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    <code>{dir.command}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
