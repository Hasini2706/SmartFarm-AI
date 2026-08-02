import React, { useState } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { UploadCloud, CheckCircle, HelpCircle, AlertCircle, FileDown, Leaf } from 'lucide-react';

export const DiseaseDetection: React.FC = () => {
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
      setError('Please select or drop a leaf image first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/crop/disease', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Inference failure. Check image properties and file format.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result || !result.report_id) return;
    
    // Trigger download in browser by opening report link
    window.open(`/api/v1/crop/report/${result.report_id}/download`, '_blank');
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Computer Vision Classifier</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Crop Disease Diagnosis</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Upload an image of a crop leaf (Rice, Wheat, Corn, Cotton, or Potato) to identify disease and get treatments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Upload column */}
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
                      alt="Leaf Preview"
                      className="h-44 w-full object-cover rounded-2xl shadow-md"
                    />
                  ) : (
                    <>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold dark:text-slate-200">Drag & drop crop image</span>
                        <span className="block text-xs text-slate-400 mt-1">PNG, JPG, JPEG (Max 10MB)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {file && (
                <div className="flex items-center gap-2 text-xs text-slate-400 px-1 truncate">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate font-semibold">{file.name}</span>
                </div>
              )}

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
                {loading ? 'Analyzing Leaf Features...' : 'Run Diagnostics'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results column */}
        <div className="md:col-span-7 space-y-6">
          {loading && (
            <SkeletonLoader lines={5} />
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-3xl h-full min-h-[300px]">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800/40 p-4 mb-4">
                <HelpCircle className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Awaiting Diagnosis</h3>
              <p className="text-slate-400 max-w-xs text-xs">Upload a leaf photograph on the left panel to execute our visual classification model.</p>
            </div>
          )}

          {!loading && result && (
            <GlassCard premium className="space-y-6">
              {/* Header card info */}
              <div className="flex items-start justify-between border-b dark:border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Model Output</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                    {result.disease_name}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-slate-500 capitalize mt-1">
                    Crop: {result.crop_name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Confidence</span>
                  <span className="block text-3xl font-extrabold text-emerald-500 mt-1">
                    {roundPct(result.confidence)}%
                  </span>
                </div>
              </div>

              {/* PDF download */}
              {result.report_id && (
                <button
                  onClick={downloadReport}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-500/15 font-semibold text-sm transition-all shadow-sm"
                >
                  <FileDown className="h-4.5 w-4.5" />
                  <span>Download Diagnostic Audit PDF</span>
                </button>
              )}

              {/* Diagnostic detail details */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="h-4 w-4 text-emerald-500" />
                    <span>Pathogen & Causes</span>
                  </h4>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed pl-5 list-disc">
                    {result.causes.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                    <span>Prevention Actions</span>
                  </h4>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed pl-5 list-disc">
                    {result.prevention.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                    <span>Treatment Options</span>
                  </h4>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed pl-5 list-disc">
                    {result.treatment.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">NPK / Soil Feeding Suggestion</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {result.fertilizer_recommendation}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

const roundPct = (num: number) => {
  return Math.round(num * 1000) / 10;
};
