import React, { useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { UploadCloud, CheckCircle, HelpCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const PestDetection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setResult(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a pest image first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/crop/pest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err: any) {
      setError('Inference failure. Check pest image parameters and size.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Pest Visual Classifier</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Insect & Pest Detection</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Upload crop insect photographs to classify species and get tailored organic/chemical treatment guidelines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Upload panel */}
        <div className="md:col-span-5 space-y-6">
          <GlassCard>
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-center hover:border-emerald-500 transition-colors duration-200 relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-15"
                />
                <div className="flex flex-col items-center justify-center space-y-3 py-6">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Pest Preview"
                      className="h-44 w-full object-cover rounded-2xl shadow-md"
                    />
                  ) : (
                    <>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold dark:text-slate-200">Drag & drop pest image</span>
                        <span className="block text-xs text-slate-400 mt-1">PNG, JPG, JPEG (Max 10MB)</span>
                      </div>
                    </>
                  )}
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
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50"
              >
                {loading ? 'Analyzing Insect Characteristics...' : 'Identify Pest'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results panel */}
        <div className="md:col-span-7 space-y-6">
          {loading && (
            <SkeletonLoader lines={5} />
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-3xl h-full min-h-[300px]">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800/40 p-4 mb-4">
                <HelpCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Awaiting Identification</h3>
              <p className="text-slate-400 max-w-xs text-xs">Upload an insect image on the left panel to execute our visual classification model.</p>
            </div>
          )}

          {!loading && result && (
            <GlassCard premium className="space-y-6">
              {/* Header card info */}
              <div className="flex items-start justify-between border-b dark:border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-semibold">Species Identified</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                    {result.pest_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {result.description}
                  </p>
                </div>
              </div>

              {/* Urgency and Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100/50 dark:bg-slate-800/20 border dark:border-slate-800 rounded-2xl flex items-center gap-2.5">
                  <ShieldAlert className={`h-5 w-5 ${
                    result.urgency_level === 'High' ? 'text-red-500' :
                    result.urgency_level === 'Medium' ? 'text-amber-500' : 'text-slate-500'
                  }`} />
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400 font-bold">Threat Level</span>
                    <span className="block text-sm font-bold capitalize">{result.urgency_level} Urgency</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-100/50 dark:bg-slate-800/20 border dark:border-slate-800 rounded-2xl flex items-center gap-2.5">
                  <div className="text-emerald-500 font-bold text-sm">
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400 font-bold">Classification</span>
                    <span className="block text-sm font-bold">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Treatments tabs */}
              <div className="space-y-5 pt-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Organic Control Plans</span>
                  </h4>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pl-5 list-disc leading-relaxed">
                    {result.organic_treatment.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t dark:border-slate-800 pt-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Chemical Treatment Action</span>
                  </h4>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pl-5 list-disc leading-relaxed">
                    {result.chemical_treatment.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
