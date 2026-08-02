import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { Sprout, HelpCircle, ArrowRight } from 'lucide-react';

interface RecommendationDetail {
  crop: string;
  probability: number;
}

export const CropRecommendation: React.FC = () => {
  const toast = useToast();
  const [N, setN] = useState<number>(80);
  const [P, setP] = useState<number>(45);
  const [K, setK] = useState<number>(40);
  const [pH, setPH] = useState<number>(6.2);
  const [temperature, setTemperature] = useState<number>(24);
  const [humidity, setHumidity] = useState<number>(75);
  const [rainfall, setRainfall] = useState<number>(1100);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationDetail[] | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('/crop/recommendation', {
        N: Number(N),
        P: Number(P),
        K: Number(K),
        pH: Number(pH),
        temperature: Number(temperature),
        humidity: Number(humidity),
        rainfall: Number(rainfall)
      });
      const recs = response.data.recommendations || [];
      setResult(recs);
      if (recs.length > 0) {
        toast.success(`Top recommendation: ${recs[0].crop} (${Math.round(recs[0].probability * 100)}% match)`, 'Crop Recommendation Ready');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Recommendation request failed. Verify backend services are active.';
      setError(msg);
      toast.error(msg, 'Recommendation Error');
    } finally {
      setLoading(false);
    }
  }, [N, P, K, pH, temperature, humidity, rainfall, toast]);


  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Soil & Climate Suitability Matching</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Crop Recommendation Engine</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Analyze soil nutrient concentrations (NPK) and seasonal weather metrics to identify the most suitable crops for cultivation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input panel */}
        <div className="lg:col-span-5">
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
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
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
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
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
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
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    placeholder="mg/kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Soil pH (0.0 - 14.0)</label>
                  <input
                    type="number"
                    min="3.0"
                    max="9.5"
                    step="0.1"
                    required
                    value={pH}
                    onChange={(e) => setPH(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Average Temp (°C)</label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    required
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Average Rainfall (mm)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
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
                <Sprout className="h-4.5 w-4.5" />
                <span>Run Crop Recommendation</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Output list panel */}
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
              <p className="text-slate-400 max-w-xs text-xs">Configure your soil chemical components and environmental averages to determine the ideal crop matches.</p>
            </div>
          )}

          {!loading && result && (
            <GlassCard premium className="space-y-6">
              <div>
                <h4 className="text-lg font-bold">Top Crop Recommendations</h4>
                <p className="text-xs text-slate-400">Classified probability match scores compiled from agricultural rulesets.</p>
              </div>

              <div className="space-y-5">
                {result.map((rec, idx) => {
                  const probPct = Math.round(rec.probability * 1000) / 10;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold dark:text-slate-200">{rec.crop}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{probPct}% Match</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(1, probPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Best choice prompt */}
              {result.length > 0 && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <Sprout className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Based on these NPK values, <strong>{result[0].crop}</strong> is the optimal planting recommendation. Prepare seedbed nursery parameters to initiate cultivation.
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
