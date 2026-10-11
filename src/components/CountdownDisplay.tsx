import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Share2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  Clock, 
  Zap,
  Activity,
  CheckCircle2,
  Keyboard,
  Music
} from 'lucide-react';
import { CountdownEvent, CountdownStyle, ThemeConfig, TimeRemaining } from '../types/countdown';
import { FlipCardView } from './styles/FlipCardView';
import { OrbitalRingsView } from './styles/OrbitalRingsView';
import { KineticRollView } from './styles/KineticRollView';
import { MonolithView } from './styles/MonolithView';
import { CountToRollView } from './styles/CountToRollView';
import { formatLocaleDate } from '../utils/time';

interface CountdownDisplayProps {
  event: CountdownEvent;
  time: TimeRemaining;
  theme: ThemeConfig;
  soundEnabled: boolean;
  isFullscreen: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onChangeStyle: (style: CountdownStyle) => void;
  onEdit: () => void;
  onShare: () => void;
  onToggleMilliseconds: () => void;
  onCelebrateAgain?: () => void;
  onOpenShortcuts?: () => void;
  ambientEnabled?: boolean;
  onToggleAmbient?: () => void;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  event,
  time,
  theme,
  soundEnabled,
  isFullscreen,
  onToggleSound,
  onToggleFullscreen,
  onChangeStyle,
  onEdit,
  onShare,
  onToggleMilliseconds,
  onCelebrateAgain,
  onOpenShortcuts,
  ambientEnabled = false,
  onToggleAmbient,
}) => {
  const styles: { id: CountdownStyle; name: string }[] = [
    { id: 'countTo', name: 'CountTo (Aşağı Kayma)' },
    { id: 'flip', name: '3D Flip' },
    { id: 'orbital', name: 'Halkalar' },
    { id: 'kinetic', name: 'Kinetik' },
    { id: 'monolith', name: 'Monolit' },
  ];

  // Fullscreen dynamic auto-hide controls state (1 minute delay)
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBriefHint = useCallback(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setShowHint(true);
    // İpucu kısa bir süre (4 saniye) zarifçe görünüp kendiliğinden pürüzsüzce kaybolur
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 4000);
  }, []);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (isFullscreen) {
      // 1 dakika (60.000 ms) sonra kontroller otomatik ve akıcı şekilde gizlenir
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
        triggerBriefHint();
      }, 60000);
    }
  }, [isFullscreen, triggerBriefHint]);

  // Handle fullscreen mode change
  useEffect(() => {
    if (isFullscreen) {
      setControlsVisible(true);
      setShowHint(false);
      resetHideTimer();
    } else {
      setControlsVisible(true);
      setShowHint(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [isFullscreen, resetHideTimer]);

  // Click / tap anywhere on screen in fullscreen toggles or reveals controls
  const handleContainerClick = () => {
    if (isFullscreen) {
      setControlsVisible((prev) => {
        const next = !prev;
        if (next) {
          setShowHint(false);
          resetHideTimer();
        } else {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          triggerBriefHint();
        }
        return next;
      });
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-4 py-6 md:py-10 z-10 select-none transition-all duration-500 ${
        isFullscreen ? 'min-h-[88vh] justify-center cursor-pointer' : ''
      }`}
    >
      {/* Central Hero Countdown Section - Smoothly glides down when controls hide */}
      <motion.div
        animate={{
          y: isFullscreen && !controlsVisible ? 54 : 0,
        }}
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1], // Signature CountTo organic deceleration
        }}
        className="w-full flex flex-col items-center justify-center"
      >
        {/* Event Header Information */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl px-2 transition-all duration-300">
          {/* Category & Status Line */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400 mb-3 tracking-wide">
            <span className="flex items-center gap-1.5 font-medium text-neutral-300">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {formatLocaleDate(event.targetDate)}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            {time.isPast ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Süre Doldu
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Geri Sayım Aktif
              </span>
            )}
          </div>

          {/* Primary Event Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 text-balance leading-tight">
            {event.title}
          </h1>

          {/* Optional Notes / Description */}
          {event.notes && (
            <p className="text-sm sm:text-base text-neutral-300/80 leading-relaxed font-normal mt-2">
              {event.notes}
            </p>
          )}
        </div>

        {/* Target Reached Banner (if completed) */}
        {time.isPast && (
          <div 
            className="mb-8 px-6 py-3 rounded-2xl border flex items-center gap-3 backdrop-blur-md shadow-lg animate-bounce transition-all duration-300"
            style={{
              backgroundColor: `${theme.primary}18`,
              borderColor: `${theme.primary}44`,
            }}
          >
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-white">
              Beklenen an geldi! Geçen süre sayılıyor:
            </span>
            {onCelebrateAgain && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCelebrateAgain();
                }}
                className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Kutla 🎉
              </button>
            )}
          </div>
        )}

        {/* Main Interactive Animated Countdown Area */}
        <div className="w-full flex items-center justify-center my-2 sm:my-6 transition-all duration-500">
          {event.style === 'countTo' && (
            <CountToRollView
              time={time}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
            />
          )}
          {event.style === 'flip' && (
            <FlipCardView
              time={time}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
            />
          )}
          {event.style === 'orbital' && (
            <OrbitalRingsView
              time={time}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
            />
          )}
          {event.style === 'kinetic' && (
            <KineticRollView
              time={time}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
            />
          )}
          {event.style === 'monolith' && (
            <MonolithView
              time={time}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
            />
          )}
        </div>

        {/* Subtle Progress Bar (Elapsed journey) */}
        <div className="w-full max-w-lg mt-8 sm:mt-10 px-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-neutral-500" />
              İlerleme
            </span>
            <span className="font-mono-numbers">
              {time.progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-xs">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, time.progressPercent))}%`,
                backgroundColor: theme.primary,
                boxShadow: `0 0 12px ${theme.primary}`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Dynamic Control Area - Modern Segmented Pill Design with Smooth Hide/Show Animation */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            key="countdown-controls"
            initial={{ opacity: 0, y: 35, scale: 0.95, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => {
              e.stopPropagation();
              resetHideTimer();
            }}
            className="mt-8 sm:mt-10 flex flex-col items-center gap-3 w-full"
          >
            {/* 1. Animation Style Segmented Pill Selector (Theme colored & smoothly sliding) */}
            <div className="p-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-2xl flex items-center shadow-2xl overflow-x-auto max-w-full relative">
              {styles.map((s) => {
                const isActive = event.style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onChangeStyle(s.id)}
                    className="relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold select-none whitespace-nowrap transition-colors focus-visible:outline-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeStylePill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-full border shadow-sm"
                        style={{
                          backgroundColor: theme.primary,
                          borderColor: `${theme.primary}dd`,
                          boxShadow: `0 4px 15px -3px ${theme.glow}`,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Action Controls Toolbar - Matching Pill Group */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-2xl shadow-xl flex-wrap justify-center">
              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                title={soundEnabled ? 'Sesi Kapat' : 'Tik Tak Sesini Aç'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none ${
                  soundEnabled
                    ? 'text-neutral-950 shadow-sm border'
                    : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
                style={
                  soundEnabled
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: `${theme.primary}dd`,
                        boxShadow: `0 4px 15px -3px ${theme.glow}`,
                      }
                    : undefined
                }
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-neutral-950" />
                    <span className="font-bold">Ses Açık</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Sessiz</span>
                  </>
                )}
              </button>

              {/* Ambient Acoustic Guitar Music Toggle */}
              {onToggleAmbient && (
                <button
                  onClick={onToggleAmbient}
                  title={ambientEnabled ? 'Ambiyans Gitar Müziğini Kapat (Kısayol: A)' : 'Ambiyans Gitar Müziğini Başlat (Kısayol: A)'}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none ${
                    ambientEnabled
                      ? 'text-neutral-950 shadow-sm border'
                      : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
                  }`}
                  style={
                    ambientEnabled
                      ? {
                          backgroundColor: theme.primary,
                          borderColor: `${theme.primary}dd`,
                          boxShadow: `0 4px 15px -3px ${theme.glow}`,
                        }
                      : undefined
                  }
                >
                  <Music className={`w-3.5 h-3.5 ${ambientEnabled ? 'text-neutral-950 animate-pulse' : ''}`} />
                  <span className={ambientEnabled ? 'font-bold' : ''}>
                    {ambientEnabled ? 'Gitar Ambiyans Açık' : 'Gitar Ambiyans'}
                  </span>
                </button>
              )}

              {/* Milliseconds Toggle */}
              <button
                onClick={onToggleMilliseconds}
                title={event.showMilliseconds ? 'Saliseyi Gizle (Kısayol: M)' : 'Saliseyi Göster (Kısayol: M)'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none ${
                  event.showMilliseconds
                    ? 'text-neutral-950 shadow-sm border'
                    : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
                style={
                  event.showMilliseconds
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: `${theme.primary}dd`,
                        boxShadow: `0 4px 15px -3px ${theme.glow}`,
                      }
                    : undefined
                }
              >
                <Zap className={`w-3.5 h-3.5 ${event.showMilliseconds ? 'text-neutral-950 fill-neutral-950' : ''}`} />
                <span className={event.showMilliseconds ? 'font-bold' : ''}>Salise</span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Share Button */}
              <button
                onClick={onShare}
                title="Bağlantıyı Paylaş"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white border border-transparent hover:bg-white/5 transition-all flex items-center gap-1.5 select-none"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paylaş</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={onEdit}
                title="Tarihi ve Başlığı Düzenle (Kısayol: E)"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white border border-transparent hover:bg-white/5 transition-all flex items-center gap-1.5 select-none"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Tam Ekrandan Çık (Kısayol: F veya Esc)' : 'Tam Ekran Modu (Kısayol: F)'}
                className="p-1.5 px-2.5 rounded-full text-neutral-400 hover:text-white border border-transparent hover:bg-white/5 transition-all text-xs font-medium flex items-center select-none"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Keyboard Shortcuts Guide Button */}
              {onOpenShortcuts && (
                <button
                  onClick={onOpenShortcuts}
                  title="Klavye Kısayolları (Kısayol: ?)"
                  className="p-1.5 px-2 rounded-full text-neutral-400 hover:text-white border border-transparent hover:bg-white/5 transition-all text-xs font-medium flex items-center select-none"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Zen Hint in Fullscreen - Appears briefly (4s) when controls hide, then smoothly fades away */}
      <AnimatePresence>
        {isFullscreen && !controlsVisible && showHint && (
          <motion.div
            key="fullscreen-hint"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 z-30 pointer-events-none"
          >
            <div 
              className="px-5 py-2 rounded-full backdrop-blur-2xl border text-xs sm:text-sm font-medium shadow-2xl flex items-center gap-2.5 select-none"
              style={{
                backgroundColor: 'rgba(12, 15, 25, 0.88)',
                borderColor: `${theme.primary}45`,
                boxShadow: `0 12px 32px -4px ${theme.glow}35`,
              }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
              <span className="text-neutral-200">Kontrolleri görmek için ekrana dokunun</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Minimize Button when in Fullscreen */}
      {isFullscreen && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFullscreen();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: controlsVisible ? 0.7 : 0.35 }}
          whileHover={{ opacity: 1, scale: 1.08 }}
          className="fixed top-5 right-5 p-2.5 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md z-40 transition-all shadow-lg"
          title="Tam Ekrandan Çık"
        >
          <Minimize2 className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
};
