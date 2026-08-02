import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { Save, User, Key, MapPin, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // Settings preferences loaded from localStorage or default
  const [defaultLat, setDefaultLat] = useState<number>(
    Number(localStorage.getItem('pref_lat') || '28.61')
  );
  const [defaultLon, setDefaultLon] = useState<number>(
    Number(localStorage.getItem('pref_lon') || '77.20')
  );
  const [owmKey, setOwmKey] = useState<string>(
    localStorage.getItem('pref_owm_key') || ''
  );
  const [geminiKey, setGeminiKey] = useState<string>(
    localStorage.getItem('pref_gemini_key') || ''
  );

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pref_lat', defaultLat.toString());
    localStorage.setItem('pref_lon', defaultLon.toString());
    localStorage.setItem('pref_owm_key', owmKey);
    localStorage.setItem('pref_gemini_key', geminiKey);
    
    // Alert user
    setSaved(true);
    toast.success('Configuration preferences saved successfully.', 'Settings Updated');
    setTimeout(() => setSaved(false), 3000);
  };


  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Control Panel</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Platform Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure default agronomic coordinates, manage API integration credentials, and edit user parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-4">
          <GlassCard className="text-center space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-emerald-500/10">
              {user ? user.username[0].toUpperCase() : 'F'}
            </div>
            <div>
              <h4 className="text-lg font-bold">{user ? user.full_name || user.username : 'Guest Farmer'}</h4>
              <span className="text-xs text-slate-400 capitalize">{user ? user.role : 'Guest'} Account</span>
            </div>
            
            <div className="border-t dark:border-slate-800 pt-4 text-xs space-y-2.5 font-semibold text-slate-500 text-left">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                <span className="block dark:text-slate-300 truncate">{user ? user.email : 'guest@smartfarm.ai'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Registered On</span>
                <span className="block dark:text-slate-300">2026-07-03</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Configurations form */}
        <div className="md:col-span-8">
          <GlassCard>
            <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold">
              {/* Coordinates */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Default Agronomic Geolocation</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Latitude Coordinate</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={defaultLat}
                      onChange={(e) => setDefaultLat(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Longitude Coordinate</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={defaultLon}
                      onChange={(e) => setDefaultLon(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                  <Key className="h-4.5 w-4.5 text-emerald-500" />
                  <span>API Integration Credentials</span>
                </h4>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-400 mb-1">OpenWeatherMap API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="Insert OWM token for live forecast"
                      value={owmKey}
                      onChange={(e) => setOwmKey(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Gemini API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="Insert Gemini API key for live chatbot response"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/50 border dark:border-slate-850 dark:bg-slate-900/40 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {saved && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-xl font-bold">
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>Preferences saved successfully. Default settings updated!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/15 flex justify-center items-center gap-2"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Save Configuration Preferences</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
