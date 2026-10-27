import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  Scale, 
  Ruler, 
  Calendar, 
  HelpCircle,
  RotateCcw,
  Sliders,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { predictClothSize } from '../utils/predictor';

export const PredictorTab: React.FC = () => {
  // Input states (stored internally in metric kg and cm)
  const [weightKg, setWeightKg] = useState<number>(64.0);
  const [heightCm, setHeightCm] = useState<number>(166.0);
  const [ageYears, setAgeYears] = useState<number>(29);
  
  // Units toggle
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');

  // Model selection
  const [selectedModel, setSelectedModel] = useState<'rf' | 'lr'>('rf');

  // Computed prediction
  const prediction = useMemo(() => {
    return predictClothSize(weightKg, ageYears, heightCm, selectedModel);
  }, [weightKg, heightCm, ageYears, selectedModel]);

  // Presets
  const applyPreset = (w: number, h: number, a: number) => {
    setWeightKg(w);
    setHeightCm(h);
    setAgeYears(a);
  };

  const resetDefaults = () => {
    setWeightKg(62.0);
    setHeightCm(165.0);
    setAgeYears(28);
  };

  // Unit display values
  const displayWeight = weightUnit === 'kg' ? weightKg : Math.round(weightKg * 2.20462 * 10) / 10;
  const displayHeight = heightUnit === 'cm' ? heightCm : Math.round(heightCm * 0.393701 * 10) / 10;

  const handleWeightChange = (val: number) => {
    if (weightUnit === 'kg') {
      setWeightKg(Math.min(180, Math.max(25, val)));
    } else {
      setWeightKg(Math.min(180, Math.max(25, Math.round((val / 2.20462) * 10) / 10)));
    }
  };

  const handleHeightChange = (val: number) => {
    if (heightUnit === 'cm') {
      setHeightCm(Math.min(215, Math.max(120, val)));
    } else {
      setHeightCm(Math.min(215, Math.max(120, Math.round((val / 0.393701) * 10) / 10)));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Banner */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Interactive PySpark MLlib Sizing Inference Engine
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Simulates real-time inference using the trained PySpark MLlib pipeline saved in Hadoop HDFS 
              (<code className="text-xs bg-slate-100 text-slate-800 px-1 py-0.5 rounded">hdfs://localhost:9000/user/cloth/models/best_cloth_size_rf_pipeline</code>).
            </p>
          </div>
          <button
            onClick={resetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Quick Test Profiles:</span>
          <button
            onClick={() => applyPreset(46, 153, 21)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            Petite XXS (46kg, 153cm, 21y)
          </button>
          <button
            onClick={() => applyPreset(53, 160, 25)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            Standard Small (53kg, 160cm, 25y)
          </button>
          <button
            onClick={() => applyPreset(62, 166, 29)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            Medium Baseline (62kg, 166cm, 29y)
          </button>
          <button
            onClick={() => applyPreset(73, 171, 36)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            Large Fit (73kg, 171cm, 36y)
          </button>
          <button
            onClick={() => applyPreset(86, 172, 42)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            Extra Large (86kg, 172cm, 42y)
          </button>
          <button
            onClick={() => applyPreset(105, 174, 48)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-400 rounded-md text-slate-700 cursor-pointer transition-colors"
          >
            XXXL Plus (105kg, 174cm, 48y)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Inputs & Pipeline Controls */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Customer Measurements
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setSelectedModel('rf')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedModel === 'rf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Random Forest
                </button>
                <button
                  onClick={() => setSelectedModel('lr')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedModel === 'lr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Logistic Reg
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Values are assembled into a dense PySpark Vector (<code className="font-mono text-slate-700">[weight, age, height]</code>)
              and transformed through the fitted Pipeline.
            </p>
          </div>

          {/* Weight Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Scale className="w-4 h-4 text-slate-500" />
                Customer Weight
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2 py-0.5 cursor-pointer ${weightUnit === 'kg' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600'}`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-2 py-0.5 cursor-pointer ${weightUnit === 'lbs' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600'}`}
                  >
                    lbs
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {displayWeight} {weightUnit}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={weightUnit === 'kg' ? 30 : 66}
              max={weightUnit === 'kg' ? 140 : 308}
              step={weightUnit === 'kg' ? 0.5 : 1}
              value={displayWeight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{weightUnit === 'kg' ? '30 kg' : '66 lbs'}</span>
              <span>{weightUnit === 'kg' ? '140 kg' : '308 lbs'}</span>
            </div>
          </div>

          {/* Height Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Ruler className="w-4 h-4 text-slate-500" />
                Customer Height
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-2 py-0.5 cursor-pointer ${heightUnit === 'cm' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600'}`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('in')}
                    className={`px-2 py-0.5 cursor-pointer ${heightUnit === 'in' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-50 text-slate-600'}`}
                  >
                    in
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {displayHeight} {heightUnit}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={heightUnit === 'cm' ? 140 : 55}
              max={heightUnit === 'cm' ? 205 : 81}
              step={heightUnit === 'cm' ? 0.5 : 0.5}
              value={displayHeight}
              onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{heightUnit === 'cm' ? '140 cm' : '55 in'}</span>
              <span>{heightUnit === 'cm' ? '205 cm' : '81 in'}</span>
            </div>
          </div>

          {/* Age Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Calendar className="w-4 h-4 text-slate-500" />
                Customer Age
              </label>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {ageYears} years
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={80}
              step={1}
              value={ageYears}
              onChange={(e) => setAgeYears(parseInt(e.target.value, 10))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>16 years</span>
              <span>80 years</span>
            </div>
          </div>

          {/* VectorAssembler Feature Vector Inspector */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>PySpark MLlib Feature Vector</span>
              <span className="text-[11px] font-mono text-slate-500">DenseVector(3)</span>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs overflow-x-auto">
              <code>features = [{weightKg.toFixed(1)}, {ageYears.toFixed(1)}, {heightCm.toFixed(1)}]</code>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Constructed via <span className="font-mono text-slate-700">VectorAssembler(inputCols=['weight', 'age', 'height'], outputCol='features')</span>
            </p>
          </div>
        </div>

        {/* Right Column: Prediction Results & Probabilities */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sizing Banner Result */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Predicted Apparel Size
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
                    {prediction.predictedSize}
                  </span>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-emerald-600 text-sm block">
                      {(prediction.confidence * 100).toFixed(1)}% Confidence
                    </span>
                    <span>via {prediction.modelType}</span>
                  </div>
                </div>
              </div>

              {/* BMI Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-medium">
                  Body Mass Index (BMI)
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {prediction.bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </span>
                <span className="text-xs block text-slate-600 font-medium mt-0.5">
                  {prediction.bmiCategory}
                </span>
              </div>
            </div>

            {/* Probability Distribution Across All 7 Discovered Sizes */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                <span>Multi-Class Probability Distribution</span>
                <span className="text-slate-500 font-normal">Discovered Target Categories</span>
              </div>

              <div className="space-y-2.5">
                {prediction.probabilities.map((item) => {
                  const isTop = item.size === prediction.predictedSize;
                  const pct = Math.round(item.probability * 1000) / 10;
                  return (
                    <div key={item.size} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-mono font-semibold ${isTop ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                          Size {item.size}
                          {isTop && (
                            <span className="ml-2 text-[10px] text-emerald-600 font-medium">
                              (Selected)
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-600">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isTop ? 'bg-slate-900' : 'bg-slate-300'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mandatory Garment Sizing Disclaimer (Prompt #7) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4.5 flex items-start gap-3 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-amber-950 mb-0.5">
                Garment Measurement & Tailoring Disclaimer:
              </span>
              Predictions rendered by this PySpark machine learning pipeline are statistical approximations 
              derived from customer height, weight, and age distributions in the <code className="font-mono font-semibold">final_test.csv</code> dataset. 
              Sizing standards, ease allowances, and fits differ substantially across apparel brands, international regions, fabrics, 
              and garment silhouettes. These estimations are not guaranteed tailor measurements.
            </div>
          </div>

          {/* PySpark MLlib Pipeline Architecture Reference */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              How PySpark MLlib Executes This Prediction
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">1. Vector Assembler</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Packs continuous columns into a 3-element dense Vector: <code className="font-mono text-slate-800">[weight, age, height]</code>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">2. Decision Forest</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Evaluates 100 decision trees to cast votes, generating class probability vector <code className="font-mono text-slate-800">rawPrediction</code>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">3. IndexToString</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Inverts numeric index back to categorical label discovered during dataset preprocessing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
