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
  Keyboard
} from 'lucide-react';
import { CountdownEvent, CountdownStyle, ThemeConfig, TimeRemaining } from '../types/countdown';
import { FlipCardView } from './styles/FlipCardView';
import { OrbitalRingsView } from './styles/OrbitalRingsView';
import { KineticRollView } from './styles/KineticRollView';
import { MonolithView } from './styles/MonolithView';
import { CountToRollView } from './styles/CountToRollView';
import { formatLocaleDate, getTurkeyTime, TurkeyCurrentTime } from '../utils/time';

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
  isVertical?: boolean;
  onToggleVertical?: () => void;
  onTestChime?: () => void;
  onFocusModeChange?: (isFocusMode: boolean) => void;
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
  isVertical = false,
  onToggleVertical,
  onTestChime,
  onFocusModeChange,
}) => {
  const styles: { id: CountdownStyle; name: string }[] = [
    { id: 'countTo', name: 'CountTo (Aşağı Kayma)' },
    { id: 'flip', name: '3D Flip' },
    { id: 'orbital', name: 'Halkalar' },
    { id: 'kinetic', name: 'Kinetik' },
    { id: 'monolith', name: 'Monolit' },
  ];

  // Fullscreen dynamic auto-hide controls state
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onFocusModeChange?.(isFullscreen && !controlsVisible);
  }, [isFullscreen, controlsVisible, onFocusModeChange]);

  // Real-time Turkey Time ticker for finished/no-countdown state
  const isFinished = !event || time.isPast;
  const [trTime, setTrTime] = useState<TurkeyCurrentTime>(getTurkeyTime());

  useEffect(() => {
    if (!isFinished) return;
    const ticker = setInterval(() => {
      setTrTime(getTurkeyTime());
    }, event.showMilliseconds ? 50 : 250);
    return () => clearInterval(ticker);
  }, [isFinished, event.showMilliseconds]);

  // Construct display time object: If event is finished, display Turkey Time without days
  const effectiveDisplayTime: TimeRemaining = isFinished
    ? {
        days: 0,
        hours: trTime.hours,
        minutes: trTime.minutes,
        seconds: trTime.seconds,
        milliseconds: trTime.milliseconds,
        totalMs: 0,
        isPast: true,
        progressPercent: 100,
      }
    : time;

  // Trigger brief hint when entering focus mode
  const triggerBriefHint = useCallback(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setShowHint(true);
    // İpucu 3.2 saniye görünür ve ardından pürüzsüzce kaybolur
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 3200);
  }, []);

  // Wakes up controls immediately on any user activity and restarts auto-hide timer
  const handleUserActivity = useCallback(() => {
    // 1. Herhangi bir hareket veya dokunuşta kontroller ANINDA ve pürüzsüzce açılır
    setControlsVisible(true);

    // 2. Kontroller açıldığı an ipucu rozeti gizlenir
    setShowHint(false);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    // 3. Önceki gizleme sayacını sıfırla
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // 4. Tam ekrandayken kullanıcı 6 saniye hiçbir şey yapmazsa odak moduna geçer
    if (isFullscreen) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
        triggerBriefHint();
      }, 6000);
    }
  }, [isFullscreen, triggerBriefHint]);

  // Global window-level listener: works anywhere on the screen, across all pixels & devices
  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true);
      setShowHint(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      return;
    }

    // Tam ekrana geçildiğinde sayacı başlat
    handleUserActivity();

    // Tüm ekran genelinde fare, dokunma, tıklama ve tuş hareketlerini dinle
    const onActivity = () => {
      handleUserActivity();
    };

    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('touchmove', onActivity, { passive: true });
    window.addEventListener('mousedown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity, { passive: true });

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('touchmove', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [isFullscreen, handleUserActivity]);

  return (
    <div 
      className={`relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFullscreen 
          ? controlsVisible 
            ? 'py-4 min-h-screen justify-center cursor-default' 
            : 'py-4 min-h-screen justify-center cursor-none' 
          : 'py-8'
      }`}
      onClick={handleUserActivity}
    >
      {/* Dynamic Animated Content Container */}
      <motion.div
        animate={{
          // Akıcı hareket: Kontroller gizlendiğinde sayaç pürüzsüzce ekranın merkezine oturur
          y: isFullscreen && !controlsVisible ? 36 : 0,
        }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1], // Buttery smooth liquid deceleration
        }}
        className="w-full flex flex-col items-center justify-center"
      >
        {/* Event Header Information */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl px-2 transition-all duration-300">
          {/* Category & Status Line */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400 mb-3 tracking-wide flex-wrap">
            {isFinished ? (
              <button
                type="button"
                onClick={onTestChime}
                title="Saat başı çanı & saniye sesi aktif · Tıklayarak saat başı çanını dinleyin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold text-xs shadow-sm hover:bg-cyan-500/20 transition-all cursor-pointer group select-none"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>Türkiye Yerel Saati (UTC+3)</span>
                {soundEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" title="Ses Açık" />
                )}
              </button>
            ) : (
              <>
                <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {formatLocaleDate(event.targetDate)}
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="flex items-center gap-1 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Geri Sayım Aktif
                </span>
              </>
            )}
          </div>

          {/* Primary Event Title */}
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 text-balance leading-tight"
          >
            {isFinished ? 'Şu Anki Saat' : event?.title}
          </h1>

          {/* Subtitle / Notes or Date */}
          {isFinished ? (
            <p className="text-sm sm:text-base text-neutral-400 font-normal mt-2">
              {trTime.dateFormatted}
            </p>
          ) : (
            event?.notes && (
              <p className="text-sm sm:text-base text-neutral-300/80 leading-relaxed font-normal mt-2">
                {event.notes}
              </p>
            )
          )}
        </div>

        {/* Main Interactive Animated Countdown / Turkey Clock Area */}
        {/* Exactly uses the selected countdown style, but hides 'GÜN' when finished! */}
        <div 
          className="w-full flex items-center justify-center my-2 sm:my-6 transition-all duration-500"
        >
          {event.style === 'countTo' && (
            <CountToRollView
              time={effectiveDisplayTime}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
              hideDays={isFinished}
            />
          )}
          {event.style === 'flip' && (
            <FlipCardView
              time={effectiveDisplayTime}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
              hideDays={isFinished}
            />
          )}
          {event.style === 'orbital' && (
            <OrbitalRingsView
              time={effectiveDisplayTime}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
              hideDays={isFinished}
            />
          )}
          {event.style === 'kinetic' && (
            <KineticRollView
              time={effectiveDisplayTime}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
              hideDays={isFinished}
            />
          )}
          {event.style === 'monolith' && (
            <MonolithView
              time={effectiveDisplayTime}
              theme={theme}
              showMilliseconds={event.showMilliseconds}
              hideDays={isFinished}
            />
          )}
        </div>

        {/* Subtle Progress Bar (Elapsed journey) */}
        {!isFinished && (
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
        )}
      </motion.div>

      {/* Dynamic Control Area - Modern Segmented Pill Design with Smooth Hide/Show Animation */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            key="countdown-controls"
            initial={{ opacity: 0, y: 28, scale: 0.97, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => {
              e.stopPropagation();
              handleUserActivity();
            }}
            onMouseMove={(e) => {
              e.stopPropagation();
              handleUserActivity();
            }}
            className="mt-8 sm:mt-10 flex flex-col items-center gap-3 w-full"
          >
            {/* 1. Animation Style Segmented Pill Selector (Theme colored & smoothly sliding) */}
            <div 
              className="p-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-2xl flex items-center shadow-2xl overflow-x-auto max-w-full relative"
            >
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
                        layoutId="activeCountdownStylePill"
                        className="absolute inset-0 rounded-full shadow-md"
                        style={{
                          backgroundColor: theme.primary,
                          boxShadow: `0 0 18px ${theme.primary}55`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? 'text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Action Toolbar */}
            <div className="p-1.5 px-3 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-2xl flex items-center gap-1.5 sm:gap-2 shadow-2xl">
              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                title={soundEnabled ? 'Sesi Kapat (Kısayol: S)' : 'Tik Tak Sesini Aç (Kısayol: S)'}
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

      {/* Floating Zen Hint in Fullscreen - Appears briefly (3.2s) when controls hide, then smoothly fades away */}
      <AnimatePresence>
        {isFullscreen && !controlsVisible && showHint && (
          <motion.div
            key="fullscreen-hint"
            initial={{ opacity: 0, y: 22, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 16, scale: 0.96, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 z-30 pointer-events-none"
          >
            <div 
              className="px-5 py-2 rounded-full backdrop-blur-2xl border text-xs font-medium shadow-2xl flex items-center gap-2.5 select-none"
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.88)',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                color: '#f3f4f6',
                boxShadow: `0 10px 35px -5px ${theme.glow}`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: theme.primary }} />
              <span>Odak modu aktif · Kontroller için fareyi hareket ettirin veya dokunun</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
