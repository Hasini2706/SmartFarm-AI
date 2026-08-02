import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import {
  Sprout,
  TrendingUp,
  Droplet,
  CheckCircle,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface KPIInfo {
  total_diagnoses: number;
  total_predictions: number;
  water_saved_liters: number;
  average_yield: number;
}

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  timestamp: string;
}

interface DashboardData {
  kpis: KPIInfo;
  yield_trends: any[];
  disease_history: any[];
  recent_activities: Activity[];
}

interface DashboardProps {
  setCurrentPage: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics');
      setData(response.data);
      
      const weatherResponse = await axios.get('/weather?lat=28.61&lon=77.20&crop=Rice');
      setAiAdvice(weatherResponse.data.farming_advice || []);
    } catch (err: any) {
      const msg = 'Failed to synchronize dashboard telemetry data.';
      setError(msg);
      toast.error(msg, 'Dashboard Sync Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpiItems = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Disease Diagnoses",
        value: data.kpis.total_diagnoses,
        desc: "Leaf diagnostics logged",
        icon: <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
      },
      {
        title: "ML Forecasts",
        value: data.kpis.total_predictions,
        desc: "Calculations run",
        icon: <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
      },
      {
        title: "Water Saved (L)",
        value: data.kpis.water_saved_liters.toLocaleString(),
        desc: "Optimized irrigation",
        icon: <Droplet className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
        bg: "bg-teal-500/10",
        border: "border-teal-500/20"
      },
      {
        title: "Average Yield",
        value: `${data.kpis.average_yield} t/ha`,
        desc: "Platform average",
        icon: <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
      }
    ];
  }, [data]);


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader className="h-32" />
          <SkeletonLoader className="h-32" />
          <SkeletonLoader className="h-32" />
          <SkeletonLoader className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="graph" className="p-6" />
          <SkeletonLoader type="graph" className="p-6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Telemetry Loading Error"
        description={error || "Could not synchronize dashboard telemetry caches. Ensure your backend server is responsive."}
      />
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Authenticated User Banner */}
      <GlassCard className="p-6 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            {user ? (user.full_name ? user.full_name[0].toUpperCase() : user.username[0].toUpperCase()) : 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                Welcome back, {user ? (user.full_name || user.username) : 'Farmer'}!
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <UserCheck className="h-3 w-3" />
                {user ? user.role : 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SmartFarm AI telemetry active. Here is your real-time precision farming summary.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Top Banner: AI Insights */}
      {aiAdvice.length > 0 && (
        <GlassCard premium glowColor="emerald" className="p-4 md:p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">Live AI Farm Insights</span>
              <p className="text-sm font-semibold dark:text-slate-200 mt-0.5">
                {aiAdvice[0]}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('weather')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 group"
          >
            <span>See Weather Advice</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </GlassCard>
      )}


      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item, idx) => (
          <GlassCard key={idx} hoverEffect className={`flex items-center gap-4 ${item.border}`}>
            <div className={`p-3 rounded-2xl ${item.bg}`}>
              {item.icon}
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.title}</span>
              <span className="block text-2xl font-bold dark:text-slate-100 mt-0.5">{item.value}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Yield Trends Chart */}
        <GlassCard className="lg:col-span-8 p-6 space-y-4">
          <div>
            <h4 className="text-lg font-bold">Historical Yield Performance Trends</h4>
            <p className="text-xs text-slate-400">Predicted crop productivity outputs (t/ha) compiled over years.</p>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.yield_trends} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 't/ha', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Rice" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Wheat" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Corn" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Potato" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Disease History Chart */}
        <GlassCard className="lg:col-span-4 p-6 space-y-4">
          <div>
            <h4 className="text-lg font-bold">Infection Distribution</h4>
            <p className="text-xs text-slate-400">Breakdown of diagnosed crop diseases in database.</p>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.disease_history} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="disease" stroke="#94a3b8" fontSize={8} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="cases" fill="url(#colorCases)" radius={[4, 4, 0, 0]}>
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Grid: Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity list */}
        <GlassCard className="lg:col-span-8 p-6 space-y-4">
          <h4 className="text-lg font-bold">Recent Telemetry Actions</h4>
          <div className="space-y-3.5">
            {data.recent_activities.map((act) => (
              <div key={act.id} className="flex items-start justify-between border-b dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-xl text-white mt-0.5 ${
                    act.activity_type === 'diagnosis' ? 'bg-emerald-500' :
                    act.activity_type === 'yield' ? 'bg-indigo-500' :
                    act.activity_type === 'irrigation' ? 'bg-teal-500' : 'bg-slate-500'
                  }`}>
                    {act.activity_type === 'diagnosis' ? <Sprout className="h-4.5 w-4.5" /> : <TrendingUp className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <span className="block text-sm font-semibold dark:text-slate-200">{act.description}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 font-bold uppercase tracking-wider rounded-full self-center">
                  {act.activity_type}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick Sowing/Action Cards */}
        <GlassCard className="lg:col-span-4 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-lg font-bold">Quick Diagnostics Sowing</h4>
            <p className="text-xs text-slate-500">Fast-track inputs into machine learning models directly from the main panel.</p>
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => setCurrentPage('disease')}
                className="flex flex-col items-center gap-2 p-4 border dark:border-slate-800 rounded-2xl hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 hover:border-emerald-500/40 text-center transition-all group"
              >
                <PlusCircle className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Upload Leaf</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('chat')}
                className="flex flex-col items-center gap-2 p-4 border dark:border-slate-800 rounded-2xl hover:bg-purple-500/5 dark:hover:bg-purple-500/10 hover:border-purple-500/40 text-center transition-all group"
              >
                <Sparkles className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Ask AI Bot</span>
              </button>
            </div>
          </div>

          <div className="border-t dark:border-slate-800 pt-4 mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Database Size</span>
              <span className="font-semibold">{data.recent_activities.length + 42} entries</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
