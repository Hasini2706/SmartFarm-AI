import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { FileDown, Calendar, Sprout, Download } from 'lucide-react';

interface DiagnosisRecord {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  created_at: string;
}

export const Reports: React.FC = () => {
  const toast = useToast();
  const [history, setHistory] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics');
      const activities = response.data.recent_activities || [];
      const diagnoses = activities
        .filter((act: any) => act.activity_type === 'diagnosis')
        .map((act: any) => {
          const parts = act.description.split(' with ');
          const crop = act.description.split('Diagnosed ')[1]?.split(' with')[0] || 'Crop';
          const disease = parts[1]?.split(' (Conf:')[0] || 'Leaf Condition';
          const confStr = act.description.split('Conf: ')[1]?.split('%)')[0] || '80';
          const confidence = Number(confStr) / 100.0;
          return {
            id: act.id,
            crop_name: crop,
            disease_name: disease,
            confidence: confidence,
            created_at: act.timestamp
          };
        });
      setHistory(diagnoses);
    } catch (err) {
      const msg = 'Failed to fetch historical diagnostic logs.';
      setError(msg);
      toast.error(msg, 'Reports Fetch Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDownload = useCallback((id: number, crop: string) => {
    toast.info(`Generating PDF audit report for ${crop}...`, 'PDF Export');
    window.open(`/api/v1/crop/report/${id}/download`, '_blank');
  }, [toast]);


  if (loading) {
    return <SkeletonLoader type="table" className="p-6" />;
  }

  if (error && history.length === 0) {
    return <EmptyState title="Reports Fetch Error" description={error} />;
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Diagnosis Audit Logs</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Historical Health Reports</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Access and download PDF audits of all crop disease diagnoses run on your farm.</p>
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No Diagnosis History"
          description="You haven't run any crop leaf diagnosis audits yet. Head over to the Crop Disease page to run your first computer vision scan."
        />
      ) : (
        <GlassCard premium className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-semibold">
              <thead>
                <tr className="border-b dark:border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Crop Name</th>
                  <th className="py-4 px-6">Diagnosed Disease</th>
                  <th className="py-4 px-6">Accuracy</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-850">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{new Date(record.created_at).toLocaleDateString()} {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 font-bold dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Sprout className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{record.crop_name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold dark:text-slate-300">
                      {record.disease_name}
                    </td>

                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {Math.round(record.confidence * 100)}%
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownload(record.id, record.crop_name)}
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 transition-colors"
                        title="Download PDF Report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </GlassCard>
        )}
    </div>
  );
};
