import React from 'react';
import { 
  Terminal, 
  Sparkles, 
  GitBranch, 
  Database, 
  BarChart3, 
  Code2, 
  Download, 
  HardDrive
} from 'lucide-react';
import { exportAllProjectFilesAsZip } from '../utils/zipExporter';

export type ActiveTab = 'predictor' | 'terminal' | 'architecture' | 'dataset' | 'evaluation' | 'code';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      await exportAllProjectFilesAsZip();
    } finally {
      setIsExporting(false);
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'predictor', label: 'Size Predictor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'terminal', label: 'HDFS Terminal', icon: <Terminal className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'dataset', label: 'Dataset Explorer', icon: <Database className="w-4 h-4" /> },
    { id: 'evaluation', label: 'Model Evaluation', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'code', label: 'Project Files', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
                <HardDrive className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Cloth Size Prediction Using Hadoop and PySpark
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-slate-600">hdfs://localhost:9000</span>
                  <span aria-hidden="true">·</span>
                  <span>Apache Spark 3.5.1 MLlib</span>
                  <span aria-hidden="true">·</span>
                  <span>119,734 Records</span>
                  <span aria-hidden="true">·</span>
                  <span>7 Sizing Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              title="Download all Hadoop, PySpark, and configuration files as a ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 -mb-px border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
