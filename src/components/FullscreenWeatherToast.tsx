import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Cloud, 
  Sun, 
  Moon, 
  CloudFog,
  CloudDrizzle
} from 'lucide-react';
import { RealWeatherNotification } from '../utils/weatherService';

interface FullscreenWeatherToastProps {
  notification: RealWeatherNotification | null;
  onDismiss: () => void;
}

export const FullscreenWeatherToast: React.FC<FullscreenWeatherToastProps> = ({
  notification,
  onDismiss,
}) => {
  if (!notification) return null;

  const renderIcon = () => {
    const iconClass = 'w-7 h-7 text-neutral-900 shrink-0 stroke-[2.2]';
    switch (notification.iconType) {
      case 'rain':
        return <CloudRain className={iconClass} />;
      case 'heavyRain':
        return <CloudRain className={iconClass} />;
      case 'thunder':
        return <CloudLightning className={iconClass} />;
      case 'snow':
        return <CloudSnow className={iconClass} />;
      case 'fog':
        return <CloudFog className={iconClass} />;
      case 'cloud':
        return <Cloud className={iconClass} />;
      case 'moon':
        return <Moon className={iconClass} />;
      case 'sun':
      default:
        return <Sun className={iconClass} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="weather-toast"
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={onDismiss}
        className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50 cursor-pointer select-none"
      >
        {/* Header Text matching user screenshot */}
        <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow-md mb-2 pl-1 tracking-tight">
          {notification.header}
        </p>

        {/* Clean White Bubble matching user screenshot */}
        <div className="bg-white text-neutral-900 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-4 border border-black/5 hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base tracking-tight text-neutral-900">
              {notification.message}
            </span>
            <span className="text-xs sm:text-sm font-medium text-neutral-500">
              {notification.temperature}°C
            </span>
          </div>

          <div className="pl-1">
            {renderIcon()}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
