import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FileText, 
  FileSpreadsheet,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';
import { downloadSingleFile, exportAllProjectFilesAsZip } from '../utils/zipExporter';

export const CodeViewerTab: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('data_upload.sh');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);

  const activeFile = PROJECT_FILES.find((f) => f.name === selectedFileName) || PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadSingle = () => {
    downloadSingleFile(activeFile);
  };

  const handleExportZip = async () => {
    try {
      setIsExportingAll(true);
      await exportAllProjectFilesAsZip();
    } finally {
      setIsExportingAll(false);
    }
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.language === 'python') return <FileCode className="w-4 h-4 text-blue-500" />;
    if (file.language === 'bash') return <Terminal className="w-4 h-4 text-emerald-500" />;
    if (file.language === 'csv') return <FileSpreadsheet className="w-4 h-4 text-amber-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600" />
            Project Source Code & Executable Scripts Repository
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Complete, runnable production scripts adhering strictly to Apache Hadoop HDFS and PySpark MLlib. 
            Inspect, copy, or download any file.
          </p>
        </div>

        <button
          onClick={handleExportZip}
          disabled={isExportingAll}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingAll ? 'Generating ZIP...' : 'Download Entire Project (.ZIP)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Files List Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Deliverable Files ({PROJECT_FILES.length})
            </h3>
            <p className="text-xs text-slate-500">
              Generated in root directory per project specifications.
            </p>
          </div>

          <div className="space-y-1">
            {PROJECT_FILES.map((file) => {
              const isSelected = file.name === selectedFileName;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileName(file.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getFileIcon(file)}
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono capitalize ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
              <span className="font-semibold text-slate-900 block">Execution Order:</span>
              <ol className="list-decimal list-inside text-slate-600 space-y-1 font-mono text-[11px]">
                <li>data_upload.sh</li>
                <li>data_preprocessing.py</li>
                <li>train_model.py</li>
                <li>evaluate_model.py</li>
                <li>predict_size.py</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right: Code Viewer Container */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* File Action Bar */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {getFileIcon(activeFile)}
              <span className="font-mono font-bold text-slate-100 truncate">
                {activeFile.name}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                ({lines.length} lines)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer text-xs"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadSingle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer text-xs"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="p-4 font-mono text-xs overflow-x-auto max-h-[620px] overflow-y-auto leading-relaxed">
            <div className="table w-full">
              {lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre text-slate-200">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
