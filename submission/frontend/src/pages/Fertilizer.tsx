import React, { useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { HelpCircle, Beaker, CheckCircle, Info } from 'lucide-react';

export const Fertilizer: React.FC = () => {
  const [soilType, setSoilType] = useState('Alluvial');
  const [crop, setCrop] = useState('Rice');
  const [N, setN] = useState<number>(60);
  const [P, setP] = useState<number>(40);
  const [K, setK] = useState<number>(35);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const soils = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy'];
  const crops = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('/crop/fertilizer', {
        soil_type: soilType,
        crop,
        N: Number(N),
        P: Number(P),
        K: Number(K)
      });
      setResult(response.data);
    } catch (err: any) {
      setError('Fertilizer simulation error. Verify backend is operational.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Decision Tree Diagnostic</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Fertilizer Recommendation</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Input your soil nutrient components and crop type to predict the most effective chemical or organic fertilizer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-5">
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  >
                    {soils.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Target Crop</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  >
                    {crops.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    required
                    value={N}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    placeholder="mg/kg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    required
                    value={P}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    placeholder="mg/kg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    min="0"
                    max="250"
                    required
                    value={K}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    placeholder="mg/kg"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Beaker className="h-4.5 w-4.5" />
                <span>Predict Optimal Fertilizer</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          {loading && (
            <SkeletonLoader lines={6} />
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-3xl h-full min-h-[350px]">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800/40 p-4 mb-4">
                <HelpCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Engine Awaiting Input</h3>
              <p className="text-slate-400 max-w-xs text-xs">Enter soil and crop inputs on the left, then click execute to calculate the best matching fertilizer.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Output value card */}
              <GlassCard premium className="border border-emerald-500/20 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Recommended Product</span>
                  <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {result.recommended_fertilizer}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <Beaker className="h-6 w-6" />
                </div>
              </GlassCard>

              {/* Reasons list */}
              <GlassCard className="p-6 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 dark:text-slate-200">
                  <Info className="h-4 w-4 text-emerald-500" />
                  <span>Why this was recommended:</span>
                </h4>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 leading-relaxed">
                  {result.reasons.map((r: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Application tips */}
              <GlassCard className="p-6 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 dark:text-slate-200">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>Application Guidelines:</span>
                </h4>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 leading-relaxed">
                  {result.application_tips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
