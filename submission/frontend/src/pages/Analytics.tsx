import React from 'react';
import { GlassCard } from '../components/GlassCard';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { LineChart, BarChart as BarChartIcon, ScatterChart as ScatterIcon, Sprout } from 'lucide-react';

export const Analytics: React.FC = () => {
  // Scatter plot data: pH vs Yield (t/ha) for different crops
  const phYieldData = [
    { ph: 5.2, yield: 2.1, crop: 'Potato' },
    { ph: 5.5, yield: 2.8, crop: 'Potato' },
    { ph: 5.8, yield: 3.4, crop: 'Potato' },
    { ph: 6.0, yield: 3.9, crop: 'Wheat' },
    { ph: 6.2, yield: 4.1, crop: 'Wheat' },
    { ph: 6.5, yield: 4.5, crop: 'Rice' },
    { ph: 6.8, yield: 4.8, crop: 'Rice' },
    { ph: 7.0, yield: 4.4, crop: 'Corn' },
    { ph: 7.2, yield: 4.2, crop: 'Corn' },
    { ph: 7.5, yield: 3.2, crop: 'Cotton' },
    { ph: 7.8, yield: 2.9, crop: 'Cotton' }
  ];

  // NPK averages per crop type
  const npkAverageData = [
    { name: 'Rice', N: 85, P: 50, K: 42 },
    { name: 'Wheat', N: 75, P: 42, K: 38 },
    { name: 'Corn', N: 100, P: 58, K: 50 },
    { name: 'Cotton', N: 65, P: 40, K: 40 },
    { name: 'Potato', N: 110, P: 75, K: 125 }
  ];

  // Simulated carbon footprint estimation data (tCO2e per hectare)
  const carbonFootprintData = [
    { name: 'Rice', baseline: 2.4, smartfarm: 1.6 },
    { name: 'Wheat', baseline: 1.1, smartfarm: 0.8 },
    { name: 'Corn', baseline: 1.8, smartfarm: 1.3 },
    { name: 'Cotton', baseline: 1.4, smartfarm: 1.0 },
    { name: 'Potato', baseline: 0.9, smartfarm: 0.7 }
  ];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Advanced Analytics Portal</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Agricultural Data Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Visualize multi-dimensional correlations between soil chemical inputs, crop productivity yields, and carbon footprints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Soil pH vs Yield Scatter Chart */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ScatterIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Soil pH vs. Crop Yield Correlation</h4>
              <p className="text-[10px] text-slate-400">Analyzes yield outputs (t/ha) relative to soil pH scales.</p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis type="number" dataKey="ph" name="pH" unit=" pH" stroke="#94a3b8" fontSize={11} domain={[4, 9]} />
                <YAxis type="number" dataKey="yield" name="Yield" unit=" t/ha" stroke="#94a3b8" fontSize={11} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Scatter name="Crop Performance" data={phYieldData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* NPK Distribution Bar Chart */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BarChartIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-base font-bold">NPK Soil Concentrations per Crop</h4>
              <p className="text-[10px] text-slate-400">Average Nitrogen, Phosphorus, and Potassium requirements.</p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npkAverageData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="N" fill="#10b981" name="Nitrogen" />
                <Bar dataKey="P" fill="#3b82f6" name="Phosphorus" />
                <Bar dataKey="K" fill="#f59e0b" name="Potassium" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Carbon Footprint Area Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
            <Sprout className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-base font-bold">Carbon Footprint Mitigation Score</h4>
            <p className="text-[10px] text-slate-400">Compares traditional carbon emission indices to SmartFarm optimized irrigation and NPK applications (tCO2e/ha).</p>
          </div>
        </div>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={carbonFootprintData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSmartfarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'tCO2e/ha', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="baseline" stroke="#ef4444" fillOpacity={1} fill="url(#colorBaseline)" name="Traditional Sowing Carbon Index" />
              <Area type="monotone" dataKey="smartfarm" stroke="#10b981" fillOpacity={1} fill="url(#colorSmartfarm)" name="SmartFarm Optimised Carbon Index" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};
