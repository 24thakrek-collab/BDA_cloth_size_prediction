import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  BarChart, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DATASET_STATS, SAMPLE_RECORDS, DataRecord } from '../data/datasetSample';

export const DatasetTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [showCleanOnly, setShowCleanOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return SAMPLE_RECORDS.filter((item) => {
      if (showCleanOnly && !item.isClean) return false;
      if (selectedSizeFilter !== 'all' && item.size !== selectedSizeFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = item.id.toString().includes(term);
        const matchesSize = item.size.toLowerCase().includes(term);
        const matchesWeight = item.weight?.toString().includes(term) ?? false;
        const matchesHeight = item.height?.toString().includes(term) ?? false;
        return matchesId || matchesSize || matchesWeight || matchesHeight;
      }
      return true;
    });
  }, [searchTerm, selectedSizeFilter, showCleanOnly]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Dataset & Distributed Preprocessing Audit (final_test.csv)
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Inspection of the 119,734 records ingested from Hadoop HDFS. Demonstrates distributed missing value detection, 
          outlier filtration, and dynamic target size class discovery.
        </p>
      </div>

      {/* Dataset Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Total Ingested Rows
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono">
            {DATASET_STATS.totalRows.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Raw CSV records in HDFS
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Cleaned & Retained
          </span>
          <span className="text-2xl font-bold text-emerald-600 font-mono">
            {DATASET_STATS.cleanedRows.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            98.99% quality retention
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Dropped Outliers & Nulls
          </span>
          <span className="text-2xl font-bold text-amber-600 font-mono">
            {DATASET_STATS.droppedRows.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {DATASET_STATS.droppedPercent}% invalid or incomplete
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Discovered Target Classes
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono">
            7 Sizes
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            XXS to XXXL (Discovered dynamically)
          </span>
        </div>
      </div>

      {/* Dynamic Class Distribution Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Discovered Target Class Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Discovered from CSV at runtime via PySpark <code className="font-mono text-slate-800">raw_df.groupBy("size").count()</code>
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Validated: {DATASET_STATS.cleanedRows.toLocaleString()} records
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-5 rounded-lg overflow-hidden flex mb-4 bg-slate-100">
          {DATASET_STATS.targetDistribution.map((item) => (
            <div
              key={item.size}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              title={`Size ${item.size}: ${item.count.toLocaleString()} (${item.percentage}%)`}
              className="h-full hover:opacity-90 transition-opacity"
            />
          ))}
        </div>

        {/* Breakdown Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DATASET_STATS.targetDistribution.map((item) => (
            <div key={item.size} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-bold font-mono text-slate-900">
                  Size {item.size}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-700 block">
                {item.count.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distributed Feature Profiles & Missing Value Audit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DATASET_STATS.features.map((feat) => (
          <div key={feat.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono font-bold text-sm text-slate-900">
                {feat.name} ({feat.unit})
              </span>
              <span className="font-mono text-xs text-slate-500">
                {feat.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Mean</span>
                <span className="font-mono font-bold text-slate-900">{feat.mean} {feat.unit}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Std Dev</span>
                <span className="font-mono font-bold text-slate-900">±{feat.stdDev}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Range</span>
                <span className="font-mono text-slate-900">{feat.min} - {feat.max}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500 block text-[10px] uppercase">Null Count</span>
                <span className="font-mono text-amber-600 font-semibold">{feat.missing} rows</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Imputed & filtered in PySpark via physical boundaries rule.
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sample Records Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Interactive Data Records Preview (final_test.csv)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing sample partition records with missing value flags and data cleaning status.
            </p>
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 w-36 sm:w-44"
              />
            </div>

            <select
              value={selectedSizeFilter}
              onChange={(e) => {
                setSelectedSizeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
            >
              <option value="all">All Sizes</option>
              <option value="XXS">Size XXS</option>
              <option value="S">Size S</option>
              <option value="M">Size M</option>
              <option value="L">Size L</option>
              <option value="XL">Size XL</option>
              <option value="XXL">Size XXL</option>
              <option value="XXXL">Size XXXL</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCleanOnly}
                onChange={(e) => {
                  setShowCleanOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="accent-slate-900 rounded"
              />
              <span>Clean rows only</span>
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold font-mono">Row #</th>
                <th className="py-2.5 px-3 font-semibold font-mono">weight (kg)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">age (years)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">height (cm)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">size (target)</th>
                <th className="py-2.5 px-3 font-semibold">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans italic">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">
                      #{rec.id}
                    </td>
                    <td className={`py-2.5 px-3 ${rec.weight === null ? 'text-amber-600 font-bold bg-amber-50/50' : 'text-slate-800'}`}>
                      {rec.weight !== null ? `${rec.weight} kg` : 'NULL (missing)'}
                    </td>
                    <td className={`py-2.5 px-3 ${rec.age === null ? 'text-amber-600 font-bold bg-amber-50/50' : 'text-slate-800'}`}>
                      {rec.age !== null ? `${rec.age} yrs` : 'NULL (missing)'}
                    </td>
                    <td className={`py-2.5 px-3 ${rec.height === null ? 'text-amber-600 font-bold bg-amber-50/50' : 'text-slate-800'}`}>
                      {rec.height !== null ? `${rec.height} cm` : 'NULL (missing)'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {rec.size}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {rec.isClean ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Validated & Ingested
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium" title={rec.issue}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {rec.issue}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
