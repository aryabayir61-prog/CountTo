import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Volume2, 
  ArrowLeft, 
  Sparkles, 
  Navigation, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Bell,
  RotateCw,
  Clock,
  Radio,
  Wind,
  Snowflake,
  ThermometerSnowflake,
  ShieldAlert,
  ThermometerSun,
  CloudFog,
} from 'lucide-react';
import { FullscreenWeatherToast } from './FullscreenWeatherToast';
import { fetchRealWeather, getRealUserCoordinates, RealWeatherNotification } from '../utils/weatherService';
import { playWeatherNotificationSound, playWeatherExitSound, playHoverClickSound } from '../utils/audio';
import { THEMES } from '../utils/themes';
import { ThemeId } from '../types/countdown';

const SAMPLE_NOTIFICATIONS: Array<{ label: string; icon: React.FC<{ className?: string }>; notification: RealWeatherNotification }> = [
  {
    label: 'Yaklaşan Yağmur',
    icon: CloudRain,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Birkaç Dakika İçinde Yağmur Başlayacak',
      context: 'Yağmur bulutları yaklaşıyor; şemsiyenizi hazırlayın',
      iconType: 'rain',
      temperature: 14,
      weatherCode: 61,
      isPredictive: true,
    },
  },
  {
    label: 'Fırtına Yaklaşıyor',
    icon: CloudRain,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Fırtına Yaklaşıyor',
      context: 'Birkaç dakika içinde gök gürültülü sağanak başlayacak',
      iconType: 'thunder',
      temperature: 17,
      weatherCode: 95,
      isPredictive: true,
    },
  },
  {
    label: 'Kuvvetli Rüzgar',
    icon: Wind,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Kuvvetli Rüzgar Hamlesi',
      context: 'Rüzgar hamlesi 56 km/s hızına ulaşıyor; dikkatli olun',
      iconType: 'wind',
      temperature: 12,
      weatherCode: 3,
      isPredictive: true,
    },
  },
  {
    label: 'Don & Buzlanma',
    icon: Snowflake,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Don ve Gizli Buzlanma Riski',
      context: 'Zemin sıcaklığı donma sınırında; yollarda gizli buzlanmaya dikkat',
      iconType: 'freeze',
      temperature: 0,
      weatherCode: 71,
      isPredictive: true,
    },
  },
  {
    label: 'Ani Sıcaklık Düşüşü',
    icon: ThermometerSnowflake,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Ani Sıcaklık Düşüşü',
      context: "Sıcaklık 16°C'den 10°C'ye düşecek; hava hızla soğuyor",
      iconType: 'tempDrop',
      temperature: 11,
      weatherCode: 3,
      isPredictive: true,
    },
  },
  {
    label: 'Kar Başlamak Üzere',
    icon: Snowflake,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Kar Yağışı Başlamak Üzere',
      context: 'Birkaç dakika içinde kar yağışı başlayacak',
      iconType: 'snow',
      temperature: -1,
      weatherCode: 71,
      isPredictive: true,
    },
  },
  {
    label: 'Dolu & Gök Gürültüsü',
    icon: ShieldAlert,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Dolu ve Gök Gürültüsü Uyarısı',
      context: 'Birkaç dakika içinde dolu ve şiddetli şimşek aktivitesi bekleniyor',
      iconType: 'hail',
      temperature: 15,
      weatherCode: 96,
      isPredictive: true,
    },
  },
  {
    label: 'Yağmur Diniyor',
    icon: CloudRain,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Yağmur Birkaç Dakika İçinde Diniyor',
      context: 'Bulutlar dağılıyor; yağış yakında sona erecek',
      iconType: 'rainClearing',
      temperature: 15,
      weatherCode: 61,
      isPredictive: true,
    },
  },
  {
    label: 'Yoğun Sis & Görüş',
    icon: CloudFog,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Yoğun Sis ve Düşük Görüş',
      context: 'Görüş mesafesi oldukça düşük; trafikte ve yürüyüşte dikkatli olun',
      iconType: 'fog',
      temperature: 8,
      weatherCode: 45,
    },
  },
  {
    label: 'Aşırı Sıcak Dalgası',
    icon: ThermometerSun,
    notification: {
      header: 'CountTo Hava Durumu',
      message: 'Aşırı Sıcak Uyarısı',
      context: 'Hissedilen sıcaklık 38°C; bol sıvı tüketin ve gölgede kalın',
      iconType: 'heat',
      temperature: 36,
      weatherCode: 0,
    },
  },
];

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

  // Trigger custom toast
  const handleTriggerToast = (notif: RealWeatherNotification) => {
    setActiveToast(notif);
    playWeatherNotificationSound(selectedTheme, 0.24);

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
              CountTo DevBlog · Meteoroloji Sistemi
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Canlı Meteoroloji · Erken Uyarı Bildirimleri</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Akıllı Hava Durumu ve Erken Uyarı Sistemi
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-3xl leading-relaxed">
            CountTo tam ekrandayken devreye giren bildirimler; 15 dakikalık şimdi-tahmin (nowcasting) algoritmaları ile yaklaşan yağmur, fırtına, şiddetli rüzgar veya ani sıcaklık düşüşlerini olay gerçekleşmeden birkaç dakika önce sakin ve bilgilendirici şekilde sunar.
          </p>
        </div>

        {/* INTERACTIVE LIVE DEMO SANDBOX */}
        <div className="mb-14 rounded-3xl border border-white/15 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                İnteraktif Test ve Önizleme
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Bildirim Türlerini Canlı Deneyin
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
                Anlık Canlı Durum
              </span>
              <p className="text-sm font-bold text-white truncate">
                {isLoading ? 'Hesaplanıyor...' : liveWeather ? `${liveWeather.temperature}°C · ${liveWeather.message}` : 'Veri Hazır'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Kaynak Doğruluğu
              </span>
              <p className="text-sm font-bold text-emerald-400">
                Open-Meteo 15-Dakika Nowcast
              </p>
            </div>
          </div>

          {/* Real Live Weather Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <button
              onClick={() => liveWeather && handleTriggerToast(liveWeather)}
              disabled={isLoading || !liveWeather}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-neutral-900" />
              <span>Anlık Canlı Bildirimi Test Et</span>
            </button>

            <button
              onClick={() => handlePlaySound(selectedTheme)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm border border-white/10 shadow-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Temaya Göre Ses Efektini Dinle</span>
            </button>
          </div>

          {/* Expanded Notification Types Gallery */}
          <div className="mb-8 pt-6 border-t border-white/10">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Farklı Erken Uyarı Türlerini Önizleyin (Tıklayıp Test Edin):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {SAMPLE_NOTIFICATIONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleTriggerToast(item.notification)}
                    onMouseEnter={() => playHoverClickSound(0.05)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-neutral-200 hover:text-white transition-all text-left flex flex-col gap-1.5 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      {item.notification.isPredictive && (
                        <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded">
                          Tahmin
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
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
                Tarayıcının <code className="text-cyan-300">navigator.geolocation</code> arabirimi ile GPS koordinatları alınır. Kullanıcı izin vermediğinde güvenli IP tabanlı coğrafi tespit devreye girerek yerel veriler kesintisiz sağlanır.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <CloudRain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                2. 15-Dakikalık Nowcasting ile Önceden Tahmin
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Open-Meteo&apos;nun 15 dakikalık yüksek çözünürlüklü projeksiyonu taranır. Yağış, fırtına hamlesi, don noktası veya ani sıcaklık düşüşü başlamadan önce kullanıcı bilgilendirilir.
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
                Tam ekrana geçişten 1.8 saniye sonra devreye girer. Kritik hava değişimlerinde hemen; olağan durumlarda ise 12 dakikalık akıllı dinlenme süresiyle kullanıcıyı rahatsız etmeden çalışır.
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
                Tarayıcıda gerçek zamanlı göksel kristal akorlar (<code className="text-cyan-300">sine oscillator + exponential gain envelope</code>) sentezlenir. Her tema için özel harmonikler üretilir.
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
