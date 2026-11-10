import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  PictureInPicture2, 
  Maximize2, 
  X, 
  GripHorizontal,
  Clock,
  Sparkles 
} from 'lucide-react';
import { CountdownEvent, ThemeConfig, TimeRemaining } from '../types/countdown';
import { playHoverClickSound, playLiquidPopSound } from '../utils/audio';
import { pipService } from '../utils/pipService';

interface FloatingPiPWidgetProps {
  event: CountdownEvent;
  time: TimeRemaining;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onReturnToDisplay: () => void;
  showMilliseconds?: boolean;
}

export const FloatingPiPWidget: React.FC<FloatingPiPWidgetProps> = ({
  event,
  time,
  theme,
  isOpen,
  onClose,
  onReturnToDisplay,
  showMilliseconds = false,
}) => {
  const [isOSPiPActive, setIsOSPiPActive] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = pipService.subscribe((active) => {
      setIsOSPiPActive(active);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const isClock = event.id === 'preset-current-time';
  const hasDays = (time.days || 0) > 0;

  const handleLaunchNativeOSPiP = async () => {
    playHoverClickSound(0.12);
    await pipService.togglePictureInPicture(event, time, theme, showMilliseconds);
  };

  return (
    <motion.div
      ref={widgetRef}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
      className="fixed bottom-6 right-6 z-50 select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <div
        className="relative flex flex-col rounded-2xl p-3 sm:p-3.5 backdrop-blur-2xl border transition-all duration-300 shadow-2xl min-w-[240px] max-w-[320px]"
        style={{
          backgroundColor: 'rgba(10, 12, 16, 0.88)',
          borderColor: 'rgba(255, 255, 255, 0.14)',
          boxShadow: `0 14px 40px -10px ${theme.glow}, 0 0 0 1px rgba(255, 255, 255, 0.06)`,
        }}
      >
        {/* Top Handle Bar */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span 
              className="w-2 h-2 rounded-full shrink-0 animate-ping"
              style={{ backgroundColor: theme.primary }}
            />
            <span 
              className="w-2 h-2 rounded-full shrink-0 -ml-4"
              style={{ backgroundColor: theme.primary }}
            />
            <span className="text-[11px] font-bold text-white truncate max-w-[140px]">
              {event.title || 'CountTo'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Native OS PiP Popout Button */}
            <button
              onClick={handleLaunchNativeOSPiP}
              title={isOSPiPActive ? 'Masaüstü Yüzen Pencereyi Kapat' : 'Masaüstü Yüzen Pencereye Çıkar (Tüm Uygulamaların Üstünde)'}
              className={`p-1 rounded-lg border transition-all cursor-pointer ${
                isOSPiPActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10 border-transparent'
              }`}
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
            </button>

            {/* Expand to Main Display */}
            <button
              onClick={() => {
                playLiquidPopSound(0.12);
                onReturnToDisplay();
              }}
              title="Geri Sayım Ekranına Büyüt"
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Floating Pill */}
            <button
              onClick={() => {
                playHoverClickSound(0.08);
                onClose();
              }}
              title="Yüzen Hapı Kapat"
              className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/10 border border-transparent transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Big Numbers Display */}
        <div 
          onClick={() => {
            playLiquidPopSound(0.12);
            onReturnToDisplay();
          }}
          className="flex items-center justify-center py-1 cursor-pointer group"
        >
          {time.isPast && !isClock ? (
            <div className="text-sm font-extrabold text-cyan-300 flex items-center gap-1.5 py-1">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>TAMAMLANDI 🎉</span>
            </div>
          ) : isClock ? (
            <div className="font-mono-numbers text-2xl font-black text-white tracking-tight flex items-center gap-1 drop-shadow-md">
              <span>{String(time.hours).padStart(2, '0')}</span>
              <span className="text-white/40 pb-0.5">:</span>
              <span>{String(time.minutes).padStart(2, '0')}</span>
              <span className="text-white/40 pb-0.5">:</span>
              <span style={{ color: theme.primary }}>{String(time.seconds).padStart(2, '0')}</span>
            </div>
          ) : (
            <div className="font-mono-numbers text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1 drop-shadow-md">
              {hasDays && (
                <>
                  <span className="text-cyan-400 font-extrabold">{time.days}</span>
                  <span className="text-[10px] text-neutral-400 font-semibold mr-1">g</span>
                </>
              )}
              <span>{String(time.hours).padStart(2, '0')}</span>
              <span className="text-white/40 pb-0.5">:</span>
              <span>{String(time.minutes).padStart(2, '0')}</span>
              <span className="text-white/40 pb-0.5">:</span>
              <span style={{ color: theme.primary }}>{String(time.seconds).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Drag Hint Footer */}
        <div className="mt-1 pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <GripHorizontal className="w-3 h-3 text-neutral-600" />
            <span>Sürükle</span>
          </span>
          <span 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={handleLaunchNativeOSPiP}
          >
            {isOSPiPActive ? 'Masaüstü PiP Aktif ●' : 'Masaüstüne Çıkar ↗'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
