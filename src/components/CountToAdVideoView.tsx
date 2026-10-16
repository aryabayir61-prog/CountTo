import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ArrowLeft,
  Sparkles,
  Clock,
  Palette,
  CloudRain,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Film,
  X,
  FastForward,
  Rewind
} from 'lucide-react';
import { ThemeId, CountdownStyle, TimeRemaining } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { 
  playTickSound, 
  playHoverClickSound, 
  playThemeSound, 
  playHourlyChimeSound, 
  playWeatherNotificationSound, 
  playWeatherExitSound,
  startAmbientMusic,
  stopAmbientMusic
} from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { FlipCardView } from './styles/FlipCardView';
import { OrbitalRingsView } from './styles/OrbitalRingsView';
import { KineticRollView } from './styles/KineticRollView';
import { MonolithView } from './styles/MonolithView';
import { CountToRollView } from './styles/CountToRollView';
import { FullscreenWeatherToast } from './FullscreenWeatherToast';
import { RealWeatherNotification } from '../utils/weatherService';

interface VideoChapter {
  id: string;
  title: string;
  category: string;
  startTime: number;
  endTime: number;
  subtitle: string;
  highlightTheme: ThemeId;
}

const VIDEO_DURATION = 52; // 52 seconds total runtime

const CHAPTERS: VideoChapter[] = [
  {
    id: 'intro',
    category: 'Giriş',
    title: 'Sayacı Yeniden Tanımlayın',
    startTime: 0,
    endTime: 8,
    subtitle: 'Zamanı sadece saymayın. Onu saf zarafet ve akışla hissedin.',
    highlightTheme: 'aurora',
  },
  {
    id: 'styles',
    category: 'Fizik & Hareket',
    title: '5 Fizik Tabanlı 3D Animasyon Stili',
    startTime: 8,
    endTime: 19,
    subtitle: 'Mekanik hane ruloları, 3D flip kartlar, orbital neon halkalar ve kinetik silindirler.',
    highlightTheme: 'cyber',
  },
  {
    id: 'themes',
    category: 'Renk Atmosferi',
    title: '25 Sinematik Renk Paleti',
    startTime: 19,
    endTime: 30,
    subtitle: 'Toz Pembe, Lavanta Esintisi, Kobalt ve Karamel ile her anınıza özel ambiyans.',
    highlightTheme: 'dustypink',
  },
  {
    id: 'weather',
    category: 'Zeka & Gökyüzü',
    title: 'Proaktif Hava Durumu Zekası',
    startTime: 30,
    endTime: 40,
    subtitle: 'Yağan yağmur hızlanacak mı, dinecek mi? Canlı bildirimler ve göksel tınılar.',
    highlightTheme: 'deepocean',
  },
  {
    id: 'horology',
    category: 'Hassas Zaman',
    title: 'Türkiye Saati & Saat Başı Çanı',
    startTime: 40,
    endTime: 46,
    subtitle: 'UTC+3 mekanik saniye tiktakları ve asil Westminster saat başı çan yankısı.',
    highlightTheme: 'caramel',
  },
  {
    id: 'finale',
    category: 'Final',
    title: 'CountTo ile Zamanın Yeni Boyutu',
    startTime: 46,
    endTime: 52,
    subtitle: 'Reklamsız, ücretsiz, çevrimdışı uyumlu ve tamamen modern.',
    highlightTheme: 'aurora',
  },
];

interface CountToAdVideoViewProps {
  onReturnToApp?: () => void;
}

export const CountToAdVideoView: React.FC<CountToAdVideoViewProps> = ({ onReturnToApp }) => {
  // Video playback engine
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Active scene components state
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('aurora');
  const [activeStyle, setActiveStyle] = useState<CountdownStyle>('countTo');
  const [weatherAlertActive, setWeatherAlertActive] = useState<boolean>(false);

  // Virtual Director: Camera pan/zoom and Animated cursor
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; isClicking: boolean; isHand: boolean; isVisible: boolean }>({
    x: 50,
    y: 50,
    isClicking: false,
    isHand: false,
    isVisible: true,
  });

  const [cameraZoom, setCameraZoom] = useState<{ scale: number; x: number; y: number }>({
    scale: 1,
    x: 0,
    y: 0,
  });

  // Track events triggered on specific timeline milestones
  const triggeredEventsRef = useRef<Record<string, boolean>>({});
  const videoRootRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulated live ticking countdown
  const [secondsTick, setSecondsTick] = useState<number>(48);
  const [millisecondsTick, setMillisecondsTick] = useState<number>(75);

  useEffect(() => {
    const timer = setInterval(() => {
      setMillisecondsTick((prev) => (prev > 0 ? prev - 1 : 99));
    }, 10);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((prev) => (prev > 0 ? prev - 1 : 59));
      if (!isMuted && isPlaying) {
        playTickSound(0.04 * volume);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isMuted, isPlaying, volume]);

  const currentTheme = THEMES[activeThemeId] || THEMES.aurora;

  // Video Timekeeper Loop (50ms tick rate)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        if (next >= VIDEO_DURATION) {
          setIsPlaying(false);
          return VIDEO_DURATION;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Ambient sound management
  useEffect(() => {
    try {
      if (isPlaying && !isMuted) {
        startAmbientMusic(activeThemeId, 0.16 * volume);
      } else {
        stopAmbientMusic();
      }
    } catch {
      // Audio autoplay might be blocked
    }
    return () => {
      try {
        stopAmbientMusic();
      } catch {
        // Ignore
      }
    };
  }, [isPlaying, isMuted, activeThemeId, volume]);

  // Directing the virtual camera, cursor motions, clicks, and feature demonstrations based on currentTime
  useEffect(() => {
    const t = currentTime;

    // Helper to fire audio event once per second mark
    const fireOnce = (key: string, fn: () => void) => {
      if (!triggeredEventsRef.current[key]) {
        triggeredEventsRef.current[key] = true;
        if (!isMuted) fn();
      }
    };

    // --- CHAPTER 1: GENESIS & INTRO (0 - 8s) ---
    if (t < 8) {
      setActiveThemeId('aurora');
      setActiveStyle('countTo');
      setWeatherAlertActive(false);

      if (t < 3) {
        setCameraZoom({ scale: 1.05, x: 0, y: -2 });
        setCursorPos({ x: 75, y: 70, isClicking: false, isHand: false, isVisible: true });
      } else if (t < 5.5) {
        setCameraZoom({ scale: 1.12, x: 0, y: 0 });
        setCursorPos({ x: 55, y: 50, isClicking: false, isHand: false, isVisible: true });
      } else {
        setCameraZoom({ scale: 1.0, x: 0, y: 0 });
        // Cursor starts gliding towards the style switcher pill
        setCursorPos({ x: 44, y: 68, isClicking: false, isHand: true, isVisible: true });
      }
    }

    // --- CHAPTER 2: 5 3D STYLES & FLIP CARDS (8 - 19s) ---
    else if (t >= 8 && t < 19) {
      // 8.5s: Cursor approaches Flip Card button
      if (t >= 8 && t < 10) {
        setActiveStyle('countTo');
        setCursorPos({ x: 45, y: 68, isClicking: false, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.15, x: 4, y: -6 });
      } 
      // 10.0s: Click 3D Flip!
      else if (t >= 10 && t < 13) {
        setActiveStyle('flip');
        setActiveThemeId('cyber');
        setCursorPos({ x: 45, y: 68, isClicking: t < 10.6, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.18, x: 0, y: 2 });
        fireOnce('click_flip', () => {
          playHoverClickSound(0.12 * volume);
        });
      }
      // 13.0s: Cursor glides to Orbital Rings button
      else if (t >= 13 && t < 15) {
        setCursorPos({ x: 55, y: 68, isClicking: false, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.16, x: -5, y: 2 });
      }
      // 15.0s: Click Orbital Rings!
      else if (t >= 15 && t < 17) {
        setActiveStyle('orbital');
        setCursorPos({ x: 55, y: 68, isClicking: t < 15.6, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.16, x: 0, y: 0 });
        fireOnce('click_orbital', () => {
          playHoverClickSound(0.12 * volume);
        });
      }
      // 17.0s: Click Kinetic Roll!
      else if (t >= 17 && t < 19) {
        setActiveStyle('kinetic');
        setCursorPos({ x: 65, y: 68, isClicking: t < 17.6, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.14, x: 0, y: 0 });
        fireOnce('click_kinetic', () => {
          playHoverClickSound(0.12 * volume);
        });
      }
    }

    // --- CHAPTER 3: 25 THEMES & TOZ PEMBE (19 - 30s) ---
    else if (t >= 19 && t < 30) {
      setActiveStyle('countTo');

      // 19.0s - 21.0s: Cursor glides towards theme selector
      if (t >= 19 && t < 22) {
        setActiveThemeId('sunset');
        setCursorPos({ x: 45, y: 48, isClicking: false, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.2, x: 3, y: 6 });
      }
      // 22.0s: Click on TOZ PEMBE (Dusty Rose) theme!
      else if (t >= 22 && t < 25.5) {
        setActiveThemeId('dustypink');
        setCursorPos({ x: 45, y: 48, isClicking: t < 22.7, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.22, x: 0, y: 5 });
        fireOnce('click_tozpembe', () => {
          playThemeSound('dustypink', 0.3 * volume);
        });
      }
      // 25.5s: Cursor glides to Lavender Mist
      else if (t >= 25.5 && t < 28) {
        setActiveThemeId('lavender');
        setCursorPos({ x: 60, y: 48, isClicking: t < 26.2, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.18, x: -4, y: 4 });
        fireOnce('click_lavender', () => {
          playThemeSound('lavender', 0.3 * volume);
        });
      }
      // 28.0s: Cobalt theme
      else if (t >= 28 && t < 30) {
        setActiveThemeId('cobalt');
        setCursorPos({ x: 50, y: 50, isClicking: false, isHand: false, isVisible: true });
        setCameraZoom({ scale: 1.12, x: 0, y: 0 });
      }
    }

    // --- CHAPTER 4: WEATHER INTELLIGENCE (30 - 40s) ---
    else if (t >= 30 && t < 40) {
      setActiveThemeId('deepocean');
      setActiveStyle('countTo');

      // 31.0s: Weather notification slides in with celestial audio chime
      if (t >= 31 && t < 36) {
        setWeatherAlertActive(true);
        setCameraZoom({ scale: 1.12, x: -14, y: 16 });
        setCursorPos({ x: 74, y: 22, isClicking: false, isHand: true, isVisible: true });
        fireOnce('weather_in', () => {
          playWeatherNotificationSound('deepocean', 0.28 * volume);
        });
      }
      // 36.0s: Cursor clicks dismiss cross on weather toast!
      else if (t >= 36 && t < 38) {
        setCursorPos({ x: 88, y: 17, isClicking: t < 36.6, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.14, x: -16, y: 18 });
        fireOnce('weather_dismiss', () => {
          playWeatherExitSound('deepocean', 0.2 * volume);
        });
      }
      // 38.0s: Weather toast dismisses smoothly
      else if (t >= 38 && t < 40) {
        setWeatherAlertActive(false);
        setCameraZoom({ scale: 1.05, x: 0, y: 0 });
        setCursorPos({ x: 50, y: 30, isClicking: false, isHand: true, isVisible: true });
      }
    }

    // --- CHAPTER 5: TURKEY TIME & HOROLOGY CHIME (40 - 46s) ---
    else if (t >= 40 && t < 46) {
      setActiveThemeId('caramel');
      setActiveStyle('countTo');
      setWeatherAlertActive(false);

      // 40.5s: Cursor hovers directly over the Turkey Time badge
      if (t >= 40 && t < 42.5) {
        setCursorPos({ x: 50, y: 28, isClicking: false, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.25, x: 0, y: 12 });
      }
      // 42.5s: Cursor clicks Turkey Time badge to sound Westminster chime!
      else if (t >= 42.5 && t < 46) {
        setCursorPos({ x: 50, y: 28, isClicking: t < 43.2, isHand: true, isVisible: true });
        setCameraZoom({ scale: 1.22, x: 0, y: 10 });
        fireOnce('horology_chime', () => {
          playHourlyChimeSound(14, 'caramel', 0.35 * volume);
        });
      }
    }

    // --- CHAPTER 6: GRAND FINALE (46 - 52s) ---
    else if (t >= 46) {
      setActiveThemeId('aurora');
      setActiveStyle('countTo');
      setWeatherAlertActive(false);
      setCameraZoom({ scale: 1.0, x: 0, y: 0 });
      setCursorPos({ x: 50, y: 65, isClicking: false, isHand: true, isVisible: false });
      fireOnce('finale_confetti', () => {
        try {
          fireCelebrationConfetti();
        } catch {
          // Ignore
        }
      });
    }
  }, [currentTime, isMuted, volume]);

  // Current chapter detection
  const currentChapter = useMemo(() => {
    return (
      CHAPTERS.find((ch) => currentTime >= ch.startTime && currentTime <= ch.endTime) ||
      CHAPTERS[0]
    );
  }, [currentTime]);

  // Seek handler
  const handleSeek = (targetSeconds: number) => {
    const clamped = Math.max(0, Math.min(VIDEO_DURATION, targetSeconds));
    setCurrentTime(clamped);
    // Reset triggers after seek
    Object.keys(triggeredEventsRef.current).forEach((k) => {
      triggeredEventsRef.current[k] = false;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    try {
      if (!videoRootRef.current) return;
      if (!document.fullscreenElement) {
        if (typeof videoRootRef.current.requestFullscreen === 'function') {
          videoRootRef.current.requestFullscreen().catch(() => {});
        }
        setIsFullscreen(true);
      } else {
        if (typeof document.exitFullscreen === 'function') {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch {
      // Ignored
    }
  };

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying]);

  const handleReturn = () => {
    if (onReturnToApp) {
      onReturnToApp();
      return;
    }
    try {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = '/';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Sample dynamic time object fed into real components
  const sampleTime: TimeRemaining = {
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: secondsTick,
    milliseconds: millisecondsTick,
    totalMs: 12345678,
    isPast: false,
    progressPercent: Math.min(100, Math.round(((currentTime % 20) / 20) * 100)),
  };

  const demoWeatherNotification: RealWeatherNotification = {
    header: 'CountTo Hava Durumu Zekası',
    message: 'Yağan Yağmur, Daha da Hızlanacak',
    iconType: 'heavyRain',
    temperature: 17,
    weatherCode: 63,
  };

  return (
    <div
      ref={videoRootRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      className="fixed inset-0 w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans z-50"
    >
      {/* =========================================================================
          CINEMATIC VIDEO STAGE (Full Viewport Responsive Canvas)
          ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
        {/* Virtual Camera Pan & Zoom Container */}
        <motion.div
          animate={{
            scale: cameraZoom.scale,
            x: `${cameraZoom.x}%`,
            y: `${cameraZoom.y}%`,
          }}
          transition={{
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1], // Smooth cinematic camera physics
          }}
          className="w-full h-full flex flex-col items-center justify-center relative p-6 sm:p-12"
          style={{
            background: currentTheme.bgGradient,
          }}
        >
          {/* Ambient Cosmic Radial Aura */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45 blur-3xl transition-colors duration-1000"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${currentTheme.primary} 0%, transparent 68%)`,
            }}
          />

          {/* Fullscreen Weather Toast Live Demo */}
          <FullscreenWeatherToast
            notification={weatherAlertActive ? demoWeatherNotification : null}
            onDismiss={() => setWeatherAlertActive(false)}
          />

          {/* REAL COUNTTO COMPONENT STAGE */}
          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-center">
            {/* Top Metadata Badge */}
            <div className="mb-4 flex items-center gap-2 flex-wrap justify-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all duration-500 ${
                  currentTime >= 40 && currentTime < 46
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/40'
                    : 'bg-white/10 border-white/15 text-neutral-200 backdrop-blur-md'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-current animate-spin" style={{ animationDuration: '9s' }} />
                <span>
                  {currentTime >= 40 && currentTime < 46
                    ? 'Türkiye Yerel Saati (UTC+3) · Canlı'
                    : 'CountTo · Geleceğe Geri Sayım'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 backdrop-blur-md">
                <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                <span>Tema: {currentTheme.name}</span>
              </div>
            </div>

            {/* Event Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-8 drop-shadow-2xl">
              {currentTime >= 40 && currentTime < 46 ? 'Şu Anki Saat' : 'Büyük Lansman Hedefi'}
            </h1>

            {/* REAL COUNTDOWN COMPONENTS (All 5 Styles) */}
            <div className="w-full flex items-center justify-center my-4 min-h-[140px] sm:min-h-[180px]">
              {activeStyle === 'countTo' && (
                <div className="scale-100 sm:scale-110 transition-transform">
                  <CountToRollView time={sampleTime} theme={currentTheme} showMilliseconds={true} />
                </div>
              )}

              {activeStyle === 'flip' && (
                <div className="scale-90 sm:scale-105 transition-transform">
                  <FlipCardView time={sampleTime} theme={currentTheme} showMilliseconds={false} />
                </div>
              )}

              {activeStyle === 'orbital' && (
                <div className="scale-85 sm:scale-100 transition-transform">
                  <OrbitalRingsView time={sampleTime} theme={currentTheme} showMilliseconds={false} />
                </div>
              )}

              {activeStyle === 'kinetic' && (
                <div className="scale-90 sm:scale-105 transition-transform">
                  <KineticRollView time={sampleTime} theme={currentTheme} showMilliseconds={false} />
                </div>
              )}

              {activeStyle === 'monolith' && (
                <div className="scale-90 sm:scale-100 transition-transform">
                  <MonolithView time={sampleTime} theme={currentTheme} showMilliseconds={false} />
                </div>
              )}
            </div>

            {/* Progress Journey Bar */}
            <div className="w-full max-w-md mt-6 px-4">
              <div className="flex justify-between text-xs text-neutral-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Zaman İlerlemesi
                </span>
                <span className="font-mono-numbers text-white">{sampleTime.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sampleTime.progressPercent}%`,
                    backgroundColor: currentTheme.primary,
                    boxShadow: `0 0 16px ${currentTheme.primary}`,
                  }}
                />
              </div>
            </div>

            {/* Simulated Floating Style Switcher (Reacts to clicks in video) */}
            <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 p-1.5 rounded-full bg-neutral-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
              {[
                { id: 'countTo', label: 'CountTo Rulo' },
                { id: 'flip', label: '3D Flip' },
                { id: 'orbital', label: 'Orbital' },
                { id: 'kinetic', label: 'Kinetik' },
              ].map((s) => (
                <div
                  key={s.id}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeStyle === s.id
                      ? 'bg-white text-neutral-950 font-bold shadow-lg scale-105'
                      : 'text-neutral-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grand Finale Card (Last 6 seconds) */}
          <AnimatePresence>
            {currentTime >= 46 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-neutral-950/90 backdrop-blur-3xl z-40 flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 18 }}
                  className="p-5 rounded-3xl bg-cyan-500/15 border border-cyan-500/40 mb-5 shadow-[0_0_60px_rgba(6,182,212,0.4)]"
                >
                  <Sparkles className="w-12 h-12 text-cyan-400" />
                </motion.div>

                <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tight mb-3">
                  CountTo • Zamanın Yeni Boyutu
                </h2>
                <p className="text-sm sm:text-lg text-neutral-300 max-w-xl mb-8 leading-relaxed">
                  25 sinematik renk teması, 5 fizik tabanlı 3D animasyon ve proaktif göksel hava durumu zekasıyla zamanı yeniden keşfedin.
                </p>

                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <button
                    onClick={handleReturn}
                    className="px-8 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-[0_10px_35px_rgba(6,182,212,0.45)] active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>Sayacı Hemen Kullan</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Filmi Baştan İzle</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* =========================================================================
            ANIMATED VIRTUAL HUMAN CURSOR
            Realistic mouse pointer gliding across the video and clicking elements
            ========================================================================= */}
        {cursorPos.isVisible && currentTime < 46 && (
          <motion.div
            animate={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              scale: cursorPos.isClicking ? 0.86 : 1,
            }}
            transition={{
              duration: 0.65,
              ease: [0.25, 1, 0.5, 1], // Natural human mouse movement physics
            }}
            className="absolute pointer-events-none z-50 -ml-2 -mt-2 transition-transform"
          >
            {/* Click Shockwave Halo Ring */}
            <AnimatePresence>
              {cursorPos.isClicking && (
                <motion.div
                  key="cursor-ripple"
                  initial={{ scale: 0.3, opacity: 0.95 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute -inset-5 rounded-full border-2 border-cyan-400 bg-cyan-400/30 pointer-events-none blur-xs"
                />
              )}
            </AnimatePresence>

            {/* SVG Cursor Pointer */}
            {cursorPos.isHand ? (
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
              >
                <path
                  d="M10 2a1.5 1.5 0 0 1 1.5 1.5V11h.75a1.25 1.25 0 0 1 1.25 1.25v.5h.5a1.25 1.25 0 0 1 1.25 1.25v.5h.5a1.25 1.25 0 0 1 1.25 1.25v3.25c0 2.21-1.79 4-4 4h-3c-1.66 0-3.14-.97-3.77-2.48l-1.92-4.57a1.5 1.5 0 0 1 2.76-1.16l1.18 2.82V3.5A1.5 1.5 0 0 1 10 2z"
                  fill="white"
                  stroke="#0a0a0c"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
              >
                <path
                  d="M3 3l7.5 18 2.5-7.5 7.5-2.5L3 3z"
                  fill="white"
                  stroke="#0a0a0c"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </motion.div>
        )}
      </div>

      {/* =========================================================================
          FLOATING TOP VIDEO OVERLAY (Auto-hiding)
          ========================================================================= */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 w-full p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between pointer-events-auto"
          >
            {/* Left: Return button */}
            <button
              onClick={handleReturn}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-xl active:scale-95 cursor-pointer shadow-lg"
              title="CountTo Sayacına Geri Dön"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>CountTo Sayacına Dön</span>
            </button>

            {/* Center: Chapter title badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-white/15 backdrop-blur-xl shadow-lg">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                {currentChapter.category} • {currentChapter.title}
              </span>
            </div>

            {/* Right: Video Specs Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[10px] font-mono font-bold tracking-wider text-cyan-300">
                4K HDR
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[10px] font-mono font-bold tracking-wider text-emerald-300">
                60 FPS
              </span>
              <button
                onClick={handleReturn}
                className="p-2 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* =========================================================================
          CINEMATIC LOWER THIRD SUBTITLE (Floating Lower Left)
          ========================================================================= */}
      <div className="relative z-30 px-6 sm:px-12 pb-2 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest mb-1.5 backdrop-blur-md">
              <Film className="w-3 h-3" />
              <span>{currentChapter.category}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {currentChapter.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium drop-shadow-sm mt-0.5">
              {currentChapter.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================================
          FLOATING BOTTOM VIDEO CONTROLS CHROME (Auto-hiding)
          ========================================================================= */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 w-full p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-10 select-none pointer-events-auto"
          >
            {/* Timeline Progress Scrubber with Chapter Notches */}
            <div className="relative mb-3.5 group cursor-pointer">
              {/* Background Track */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  handleSeek(ratio * VIDEO_DURATION);
                }}
                className="relative w-full h-2.5 group-hover:h-3.5 bg-white/20 hover:bg-white/30 rounded-full overflow-hidden transition-all duration-200"
              >
                {/* Active Playhead Fill */}
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-75 relative"
                  style={{
                    width: `${(currentTime / VIDEO_DURATION) * 100}%`,
                  }}
                />
              </div>

              {/* Chapter Marker Notches */}
              <div className="absolute inset-x-0 top-0 h-2.5 group-hover:h-3.5 pointer-events-none flex justify-between">
                {CHAPTERS.map((ch) => (
                  <div
                    key={ch.id}
                    style={{ left: `${(ch.startTime / VIDEO_DURATION) * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-black/70 shadow-sm"
                    title={ch.title}
                  />
                ))}
              </div>

              {/* Glowing Knob / Pin on Playhead */}
              <div
                className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-white border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] pointer-events-none transition-transform group-hover:scale-125"
                style={{
                  left: `calc(${(currentTime / VIDEO_DURATION) * 100}% - 8px)`,
                }}
              />
            </div>

            {/* Lower Control Bar: Buttons, Time, Chapters, Volume, Fullscreen */}
            <div className="flex items-center justify-between gap-3 text-white">
              {/* Left Group: Play/Pause, Rewind, Fast Forward, Timecode */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95 cursor-pointer shadow-md"
                  title={isPlaying ? 'Durdur (Boşluk)' : 'Oynat (Boşluk)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => handleSeek(currentTime - 5)}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="5 Saniye Geri (←)"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(currentTime + 5)}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="5 Saniye İleri (→)"
                >
                  <FastForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Baştan Başlat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Timecode */}
                <div className="text-xs font-mono font-medium text-neutral-300 ml-1">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="text-neutral-500 mx-1">/</span>
                  <span className="text-neutral-400">{formatTime(VIDEO_DURATION)}</span>
                </div>
              </div>

              {/* Right Group: Chapters Fast Jump, Speed, Audio, Fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Chapters Quick Jump Strip (Desktop) */}
                <div className="hidden lg:flex items-center gap-1.5">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSeek(ch.startTime)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        currentChapter.id === ch.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {idx + 1}. {ch.category}
                    </button>
                  ))}
                </div>

                {/* Playback Speed */}
                <button
                  onClick={() => {
                    const speeds = [0.75, 1, 1.25, 1.5];
                    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                    setPlaybackSpeed(next);
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-neutral-200 transition-colors cursor-pointer"
                  title="Oynatma Hızı"
                >
                  {playbackSpeed}x
                </button>

                {/* Volume / Mute */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Sesi Aç (M)' : 'Sesi Kapat (M)'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-cyan-400 cursor-pointer hidden sm:block"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Tam Ekran (F)"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
