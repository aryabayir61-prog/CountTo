import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CloudRain, MapPin } from 'lucide-react';
import { WeatherAlert } from '../services/weatherService';
import { WeatherAnimatedIcon } from './WeatherIcons';
import { ThemeConfig } from '../types/countdown';

interface WeatherNotificationProps {
  alert: WeatherAlert | null;
  theme: ThemeConfig;
  onDismiss: () => void;
  durationMs?: number;
}

export const WeatherNotification: React.FC<WeatherNotificationProps> = ({
  alert,
  theme,
  onDismiss,
  durationMs = 7000,
}) => {
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!alert) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [alert, durationMs, onDismiss]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: 140, scale: 0.92, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 140, scale: 0.95, filter: 'blur(8px)' }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1], // Smooth fluid motion
          }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] select-none pointer-events-auto"
        >
          {/* Outer Header: CountTo Hava Durumu Bildirimi */}
          <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-xs font-semibold text-white/90 drop-shadow-md tracking-tight flex items-center gap-1.5">
                <span>CountTo Hava Durumu Bildirimi</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {alert.city && (
                <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{alert.city}</span>
                </span>
              )}
              <button
                onClick={onDismiss}
                className="text-neutral-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10"
                title="Kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inner Card: Matches the user's mockup (crisp white card with dark typography & animated icon) */}
          <div 
            className="relative bg-white text-neutral-900 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden border border-white/20"
            style={{
              boxShadow: `0 20px 45px -10px ${theme.glow}, 0 10px 20px -5px rgba(0, 0, 0, 0.5)`,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Text Information */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 leading-snug">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-medium">
                  {alert.subtitle}
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-bold">
                    {alert.temperature}°C
                  </span>
                  {alert.humidity && <span>Nem: %{alert.humidity}</span>}
                  {alert.windSpeed && <span>Rüzgar: {alert.windSpeed} km/s</span>}
                </div>
              </div>

              {/* Animated Weather SVG Icon */}
              <div className="shrink-0 p-1 flex items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200/60 shadow-inner">
                <WeatherAnimatedIcon type={alert.type} className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>
            </div>

            {/* Auto-Dismiss Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: theme.primary,
                }}
                transition={{ ease: 'linear', duration: 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
