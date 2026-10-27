/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { PredictorTab } from './components/PredictorTab';
import { TerminalTab } from './components/TerminalTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { DatasetTab } from './components/DatasetTab';
import { EvaluationTab } from './components/EvaluationTab';
import { CodeViewerTab } from './components/CodeViewerTab';
import { HardDrive, Cpu, Terminal, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('predictor');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'predictor' && <PredictorTab />}
        {activeTab === 'terminal' && <TerminalTab />}
        {activeTab === 'architecture' && <ArchitectureTab />}
        {activeTab === 'dataset' && <DatasetTab />}
        {activeTab === 'evaluation' && <EvaluationTab />}
        {activeTab === 'code' && <CodeViewerTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Cloth Size Prediction Using Hadoop and PySpark</span>
              <span aria-hidden="true">·</span>
              <span>Apache Hadoop HDFS</span>
              <span aria-hidden="true">·</span>
              <span>Apache Spark 3.5.1 MLlib</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button 
                onClick={() => setActiveTab('architecture')} 
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Architecture Guide
              </button>
              <button 
                onClick={() => setActiveTab('terminal')} 
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                HDFS Shell
              </button>
              <button 
                onClick={() => setActiveTab('code')} 
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Project Scripts
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
