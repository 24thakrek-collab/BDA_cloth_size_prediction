import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { 
  TerminalEntry, 
  INITIAL_TERMINAL_ENTRIES, 
  executeTerminalCommand 
} from '../utils/terminalEngine';

export const TerminalTab: React.FC = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>(INITIAL_TERMINAL_ENTRIES);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleRunCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;

    if (cmdText.trim().toLowerCase() === 'clear') {
      setEntries([]);
      setInputCommand('');
      return;
    }

    const result = executeTerminalCommand(cmdText);
    setEntries((prev) => [...prev, result]);
    setCommandHistory((prev) => [cmdText, ...prev]);
    setHistoryIndex(-1);
    setInputCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand(inputCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  // Run full automated sequence
  const handleRunFullPipeline = async () => {
    if (isRunningPipeline) return;
    setIsRunningPipeline(true);

    const steps = [
      'jps',
      'hdfs dfs -mkdir -p /user/cloth/{input,processed,models,predictions,metrics}',
      'hdfs dfs -put -f final_test.csv /user/cloth/input/',
      'hdfs dfs -ls -h /user/cloth/input',
      'python3 data_preprocessing.py --namenode hdfs://localhost:9000',
      'python3 train_model.py --namenode hdfs://localhost:9000',
      'python3 evaluate_model.py --namenode hdfs://localhost:9000',
      'python3 predict_size.py --weight 68.0 --age 28.0 --height 170.0'
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 650));
      const res = executeTerminalCommand(step);
      setEntries((prev) => [...prev, res]);
    }

    setIsRunningPipeline(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const quickCommands = [
    { label: 'Verify Daemons (jps)', cmd: 'jps' },
    { label: 'Cluster Report', cmd: 'hdfs dfsadmin -report' },
    { label: 'Create HDFS Dirs', cmd: 'hdfs dfs -mkdir -p /user/cloth/{input,processed,models,predictions,metrics}' },
    { label: 'Upload CSV to HDFS', cmd: 'hdfs dfs -put -f final_test.csv /user/cloth/input/' },
    { label: 'List Input (ls -h)', cmd: 'hdfs dfs -ls -h /user/cloth/input' },
    { label: 'HDFS Disk Usage (du -h)', cmd: 'hdfs dfs -du -h /user/cloth' },
    { label: 'Preview HDFS File (cat)', cmd: 'hdfs dfs -cat /user/cloth/input/final_test.csv | head -n 5' },
    { label: 'Run Preprocessing', cmd: 'python3 data_preprocessing.py --namenode hdfs://localhost:9000' },
    { label: 'Train MLlib Models', cmd: 'python3 train_model.py --namenode hdfs://localhost:9000' },
    { label: 'Evaluate Model & Matrix', cmd: 'python3 evaluate_model.py --namenode hdfs://localhost:9000' },
    { label: 'CLI Inference Sample', cmd: 'python3 predict_size.py --weight 68 --age 28 --height 170' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-slate-800" />
            Hadoop HDFS & PySpark Terminal Simulator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Execute authentic Apache Hadoop CLI commands (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-800">hdfs dfs -put</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-800">-ls</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-800">-du</code>) 
            and PySpark MLlib distributed jobs against pseudo-distributed HDFS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunFullPipeline}
            disabled={isRunningPipeline}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningPipeline ? 'Executing Pipeline...' : 'Run End-to-End Pipeline'}</span>
          </button>
          <button
            onClick={() => setEntries([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Clear terminal output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Buttons Bar */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-slate-700 block mb-2">
          Click Command to Execute:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickCommands.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleRunCommand(item.cmd)}
              className="px-2.5 py-1 text-xs font-mono bg-white border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
              title={item.cmd}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
        {/* Terminal Header Bar */}
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-400 text-[11px] ml-2">
              hadoop@cluster: ~ (HDFS pseudo-distributed mode · localhost:9000)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>NameNode Active</span>
            <span aria-hidden="true">·</span>
            <span>Port 9000</span>
          </div>
        </div>

        {/* Terminal Logs Content */}
        <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
          {entries.length === 0 && (
            <div className="text-slate-500 py-6 text-center italic">
              Terminal cleared. Type a command below or select one of the quick presets above.
            </div>
          )}

          {entries.map((entry) => (
            <div key={entry.id} className="space-y-1.5 group">
              {/* Command Prompt Line */}
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">hadoop@cluster:~$</span>
                  <span className="text-slate-100 font-bold">{entry.command}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(entry.output, entry.id)}
                    className="p-1 hover:text-white rounded cursor-pointer"
                    title="Copy command output"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                  <span className="text-[10px] text-slate-500">{entry.timestamp}</span>
                </div>
              </div>

              {/* Output Content */}
              {entry.output && (
                <pre className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap overflow-x-auto ${
                  entry.type === 'error'
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                    : entry.type === 'spark'
                    ? 'bg-slate-900/60 text-emerald-300 border border-slate-800/80'
                    : 'bg-slate-900/40 text-slate-300 border border-slate-800/50'
                }`}>
                  {entry.output}
                </pre>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Command Input Bar */}
        <div className="bg-slate-900 p-3 border-t border-slate-800 flex items-center gap-2">
          <span className="text-emerald-400 font-bold shrink-0">hadoop@cluster:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help', 'jps', 'hdfs dfs -ls /user/cloth', or run python scripts..."
            className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600 font-mono text-xs"
          />
          <button
            onClick={() => handleRunCommand(inputCommand)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};
