import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Cloud, 
  Sun, 
  Moon, 
  CloudFog, 
  Wind, 
  X, 
  RotateCw,
  Navigation
} from 'lucide-react';
import { WeatherWidgetData } from '../types/weatherWidget';
import { ThemeConfig } from '../types/countdown';
import { fetchRealWeather, RealWeatherNotification } from '../utils/weatherService';
import { playHoverClickSound } from '../utils/audio';

interface WeatherWidgetCardProps {
  widget: WeatherWidgetData;
  theme: ThemeConfig;
  isGlobalFocusMode?: boolean;
  onUpdate: (id: string, updates: Partial<WeatherWidgetData>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export const WeatherWidgetCard: React.FC<WeatherWidgetCardProps> = ({
  widget,
  theme,
  isGlobalFocusMode = false,
  onUpdate,
  onDelete,
  onBringToFront,
}) => {
  const [weather, setWeather] = useState<RealWeatherNotification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const loadWeather = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await fetchRealWeather(force);
      if (data) {
        setWeather(data);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
    const interval = setInterval(() => {
      loadWeather(false);
    }, 3 * 60 * 1000); // Check every 3 mins
    return () => clearInterval(interval);
  }, []);

  // Dragging logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"]')) {
      return;
    }

    onBringToFront(widget.id);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: widget.x,
      startY: widget.y,
    };

    const size = widget.size || 215;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;

      const maxX = Math.max(0, window.innerWidth - size);
      const maxY = Math.max(0, window.innerHeight - size);

      const nextX = Math.max(0, Math.min(maxX, dragStartRef.current.startX + dx));
      const nextY = Math.max(0, Math.min(maxY, dragStartRef.current.startY + dy));

      onUpdate(widget.id, { x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHoverClickSound(0.08);
    loadWeather(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHoverClickSound(0.12);
    onDelete(widget.id);
  };

  const renderIcon = (type?: RealWeatherNotification['iconType']) => {
    const iconClass = 'w-9 h-9 stroke-[2.2] transition-transform duration-300 group-hover:scale-105';
    switch (type) {
      case 'rain':
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case 'heavyRain':
        return <CloudRain className={`${iconClass} text-cyan-400`} />;
      case 'thunder':
        return <CloudLightning className={`${iconClass} text-amber-400 animate-pulse`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-sky-200`} />;
      case 'fog':
        return <CloudFog className={`${iconClass} text-neutral-300`} />;
      case 'wind':
        return <Wind className={`${iconClass} text-teal-300`} />;
      case 'cloud':
        return <Cloud className={`${iconClass} text-neutral-300`} />;
      case 'moon':
        return <Moon className={`${iconClass} text-indigo-300`} />;
      case 'sun':
      default:
        return <Sun className={`${iconClass} text-amber-400`} />;
    }
  };

  const isControlsHidden = Boolean(isGlobalFocusMode && !isHovered && !isDragging);
  const size = widget.size || 215;

  return (
    <div
      className="absolute select-none pointer-events-auto group"
      style={{
        left: `${widget.x}px`,
        top: `${widget.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: widget.zIndex,
      }}
      onPointerDown={() => onBringToFront(widget.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.75, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.75, filter: 'blur(10px)' }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        className="w-full h-full relative rounded-3xl p-4 flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing border border-white/20 backdrop-blur-2xl bg-neutral-900/75 shadow-2xl transition-all duration-300"
        style={{
          boxShadow: `0 20px 45px -10px rgba(0,0,0,0.6), 0 0 25px -4px ${theme.glow}`,
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Subtle Frosted Specular Rim Light */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        <div 
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-25 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 tracking-tight">
            <Navigation className="w-3 h-3 text-cyan-400 rotate-45" />
            <span>Hava Durumu</span>
          </div>

          <div
            className={`flex items-center gap-1 transition-opacity duration-200 ${
              isControlsHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
          >
            <button
              type="button"
              onClick={handleRefresh}
              title="Yenile"
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleClose}
              title="Kapat"
              className="p-1 rounded-full text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Temperature & Weather Icon */}
        <div className="flex items-center justify-between my-auto relative z-10 px-1">
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold tracking-tight text-white font-mono-numbers">
              {weather ? `${weather.temperature}°` : '--°'}
            </span>
            <span className="text-[11px] font-medium text-neutral-400 mt-0.5">
              Canlı Derece
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center">
            {renderIcon(weather?.iconType)}
          </div>
        </div>

        {/* Bottom Message / Condition Status */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col">
          <p className="text-xs font-semibold text-neutral-200 truncate leading-tight">
            {weather?.message || 'Veriler alınıyor...'}
          </p>
          <span className="text-[10px] text-neutral-500 truncate mt-0.5">
            Gerçek zamanlı Open-Meteo
          </span>
        </div>
      </motion.div>
    </div>
  );
};
