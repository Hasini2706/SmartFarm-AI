import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/GlassCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import {
  CloudSun,
  Droplet,
  Wind,
  Compass,
  CloudRain,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Weather: React.FC = () => {
  const toast = useToast();
  const [lat, setLat] = useState<number>(28.61);
  const [lon, setLon] = useState<number>(77.20);
  const [crop, setCrop] = useState('Rice');
  
  // Soil states to pass for contextual advice
  const [soilN, setSoilN] = useState<number>(50);
  const [soilP, setSoilP] = useState<number>(45);
  const [soilK, setSoilK] = useState<number>(40);
  const [soilPh, setSoilPh] = useState<number>(6.5);

  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `/weather?lat=${lat}&lon=${lon}&crop=${crop}&soil_n=${soilN}&soil_p=${soilP}&soil_k=${soilK}&soil_ph=${soilPh}`
      );
      setWeatherData(response.data);
      toast.success(`Weather synced for Lat: ${lat}, Lon: ${lon}`, 'Weather Telemetry Live');
    } catch (err: any) {
      const msg = 'Could not query weather reports. Validate server connectivity.';
      setError(msg);
      toast.error(msg, 'Weather Fetch Failure');
    } finally {
      setLoading(false);
    }
  }, [lat, lon, crop, soilN, soilP, soilK, soilPh, toast]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };


  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Page header and controller form */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1 shrink-0">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Microclimate Monitoring</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">Weather Intelligence</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review real-time conditions and context-specific farming insights based on forecast variables.</p>
        </div>

        {/* Form controller */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 bg-white/40 dark:bg-slate-900/30 p-2 border dark:border-slate-800 rounded-3xl backdrop-blur-md w-full lg:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-r dark:border-slate-800">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <input
              type="number"
              step="0.01"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              placeholder="Lat"
              className="w-14 bg-transparent outline-none text-xs font-semibold"
              title="Latitude"
            />
            <input
              type="number"
              step="0.01"
              value={lon}
              onChange={(e) => setLon(Number(e.target.value))}
              placeholder="Lon"
              className="w-14 bg-transparent outline-none text-xs font-semibold"
              title="Longitude"
            />
          </div>

          <div className="px-3 border-r dark:border-slate-800 py-1 flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Crop</span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-transparent outline-none text-xs font-semibold"
            >
              {['Rice', 'Wheat', 'Corn', 'Cotton', 'Potato'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 ml-auto"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <SkeletonLoader className="h-56" />
            <SkeletonLoader className="h-44" />
          </div>
          <div className="lg:col-span-4">
            <SkeletonLoader className="h-[400px]" />
          </div>
        </div>
      )}

      {error && !loading && (
        <EmptyState
          title="Could Not Load Weather"
          description={error}
        />
      )}

      {!loading && weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Weather parameters + Forecasts */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary weather card */}
            <GlassCard premium glowColor="slate" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 text-center md:text-left space-y-3 md:border-r dark:border-slate-800 md:pr-6">
                <div className="flex justify-center md:justify-start items-center gap-3">
                  <CloudSun className="h-10 w-10 text-emerald-500 shrink-0" />
                  <div>
                    <span className="block text-3xl font-extrabold dark:text-slate-100">{weatherData.weather.temperature}°C</span>
                    <span className="block text-xs text-slate-400 capitalize">{weatherData.weather.condition}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">GPS: {lat.toFixed(2)}°N, {lon.toFixed(2)}°E</p>
              </div>

              {/* Multi metrics columns */}
              <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                <div className="space-y-1">
                  <Droplet className="h-4 w-4 text-teal-500 mx-auto md:mx-0" />
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
                  <span className="block text-sm font-bold">{weatherData.weather.humidity}%</span>
                </div>
                
                <div className="space-y-1">
                  <Wind className="h-4 w-4 text-blue-500 mx-auto md:mx-0" />
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Wind</span>
                  <span className="block text-sm font-bold">{weatherData.weather.wind_speed} km/h</span>
                </div>
                
                <div className="space-y-1">
                  <Compass className="h-4 w-4 text-amber-500 mx-auto md:mx-0" />
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Pressure</span>
                  <span className="block text-sm font-bold">{weatherData.weather.pressure} hPa</span>
                </div>
                
                <div className="space-y-1">
                  <CloudRain className="h-4 w-4 text-indigo-500 mx-auto md:mx-0" />
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Rain Prob</span>
                  <span className="block text-sm font-bold">{weatherData.weather.rain_probability}%</span>
                </div>
              </div>
            </GlassCard>

            {/* 5-day Forecast */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold">5-Day Meteorological Forecast</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {weatherData.weather.forecast.map((fc: any, idx: number) => (
                  <GlassCard key={idx} className="p-4 text-center space-y-3 hover:border-slate-300 dark:hover:border-slate-800 transition-colors">
                    <span className="block text-[10px] text-slate-400 font-bold">{fc.date.split('-')[2]}/{fc.date.split('-')[1]}</span>
                    <CloudSun className="h-6 w-6 text-slate-400 mx-auto" />
                    <div>
                      <span className="block text-sm font-extrabold">{fc.temp}°C</span>
                      <span className="block text-[10px] text-slate-400 truncate capitalize">{fc.condition.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-500 font-semibold">
                      <CloudRain className="h-3 w-3" />
                      <span>{fc.rain_probability}%</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>

          {/* AI Weather Farming Advice */}
          <div className="lg:col-span-4">
            <GlassCard premium glowColor="emerald" className="h-full flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold">AI Agronomic Advice</h4>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our intelligence engine analyzed your crop type (<strong>{crop}</strong>), soil NPK, and local climate forecast variables to generate the following guidelines:
                </p>

                <div className="space-y-3.5 pt-2">
                  {weatherData.farming_advice.map((adv: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil details wrapper inside sidebar for compactness */}
              <div className="border-t dark:border-slate-800 pt-4 mt-6 space-y-3 text-xs font-semibold">
                <span className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Configure soil values</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Nitrogen (N)</label>
                    <input
                      type="number"
                      value={soilN}
                      onChange={(e) => setSoilN(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilPh}
                      onChange={(e) => setSoilPh(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
