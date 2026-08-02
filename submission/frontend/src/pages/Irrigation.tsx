import React, { useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { HelpCircle, Droplets, AlertTriangle, Calendar } from 'lucide-react';

export const Irrigation: React.FC = () => {
  const [weather, setWeather] = useState('Sunny');
  const [soilMoisture, setSoilMoisture] = useState<number>(35);
  const [temperature, setTemperature] = useState<number>(30);
  const [humidity, setHumidity] = useState<number>(55);
  const [cropStage, setCropStage] = useState('Mid');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('/predictions/irrigation', {
        weather,
        soil_moisture: Number(soilMoisture),
        temperature: Number(temperature),
        humidity: Number(humidity),
        crop_stage: cropStage
      });
      setResult(response.data);
    } catch (err: any) {
      setError('Inference failed. Check values and verify server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Micro-irrigation Flow Simulator</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Smart Irrigation Predictor</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Calculate specific water requirements (liters/m²) and configure localized irrigation timetables based on crop growth stages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-5">
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Weather Condition</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                >
                  {['Sunny', 'Cloudy', 'Rainy'].map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Soil Moisture level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Relative Humidity (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Crop Growth Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                >
                  {['Initial', 'Mid', 'Late'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
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
                <Droplets className="h-4.5 w-4.5" />
                <span>Calculate Water Needed</span>
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
              <h3 className="text-lg font-semibold mb-1">Simulator Awaiting</h3>
              <p className="text-slate-400 max-w-xs text-xs">Enter local moisture telemetry on the left, then click execute to calculate required water flow rates.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Output value card */}
              <GlassCard premium className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center border border-teal-500/20">
                <div className="sm:col-span-5 text-center sm:text-left sm:border-r dark:border-slate-800 sm:pr-6 space-y-1">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Water Required</span>
                  <span className="block text-4xl font-extrabold text-teal-600 dark:text-teal-400">
                    {result.water_needed} <span className="text-base font-bold text-slate-400">L/m²</span>
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-1">Evapotranspiration calibrated flow</span>
                </div>
                
                <div className="sm:col-span-7 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommended Schedule</span>
                    <p className="text-sm font-semibold mt-1 dark:text-slate-200 leading-snug">
                      {result.schedule}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Warning list card */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h4 className="text-base font-bold">Irrigation System Warnings</h4>
                </div>
                
                <div className="space-y-3.5">
                  {result.warnings.map((msg: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{msg}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
