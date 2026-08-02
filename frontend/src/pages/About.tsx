import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { Database, ShieldCheck, Cpu, Code2, LineChart, Network } from 'lucide-react';

export const About: React.FC = () => {
  const specs = [
    {
      title: "Model Pipeline Specs",
      desc: "Our predictive modeling utilizes Scikit-learn random forests and decision trees trained on custom physical and historical datasets. Features are mapped using robust one-hot encoding vectors.",
      icon: <Cpu className="h-6 w-6 text-emerald-500" />
    },
    {
      title: "Visual Feature Classifier",
      desc: "Images are processed client-side or server-side using OpenCV. Features (shape boundaries, color intensities in HSV scale) are flattened into a 32x32 spatial grid and evaluated via a RandomForestClassifier.",
      icon: <Network className="h-6 w-6 text-indigo-500" />
    },
    {
      title: "FastAPI Backend Layer",
      desc: "Asynchronous endpoints built on FastAPI. Integrates SQLite database via SQLAlchemy, password hashing with passlib/bcrypt, and standard JSON Web Token signatures.",
      icon: <Code2 className="h-6 w-6 text-teal-500" />
    },
    {
      title: "Interactive UX Layer",
      desc: "A fully type-safe frontend built in TypeScript using Vite, Tailwind CSS, Framer Motion, and Recharts. Designed with glassmorphic cards and automated dark mode themes.",
      icon: <LineChart className="h-6 w-6 text-amber-500" />
    }
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Architecture & Methodologies</span>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-800 dark:text-slate-100">
          About SmartFarm AI Platform
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-3xl text-sm leading-relaxed">
          SmartFarm AI represents a highly modular SaaS application designed to solve critical precision farming challenges. By combining machine learning, computer vision, weather telemetry caches, and rule-based agronomic guidance engines, we provide actionable dashboard parameters to growers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {specs.map((item, idx) => (
          <GlassCard key={idx} hoverEffect className="flex gap-4">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 w-fit h-fit shrink-0">
              {item.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold">{item.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Flow diagram section */}
      <GlassCard className="p-6 md:p-8 space-y-6">
        <h4 className="text-xl font-bold border-b dark:border-slate-800 pb-3">Data Flow & Processing Architecture</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center text-center">
          <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/20 border dark:border-slate-800">
            <span className="block font-bold text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">1. Input Ingestion</span>
            <p className="text-xs text-slate-500">Image sensors (leaf uploads) or environmental parameters (soil, weather coordinates) are passed via secure REST headers.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/20 border dark:border-slate-800">
            <span className="block font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">2. Inference Engine</span>
            <p className="text-xs text-slate-500">FastAPI backend parses payload schemas, triggers image feature extraction or reads cached weather, and feeds models loaded in server memory.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/20 border dark:border-slate-800">
            <span className="block font-bold text-sm text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">3. Aggregated Outputs</span>
            <p className="text-xs text-slate-500">Returns JSON forecasts, triggers PDF diagnostic generation, updates DB audit histories, and renders dynamic dashboard charts.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
