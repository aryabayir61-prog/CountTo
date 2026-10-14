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
  const renderIcon = (type: RealWeatherNotification['iconType']) => {
    const iconClass = 'w-7 h-7 text-neutral-900 shrink-0 stroke-[2.2]';
    switch (type) {
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
    <AnimatePresence mode="wait">
      {notification && (
        <motion.div
          key="weather-toast"
          initial={{ opacity: 0, x: 110, scale: 0.93, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 90, scale: 0.94, filter: 'blur(8px)' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          onClick={onDismiss}
          className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50 cursor-pointer select-none group"
        >
          {/* Header Text matching user screenshot */}
          <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow-md mb-2 pl-1 tracking-tight">
            {notification.header}
          </p>

          {/* Clean White Bubble matching user screenshot */}
          <div className="bg-white text-neutral-900 rounded-2xl px-5 py-3.5 shadow-2xl flex flex-col gap-2 border border-black/5 hover:scale-[1.01] transition-transform relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-neutral-900">
                  {notification.message}
                </span>
                <span className="text-xs sm:text-sm font-medium text-neutral-500">
                  {notification.temperature}°C
                </span>
              </div>

              <div className="pl-1">
                {renderIcon(notification.iconType)}
              </div>
            </div>

            {/* Smooth dynamic hairline progress indicator */}
            <div className="w-full h-[2px] bg-neutral-100 rounded-full overflow-hidden mt-0.5">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7.5, ease: 'linear' }}
                className="h-full bg-neutral-900/30"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
