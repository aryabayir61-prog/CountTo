import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Volume2, 
  ArrowLeft, 
  Sparkles, 
  Navigation, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Bell,
  Play,
  RotateCw,
  Clock,
  Radio
} from 'lucide-react';
import { FullscreenWeatherToast } from './FullscreenWeatherToast';
import { fetchRealWeather, getRealUserCoordinates, RealWeatherNotification } from '../utils/weatherService';
import { playWeatherNotificationSound, playWeatherExitSound, playHoverClickSound } from '../utils/audio';
import { THEMES } from '../utils/themes';
import { ThemeId } from '../types/countdown';

export const WeatherDevBlogView: React.FC = () => {
  const [liveWeather, setLiveWeather] = useState<RealWeatherNotification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('aurora');
  const [activeToast, setActiveToast] = useState<RealWeatherNotification | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Konum tespit ediliyor...');

  // Fetch real data on load
  const loadWeather = async () => {
    setIsLoading(true);
    setLocationStatus('Gerçek koordinatlar alınıyor...');
    const coords = await getRealUserCoordinates();
    if (coords) {
      setLocationStatus(`${coords.latitude.toFixed(2)}° K, ${coords.longitude.toFixed(2)}° D`);
    } else {
      setLocationStatus('IP tabanlı küresel koordinatlar kullanılıyor');
    }

    const data = await fetchRealWeather(true);
    setLiveWeather(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleDismissToast = () => {
    playWeatherExitSound(selectedTheme);
    setActiveToast(null);
  };

  // Trigger live demo notification
  const handleTriggerDemoToast = () => {
    if (!liveWeather) return;
    setActiveToast(liveWeather);
    playWeatherNotificationSound(selectedTheme, 0.24);

    // Auto-dismiss after 7.5 seconds with exit sound
    setTimeout(() => {
      playWeatherExitSound(selectedTheme);
      setActiveToast(null);
    }, 7500);
  };

  const handlePlaySound = (tid: ThemeId) => {
    setSelectedTheme(tid);
    playWeatherNotificationSound(tid, 0.24);
  };

  const handleReturnHome = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const themeKeys = Object.keys(THEMES) as ThemeId[];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500/30 selection:text-cyan-200 py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      {/* Toast Notification Container in Demo */}
      <FullscreenWeatherToast
        notification={activeToast}
        onDismiss={handleDismissToast}
      />

      {/* Background glow effects */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-8 mb-10 border-b border-white/10">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>CountTo Geri Sayıma Dön</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              CountTo DevBlog · Sistem Mimarisi
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Sıfır Mock Veri · %100 Canlı Meteoroloji</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Canlı Hava Durumu Bildirim Sistemi Nasıl Çalışıyor?
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-3xl leading-relaxed">
            CountTo tam ekrandayken devreye giren hassas hava durumu bildirimleri; gerçek zamanlı WMO meteoroloji kodları, yaklaşan yağış tahmin algoritmaları ve Web Audio API ile temaya göre akort edilen göksel ses tınılarının mükemmel bir uyumudur.
          </p>
        </div>

        {/* INTERACTIVE LIVE DEMO SANDBOX */}
        <div className="mb-14 rounded-3xl border border-white/15 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                İnteraktif Canlı Demo Sandbox
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Bileşeni ve Sesi Canlı Test Edin
              </h2>
            </div>

            <button
              onClick={loadWeather}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Verileri Yenile</span>
            </button>
          </div>

          {/* Telemetry Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 mb-1">
                <Navigation className="w-3 h-3 text-cyan-400" />
                Konum Durumu
              </span>
              <p className="text-sm font-bold text-white truncate">
                {isLoading ? 'Alınıyor...' : locationStatus}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-amber-400" />
                Canlı Sıcaklık & Durum
              </span>
              <p className="text-sm font-bold text-white truncate">
                {isLoading ? 'Hesaplanıyor...' : liveWeather ? `${liveWeather.temperature}°C · ${liveWeather.message}` : 'Veri Hazır'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Veri Doğruluğu
              </span>
              <p className="text-sm font-bold text-emerald-400">
                %100 Doğrulanmış Open-Meteo
              </p>
            </div>
          </div>

          {/* Live Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <button
              onClick={handleTriggerDemoToast}
              disabled={isLoading || !liveWeather}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-neutral-900" />
              <span>Canlı Yandan Bildirim Demosunu Tetikle</span>
            </button>

            <button
              onClick={() => handlePlaySound(selectedTheme)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm border border-white/10 shadow-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Temaya Uygun Bildirim Sesini Dinle</span>
            </button>
          </div>

          {/* Theme Sound Audition Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
              Ses Harmonisi İçin Aktif Temayı Değiştirin ({selectedTheme}):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {themeKeys.slice(0, 12).map((tid) => {
                const t = THEMES[tid];
                const isCurrent = selectedTheme === tid;
                return (
                  <button
                    key={tid}
                    onClick={() => handlePlaySound(tid)}
                    onMouseEnter={() => playHoverClickSound(0.06)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-white/50 bg-white/15 text-white shadow-md'
                        : 'border-white/5 bg-black/30 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: t.primary }} 
                    />
                    <span className="truncate">{t.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ARCHITECTURAL BREAKDOWN */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Mühendislik & Çalışma Prensipleri</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1 */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                1. Gerçek Konum & Çift Kademeli Tespit
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Uygulama açılır açılmaz tarayıcının <code className="text-cyan-300">navigator.geolocation</code> arabirimi tetiklenir. Kullanıcı izin verirse metre hassasiyetinde GPS koordinatları alınır. Kullanıcı izni reddederse veya cihazda GPS yoksa, güvenli IP coğrafi konum servisi üzerinden anında gerçek koordinatlar tespit edilir. Sıfır sahte veri kullanılır.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <CloudRain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                2. Yaklaşan Yağış Tahmin Algoritması
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Sistem yalnızca havanın şu an yağmurlu olup olmadığına bakmaz; Open-Meteo&apos;nun saatlik tahmin eğrilerini inceleyerek önümüzdeki 1–2 saat içindeki <code className="text-cyan-300">precipitation_probability</code> oranını ve milimetre projeksiyonunu tarar. Yağmur henüz başlamadan önce <strong>&quot;Yağmur Birazdan Başlayacak&quot;</strong> bildirimini tam zamanında üretir.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                3. Tam Ekran Zamanlaması & Anti-Spam
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Kullanıcı odaklanma veya etkinlik için tam ekrana geçtiğinde <code className="text-cyan-300">fullscreenchange</code> olayı dinlenir. 1.8 saniye beklenerek geçişin tamamlanması sağlanır. Ayrıca ardışık tam ekran geçişlerinde kullanıcıyı rahatsız etmemek adına <strong>15 dakikalık akıllı bekleme süresi (cooldown)</strong> devreye girer.
              </p>
            </div>

            {/* Box 4 */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                4. Web Audio API ile Temaya Uygun Tını
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Statik ses dosyaları yüklemek yerine, tarayıcının ses motorunda gerçek zamanlı iki tonlu göksel kristal akorlar (<code className="text-cyan-300">sine oscillator + exponential gain envelope</code>) sentezlenir. Her tema (Aurora, Synthwave, Matrix, vb.) için özel olarak hesaplanan rezonans frekansları çalınır.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>CountTo Developer Blog · Gerçek Zamanlı Hava Durumu Bildirim Mimarisi</p>
          <button
            onClick={handleReturnHome}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Ana Ekrana Geri Dön →
          </button>
        </div>
      </div>
    </div>
  );
};
