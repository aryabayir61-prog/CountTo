import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog,
  RefreshCw
} from 'lucide-react';
import { ThemeConfig } from '../types/countdown';

interface AmbientWeatherProps {
  theme: ThemeConfig;
  controlsVisible: boolean;
}

interface WeatherData {
  temp: number;
  conditionCode: number;
  conditionText: string;
  isDay: boolean;
  cityName: string;
}

export const AmbientWeather: React.FC<AmbientWeatherProps> = ({
  theme,
  controlsVisible,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const prevTempRef = useRef<number | null>(null);

  // Weather code translation and icon mapping
  const getWeatherDetails = (code: number, isDay: boolean) => {
    switch (code) {
      case 0:
        return {
          text: isDay ? 'Açık & Güneşli' : 'Açık Gece',
          icon: isDay ? Sun : Moon,
          color: isDay ? 'text-amber-400' : 'text-indigo-300',
        };
      case 1:
      case 2:
        return {
          text: isDay ? 'Parçalı Bulutlu' : 'Parçalı Bulutlu Gece',
          icon: isDay ? CloudSun : CloudMoon,
          color: isDay ? 'text-amber-300' : 'text-slate-300',
        };
      case 3:
        return {
          text: 'Çok Bulutlu',
          icon: Cloud,
          color: 'text-neutral-300',
        };
      case 45:
      case 48:
        return {
          text: 'Sisli',
          icon: CloudFog,
          color: 'text-neutral-400',
        };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return {
          text: 'Yağmurlu',
          icon: CloudRain,
          color: 'text-cyan-400',
        };
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return {
          text: 'Karlı',
          icon: CloudSnow,
          color: 'text-blue-200',
        };
      case 95:
      case 96:
      case 99:
        return {
          text: 'Fırtınalı',
          icon: CloudLightning,
          color: 'text-amber-500',
        };
      default:
        return {
          text: 'Açık',
          icon: isDay ? Sun : Moon,
          color: 'text-neutral-300',
        };
    }
  };

  const fetchWeather = async () => {
    try {
      setIsRefreshing(true);

      let lat = 41.0082; // Default Istanbul
      let lon = 28.9784;
      let city = 'İstanbul';

      // 1. Try browser geolocation
      const getPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
            maximumAge: 300000,
          });
        });
      };

      try {
        const pos = await getPosition();
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        // Try getting city name via BigDataCloud reverse geocode (free, client-side, CORS enabled)
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Konumunuz';
          }
        } catch {
          city = 'Konumunuz';
        }
      } catch {
        // Fallback: Try IP based city detection (free, keyless)
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lon = ipData.longitude;
              city = ipData.city || 'Konumunuz';
            }
          }
        } catch {
          // Keep default
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timeZone) {
            const parts = timeZone.split('/');
            if (parts.length > 1) {
              city = parts[1].replace(/_/g, ' ');
            }
          }
        }
      }

      // 2. Fetch real-time weather from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`
      );

      if (weatherRes.ok) {
        const data = await weatherRes.json();
        const current = data.current;
        const tempRounded = Math.round(current.temperature_2m);
        const condition = getWeatherDetails(current.weather_code, current.is_day === 1);

        setWeather({
          temp: tempRounded,
          conditionCode: current.weather_code,
          conditionText: condition.text,
          isDay: current.is_day === 1,
          cityName: city,
        });

        prevTempRef.current = tempRounded;
      }
    } catch {
      // Graceful fallback weather so UI is never empty
      if (!weather) {
        setWeather({
          temp: 20,
          conditionCode: 1,
          conditionText: 'Açık & Ferah',
          isDay: true,
          cityName: 'Hava Durumu',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !weather) {
    return (
      <div className="fixed top-5 left-5 z-40 select-none pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs text-neutral-400 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Hava Durumu yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const details = getWeatherDetails(weather.conditionCode, weather.isDay);
  const WeatherIcon = details.icon;
  const tempString = String(weather.temp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ 
        opacity: controlsVisible ? 0.95 : 0.45,
        x: 0, 
        scale: 1 
      }}
      whileHover={{ opacity: 1, scale: 1.03 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-5 left-5 z-40 select-none"
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
          fetchWeather();
        }}
        title={`${weather.cityName}: ${weather.temp}°C, ${weather.conditionText} (Yenilemek için tıklayın)`}
        className="px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 hover:border-white/20 backdrop-blur-xl text-white text-xs flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer group"
      >
        {/* Animated Weather Icon with Smooth Morphing */}
        <div className="relative w-4 h-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${weather.conditionCode}-${weather.isDay}`}
              initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: 25, opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <WeatherIcon className={`w-4 h-4 ${details.color} drop-shadow-md`} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Location City Name */}
        <span className="font-semibold text-neutral-300 text-[11px] max-w-[85px] sm:max-w-[120px] truncate">
          {weather.cityName}
        </span>

        <span className="text-white/20 text-[10px]">·</span>

        {/* Temperature with CountTo Downward Rolling Digits */}
        <div className="flex items-center font-mono-numbers font-bold text-white text-xs tracking-tight">
          {tempString.split('').map((digit, idx) => (
            <div 
              key={idx}
              className="relative w-2.5 h-4 overflow-hidden inline-flex items-center justify-center"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${idx}-${digit}`}
                  initial={{ y: '-90%', opacity: 0.1, filter: 'blur(1px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: '90%', opacity: 0.1, filter: 'blur(1px)' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </div>
          ))}
          <span className="text-cyan-400 font-bold ml-0.5">°</span>
        </div>

        {/* Mini Refresh Indicator on hover */}
        <RefreshCw 
          className={`w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity ${
            isRefreshing ? 'animate-spin opacity-100 text-cyan-400' : ''
          }`} 
        />
      </div>
    </motion.div>
  );
};
