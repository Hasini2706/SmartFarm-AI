import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HelpCircle, Calculator, TrendingUp, DollarSign } from 'lucide-react';

export const YieldPrediction: React.FC = () => {
  const toast = useToast();
  const [crop, setCrop] = useState('Rice');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [area, setArea] = useState<number>(10);
  const [rainfall, setRainfall] = useState<number>(850);
  const [temperature, setTemperature] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(65);
  const [soilType, setSoilType] = useState('Alluvial');
  const [season, setSeason] = useState('Kharif');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const crops = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato'];
  const states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'];
  const soils = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy'];
  const seasons = ['Kharif', 'Rabi', 'Summer'];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('/predictions/yield', {
        crop,
        state,
        area: Number(area),
        rainfall: Number(rainfall),
        temperature: Number(temperature),
        humidity: Number(humidity),
        soil_type: soilType,
        season
      });
      setResult(response.data);
      toast.success(`Predicted yield: ${response.data.predicted_yield} t/ha (${response.data.predicted_production} tonnes total)`, 'Yield Forecast Complete');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Inference failed. Check values and verify model presence.';
      setError(msg);
      toast.error(msg, 'Yield Forecast Failed');
    } finally {
      setLoading(false);
    }
  }, [crop, state, area, rainfall, temperature, humidity, soilType, season, toast]);


  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">ML Regression Modeler</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Yield & Production Predictor</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Simulate agricultural productivity thresholds by supplying land area, climate telemetry, and localized soils.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5">
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">State Region</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  >
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">District Name</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Sowing Area (hectares)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Rainfall (mm)</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-2 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
              </div>

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
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  >
                    {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
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
                <Calculator className="h-4.5 w-4.5" />
                <span>Calculate Yield Forecast</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results / Charts panel */}
        <div className="lg:col-span-7">
          {loading && (
            <SkeletonLoader lines={6} />
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-3xl h-full min-h-[350px]">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800/40 p-4 mb-4">
                <HelpCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Simulation Awaiting</h3>
              <p className="text-slate-400 max-w-xs text-xs">Enter soil and climate telemetry details on the left, then click execute to calculate crop production matrices.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <GlassCard className="border border-indigo-500/20">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Yield Forecast</span>
                  <span className="block text-3xl font-extrabold text-indigo-500 mt-1">{result.predicted_yield}</span>
                  <span className="block text-[9px] text-slate-400 mt-1">Tonnes per Hectare (t/ha)</span>
                </GlassCard>

                <GlassCard className="border border-emerald-500/20">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Production</span>
                  <span className="block text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{result.predicted_production}</span>
                  <span className="block text-[9px] text-slate-400 mt-1">Tonnes total (Yield * Area)</span>
                </GlassCard>

                <GlassCard className="border border-amber-500/20">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Confidence</span>
                  <span className="block text-3xl font-extrabold text-amber-500 mt-1">{Math.round(result.confidence * 100)}%</span>
                  <span className="block text-[9px] text-slate-400 mt-1">Regression pipeline weight</span>
                </GlassCard>
              </div>

              {/* Sensitivity graph */}
              <GlassCard className="p-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold">Rainfall Sensitivity Analysis</h4>
                  <p className="text-xs text-slate-400">Total simulated production (tonnes) based on varying rainfall levels.</p>
                </div>
                <div className="h-56 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.graph_data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="scenario" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Tonnes', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                      <Bar dataKey="production" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Production (t)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
