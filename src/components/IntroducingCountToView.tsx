import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowLeft,
  Volume2,
  Sparkles,
  Plus,
  Copy,
  Check,
  CloudSun,
  RotateCcw,
  Clock,
  MapPin,
  Keyboard,
} from 'lucide-react';
import { CountdownEvent, CountdownStyle, ThemeId, TimeRemaining } from '../types/countdown';
import { StickyNote } from '../types/stickyNote';
import { THEMES } from '../utils/themes';
import { calculateTimeRemaining, getTurkeyTime, formatLocaleDate } from '../utils/time';
import {
  playTickSound,
  playCelebrationChime,
  playThemeSound,
  playHoverClickSound,
  playWeatherNotificationSound,
  playWeatherExitSound,
  playHourlyChimeSound,
  playPaperPageSound,
  playLiquidPopSound,
} from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import {
  getRealUserCoordinates,
  fetchRealWeather,
  RealWeatherNotification,
} from '../utils/weatherService';
import { STICKERS } from '../data/stickers';
import { CountToRollView } from './styles/CountToRollView';
import { FlipCardView } from './styles/FlipCardView';
import { OrbitalRingsView } from './styles/OrbitalRingsView';
import { KineticRollView } from './styles/KineticRollView';
import { MonolithView } from './styles/MonolithView';
import { StickyNoteItem } from './StickyNoteItem';
import { FullscreenWeatherToast } from './FullscreenWeatherToast';
import { Showcase3DArchitectureSection } from './Showcase3DArchitectureSection';
import { ShowcaseScrollMorphSection } from './ShowcaseScrollMorphSection';

interface IntroducingCountToViewProps {
  events: CountdownEvent[];
  activeEvent: CountdownEvent;
  onClose: () => void;
  onApplyThemeAndStyle: (eventId: string, themeId: ThemeId, style: CountdownStyle) => void;
  onOpenCreateModal: () => void;
}

const STYLE_OPTIONS: {
  id: CountdownStyle;
  name: string;
  tagline: string;
  keyHint: string;
}[] = [
  {
    id: 'countTo',
    name: 'CountTo Roll',
    tagline: 'Bölme çizgisi olmadan ipek gibi dikey rakam akışı',
    keyHint: '1',
  },
  {
    id: 'flip',
    name: '3D Mekanik Flip',
    tagline: 'Üstten katlanan klasik mekanik saat zarafeti',
    keyHint: '2',
  },
  {
    id: 'orbital',
    name: 'Yörünge Halkaları',
    tagline: 'Her zaman dilimi için ışıklı yörünge halkaları',
    keyHint: '3',
  },
  {
    id: 'kinetic',
    name: 'Buzlu Cam Kinetik',
    tagline: 'Derinlik hissi veren zarif buzlu cam kartlar',
    keyHint: '4',
  },
  {
    id: 'monolith',
    name: 'Saf Monolit',
    tagline: 'Akıllı tahtalardan geniş masalara kadar kristal netlik',
    keyHint: '5',
  },
];

const KEYBOARD_SHORTCUTS_REAL = [
  { key: 'F', label: 'Tam Ekran Sahnesi' },
  { key: 'N', label: 'Yeni Geri Sayım' },
  { key: 'L', label: 'Geri Sayım Listesi' },
  { key: 'T', label: '33 Tema Koleksiyonu' },
  { key: 'E', label: 'Aktif Sayacı Düzenle' },
  { key: 'S', label: 'Ses Efektleri Aç/Kapat' },
  { key: 'M', label: 'Salise Hassasiyeti' },
  { key: 'V', label: 'Dikey / Yatay Geçiş' },
  { key: '1 - 5', label: 'Anında Stil Değiştir' },
  { key: 'Çift Tık', label: 'Tam Ekran Geçişi' },
  { key: '?', label: 'Kısayol Rehberi' },
];

export const IntroducingCountToView: React.FC<IntroducingCountToViewProps> = ({
  events,
  activeEvent,
  onClose,
  onApplyThemeAndStyle,
  onOpenCreateModal,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const glowSectionRef = useRef<HTMLElement | null>(null);
  const designSectionRef = useRef<HTMLElement | null>(null);
  const highlightsSectionRef = useRef<HTMLElement | null>(null);
  const architectureSectionRef = useRef<HTMLElement | null>(null);
  const metricsSectionRef = useRef<HTMLElement | null>(null);

  // Interactive Sandbox State (using 100% genuine CountTo state & engines)
  const [previewEventId, setPreviewEventId] = useState<string>(activeEvent.id);
  const [previewStyle, setPreviewStyle] = useState<CountdownStyle>(activeEvent.style);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(activeEvent.theme);
  const [previewMilliseconds, setPreviewMilliseconds] = useState<boolean>(
    Boolean(activeEvent.showMilliseconds)
  );
  const [previewVertical, setPreviewVertical] = useState<boolean>(false);
  const [previewFocusSimulated, setPreviewFocusSimulated] = useState<boolean>(false);
  const [sandboxSoundOn, setSandboxSoundOn] = useState<boolean>(true);
  const [appliedBanner, setAppliedBanner] = useState<boolean>(false);

  // Classroom / Smartboard Live Preset in Highlights Slide 1
  const [classroomTargetIso, setClassroomTargetIso] = useState<string>(() =>
    new Date(Date.now() + 25 * 60 * 1000).toISOString()
  );
  const [classroomCreatedIso, setClassroomCreatedIso] = useState<string>(() =>
    new Date().toISOString()
  );
  const [classroomLabel, setClassroomLabel] = useState<string>('Pomodoro Odak Oturumu (25 dk)');

  // Genuine StickyNoteItem state in Highlights Slide 2
  const createInitialShowcaseNote = (): StickyNote => ({
    id: 'showcase-sticky-1',
    x: 24,
    y: 18,
    width: 300,
    height: 270,
    content:
      '<b>Sınav & Proje Planı</b><br/>• Hedef saate odaklan<br/>• Sağ üstten <i>sticker</i> ekle veya sürükle<br/>• Rengi dilediğin an değiştir',
    zIndex: 10,
    createdAt: 1000000, // Past timestamp so it doesn't auto-steal focus on mount
    stickers: [
      { id: 'st-init-1', stickerId: 'sparkle_star', x: 225, y: 12, rotation: -8, scale: 1 },
      { id: 'st-init-2', stickerId: 'focus_brain', x: 215, y: 112, rotation: 10, scale: 0.95 },
    ],
  });
  const [showcaseNote, setShowcaseNote] = useState<StickyNote | null>(createInitialShowcaseNote);

  // Real Open-Meteo Weather State in Highlights Slide 3
  const [realWeather, setRealWeather] = useState<RealWeatherNotification | null>(null);
  const [weatherCoords, setWeatherCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showcaseToast, setShowcaseToast] = useState<RealWeatherNotification | null>(null);

  // Web Audio Studio State in Highlights Slide 4
  const [lastPlayedAudio, setLastPlayedAudio] = useState<string | null>(null);

  // Share URL Copy State in Highlights Slide 6
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false);

  // Highlights Carousel State
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [carouselPlaying, setCarouselPlaying] = useState<boolean>(true);
  const totalSlides = 6;

  // Scroll-linked motion values on custom overlay scroll container with cinema spring damping
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  const { scrollYProgress: rawHeroProgress } = useScroll({
    container: scrollContainerRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const { scrollYProgress: rawGlowProgress } = useScroll({
    container: scrollContainerRef,
    target: glowSectionRef,
    offset: ['start end', 'center center'],
  });

  const { scrollYProgress: rawDesignProgress } = useScroll({
    container: scrollContainerRef,
    target: designSectionRef,
    offset: ['start end', 'center center'],
  });

  const heroScroll = useSpring(rawHeroProgress, { stiffness: 100, damping: 24, mass: 0.4 });
  const glowProgress = useSpring(rawGlowProgress, { stiffness: 95, damping: 24, mass: 0.45 });
  const designScaleProgress = useSpring(rawDesignProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.45,
  });

  // Hero 3D hardware lid tilt & bezel specular sheen sweep on scroll
  const heroLidRotateX = useTransform(heroScroll, [0, 0.75], [0, 18]);
  const heroLidScale = useTransform(heroScroll, [0, 0.85], [1, 0.91]);
  const heroLidY = useTransform(heroScroll, [0, 1], [0, 56]);
  const heroGlowSweepX = useTransform(heroScroll, [0, 0.65], ['-35%', '125%']);

  // Backlight illumination transforms (mirrors Apple PROLED XDR OLED illumination)
  const backlightOpacity = useTransform(glowProgress, [0, 0.45, 0.85, 1], [0.2, 0.52, 0.95, 1]);
  const backlightHaloOpacity = useTransform(glowProgress, [0.15, 0.65, 1], [0, 0.5, 0.85]);
  const backlightScale = useTransform(glowProgress, [0, 0.8, 1], [0.92, 0.99, 1]);
  const backlightBeamWidth = useTransform(glowProgress, [0.15, 0.9], ['12%', '74%']);

  // Design sandbox smooth 3D viewport lift on scroll
  const designStageScale = useTransform(designScaleProgress, [0, 1], [0.92, 1]);
  const designStageRotateX = useTransform(designScaleProgress, [0, 1], [12, 0]);
  const designStageOpacity = useTransform(designScaleProgress, [0, 0.35], [0.6, 1]);

  const previewTheme = THEMES[previewThemeId] || THEMES.aurora;
  const previewEvent = useMemo(
    () => events.find((e) => e.id === previewEventId) || activeEvent,
    [events, previewEventId, activeEvent]
  );

  // Real-time countdown & Turkey time computation
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(previewEvent.targetDate, previewEvent.createdAt)
  );
  const [trClock, setTrClock] = useState(() => getTurkeyTime());
  const [classroomRemaining, setClassroomRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(classroomTargetIso, classroomCreatedIso)
  );
  const prevSecRef = useRef<number>(-1);

  useEffect(() => {
    const interval = previewMilliseconds ? 45 : 250;
    const updateAll = () => {
      const nextRemaining = calculateTimeRemaining(
        previewEvent.targetDate,
        previewEvent.createdAt
      );
      const nextTr = getTurkeyTime();
      const nextClassroom = calculateTimeRemaining(
        classroomTargetIso,
        classroomCreatedIso
      );

      setTimeRemaining(nextRemaining);
      setTrClock(nextTr);
      setClassroomRemaining(nextClassroom);

      const currentSec = nextRemaining.isPast ? nextTr.seconds : nextRemaining.seconds;
      if (sandboxSoundOn && currentSec !== prevSecRef.current) {
        playTickSound(0.035);
      }
      prevSecRef.current = currentSec;
    };

    updateAll();
    const timer = setInterval(updateAll, interval);
    return () => clearInterval(timer);
  }, [
    previewEvent.targetDate,
    previewEvent.createdAt,
    previewMilliseconds,
    classroomTargetIso,
    classroomCreatedIso,
    sandboxSoundOn,
  ]);

  // Auto-advance highlights carousel when playing
  useEffect(() => {
    if (!carouselPlaying) return;
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 8500);
    return () => clearInterval(id);
  }, [carouselPlaying]);

  const effectiveLiveTime: TimeRemaining = timeRemaining.isPast
    ? {
        days: 0,
        hours: trClock.hours,
        minutes: trClock.minutes,
        seconds: trClock.seconds,
        milliseconds: trClock.milliseconds,
        totalMs: 0,
        isPast: false,
        progressPercent: 100,
      }
    : timeRemaining;

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) return;
    playHoverClickSound(0.05);
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLoadRealWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    playLiquidPopSound(0.18);
    try {
      const coords = await getRealUserCoordinates();
      setWeatherCoords(coords);
      const weather = await fetchRealWeather(true);
      if (weather) {
        setRealWeather(weather);
        playWeatherNotificationSound(previewThemeId, 0.2);
      } else {
        setWeatherError('Hava durumu bilgisine şu an ulaşılamadı.');
      }
    } catch {
      setWeatherError('Konum veya ağ izni alınamadı.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('title', previewEvent.title);
    url.searchParams.set('target', previewEvent.targetDate);
    url.searchParams.set('style', previewStyle);
    url.searchParams.set('theme', previewThemeId);
    return url.toString();
  }, [previewEvent.title, previewEvent.targetDate, previewStyle, previewThemeId]);

  const renderLiveCountdownEngine = (
    styleToRender: CountdownStyle,
    timeObj: TimeRemaining,
    hideDaysFlag: boolean
  ) => {
    switch (styleToRender) {
      case 'flip':
        return (
          <FlipCardView
            time={timeObj}
            theme={previewTheme}
            showMilliseconds={previewMilliseconds}
            hideDays={hideDaysFlag}
            isVertical={previewVertical}
          />
        );
      case 'orbital':
        return (
          <OrbitalRingsView
            time={timeObj}
            theme={previewTheme}
            showMilliseconds={previewMilliseconds}
            hideDays={hideDaysFlag}
            isVertical={previewVertical}
          />
        );
      case 'kinetic':
        return (
          <KineticRollView
            time={timeObj}
            theme={previewTheme}
            showMilliseconds={previewMilliseconds}
            hideDays={hideDaysFlag}
            isVertical={previewVertical}
          />
        );
      case 'monolith':
        return (
          <MonolithView
            time={timeObj}
            theme={previewTheme}
            showMilliseconds={previewMilliseconds}
            hideDays={hideDaysFlag}
            isVertical={previewVertical}
          />
        );
      case 'countTo':
      default:
        return (
          <CountToRollView
            time={timeObj}
            theme={previewTheme}
            showMilliseconds={previewMilliseconds}
            hideDays={hideDaysFlag}
            isVertical={previewVertical}
          />
        );
    }
  };

  const themeList = Object.values(THEMES);

  return (
    <motion.div
      ref={scrollContainerRef}
      initial={{ opacity: 0, scale: 1.015 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black text-white selection:bg-[#2997ff]/30 selection:text-white"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* ==================== STICKY KEYNOTE TOP BAR ==================== */}
      <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left Zone: Brand Wordmark */}
          <button
            type="button"
            onClick={() => scrollToSection(heroRef)}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group cursor-pointer"
          >
            <svg
              viewBox="0 0 28 28"
              className="w-6 h-6 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="2"
                width="24"
                height="24"
                rx="7"
                fill="none"
                stroke={previewTheme.primary}
                strokeWidth="2"
              />
              <path
                d="M14 7.5V14L18.5 16.5"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold tracking-tight text-base text-white">
              Karşınızda <span style={{ color: previewTheme.primary }}>CountTo</span>
            </span>
          </button>

          {/* Center Zone: 4 Clean Section Anchors */}
          <nav
            aria-label="Tanıtım Bölümleri"
            className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300"
          >
            <button
              type="button"
              onClick={() => scrollToSection(glowSectionRef)}
              className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
            >
              Zaman Motoru
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(designSectionRef)}
              className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
            >
              Özel Gösterim
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(highlightsSectionRef)}
              className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
            >
              Öne Çıkanlar
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(metricsSectionRef)}
              className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
            >
              Rakamlar
            </button>
          </nav>

          {/* Right Zone: Primary Exit / Return Action */}
          <button
            type="button"
            onClick={() => {
              playHoverClickSound(0.06);
              onClose();
            }}
            className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#2997ff] hover:bg-[#1a88ff] text-white px-4 py-1.5 text-xs font-semibold transition-all shadow-[0_0_20px_rgba(41,151,255,0.35)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CountTo&apos;ya Dön</span>
          </button>
        </div>

        {/* Hairline Scroll Progress Bar */}
        <motion.div
          className="h-[2px] w-full origin-left"
          style={{
            scaleX: scrollYProgress,
            background: `linear-gradient(90deg, #2997ff, ${previewTheme.primary}, ${previewTheme.secondary})`,
          }}
        />
      </header>

      {/* ==================== ACT 1: HERO REVEAL ==================== */}
      <section
        ref={heroRef}
        className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden"
      >
        {/* Subtle atmospheric backlight behind hero display */}
        <div
          className="pointer-events-none absolute top-28 left-1/2 -translate-x-1/2 w-[780px] h-[360px] rounded-full blur-[120px] opacity-25 transition-colors duration-700"
          style={{
            background: `radial-gradient(circle, ${previewTheme.primary}, transparent 70%)`,
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base font-semibold tracking-wide text-neutral-300 mb-3"
          >
            Karşınızda Yeni Nesil Zaman Sahnesi
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-[84px] font-extrabold tracking-tight leading-[1.03] text-white"
            style={{ textWrap: 'balance' }}
          >
            Hayallerinizin sayacı.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-sm sm:text-base text-neutral-400 font-medium"
          >
            {STYLE_OPTIONS.length} Özel Saat Stili · {themeList.length} Atmosfer Teması · {STICKERS.length} Sticker · Akıllı Hava Uyarısı
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base font-medium"
          >
            <button
              type="button"
              onClick={() => scrollToSection(designSectionRef)}
              className="inline-flex items-center gap-1 text-[#2997ff] hover:underline cursor-pointer"
            >
              <span>Canlı Sahneyi Dene</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(highlightsSectionRef)}
              className="inline-flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Tüm Yetenekleri Keşfet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Hero Hardware Viewport running CountTo's Live Countdown Engine with 3D Scroll Lid Physics */}
          <div style={{ perspective: '1500px' }} className="mt-12 sm:mt-16 relative mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                rotateX: heroLidRotateX,
                scale: heroLidScale,
                y: heroLidY,
                transformStyle: 'preserve-3d',
              }}
              className="relative"
            >
              <div className="rounded-[28px] p-2 sm:p-3 bg-gradient-to-b from-neutral-700/70 via-neutral-800/40 to-neutral-900/90 shadow-[0_35px_120px_rgba(0,0,0,0.95)] border border-white/15 relative overflow-hidden">
                {/* Specular glass reflection sweep on scroll */}
                <motion.div
                  aria-hidden="true"
                  style={{ left: heroGlowSweepX }}
                  className="pointer-events-none absolute top-0 bottom-0 w-44 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20"
                />

                {/* Top hardware camera notch */}
                <div className="relative rounded-[22px] overflow-hidden bg-[#06080f] min-h-[340px] sm:min-h-[410px] flex flex-col justify-between p-5 sm:p-8">
                {/* Live Theme Ambient Glow */}
                <div
                  className="pointer-events-none absolute inset-0 transition-all duration-700"
                  style={{ background: previewTheme.bgGradient }}
                />

                {/* Top Viewport Status Bar */}
                <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: previewTheme.primary }} />
                    <span className="truncate">{previewEvent.title}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-400">
                      {timeRemaining.isPast
                        ? trClock.dateFormatted
                        : formatLocaleDate(previewEvent.targetDate)}
                    </span>
                  </div>

                  {/* Camera Notch Pill (Hardware visual element) */}
                  <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-full bg-black/90 border border-white/10">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: previewTheme.primary }}
                    />
                    <span className="text-[11px] font-mono-numbers text-neutral-300">
                      {previewTheme.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSandboxSoundOn((prev) => !prev)}
                      className="text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {sandboxSoundOn ? 'Tik Sesi: Açık' : 'Tik Sesi: Sessiz'}
                    </button>
                  </div>
                </div>

                {/* Real CountTo Digit Engine Centerpiece */}
                <div className="relative z-10 my-auto py-8 flex items-center justify-center">
                  {renderLiveCountdownEngine(
                    previewStyle,
                    effectiveLiveTime,
                    timeRemaining.isPast
                  )}
                </div>

                {/* Bottom Quick Switcher Strip for Saved Events & 5 Real Styles */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {events.slice(0, 3).map((ev) => {
                      const active = ev.id === previewEvent.id;
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            playHoverClickSound(0.05);
                            setPreviewEventId(ev.id);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            active
                              ? 'bg-white text-black font-semibold'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          {ev.title}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {STYLE_OPTIONS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          playHoverClickSound(0.05);
                          setPreviewStyle(st.id);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                          previewStyle === st.id
                            ? 'bg-[#2997ff] text-white font-semibold'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== ACT 2: SCROLL-DRIVEN BACKLIGHT ILLUMINATION ==================== */}
      <section
        ref={glowSectionRef}
        className="relative py-28 sm:py-40 px-4 sm:px-6 overflow-hidden border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Monumental Backlit Typography (Scroll-Driven Glow like Apple PROLED XDR) */}
          <div className="relative py-10 sm:py-16 select-none">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mx-auto max-w-3xl blur-[90px]"
              style={{
                opacity: backlightHaloOpacity,
                background:
                  'radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(41,151,255,0.22) 45%, transparent 75%)',
              }}
            />

            <motion.div
              style={{
                opacity: backlightOpacity,
                scale: backlightScale,
              }}
              className="relative font-extrabold tracking-[0.06em] text-5xl sm:text-8xl md:text-[104px] leading-none text-white"
            >
              <span
                style={{
                  textShadow:
                    '0 0 36px rgba(255,255,255,0.55), 0 0 90px rgba(41,151,255,0.35)',
                }}
              >
                COUNTTO XDR
              </span>
            </motion.div>

            {/* Expanding OLED Horizon Aperture Beam on Scroll */}
            <motion.div
              aria-hidden="true"
              style={{
                width: backlightBeamWidth,
                opacity: backlightHaloOpacity,
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(41,151,255,0.85) 35%, #ffffff 50%, rgba(41,151,255,0.85) 65%, transparent 100%)',
              }}
              className="mx-auto mt-6 h-[1.5px] rounded-full shadow-[0_0_24px_rgba(41,151,255,0.8)]"
            />
          </div>

          <p className="mt-6 text-sm sm:text-base font-semibold text-neutral-300">
            GPU Hızlandırmalı Zaman Sahnesi
          </p>

          <h2
            className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            Parlak bir dokunuş.
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-xl text-neutral-400 leading-relaxed font-normal">
            CountTo, GPU hızlandırmalı akıcı saati ile her anı size özel kılmayı başarıyor.
            Göz yormayan akıcı rakam geçişleri, 3B yaprak katlanmaları, ışıklı yörünge halkaları ve
            dikkat dağıtan tüm öğeleri gizleyen odak moduyla zamanı bambaşka bir netlikte yaşatır.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => scrollToSection(architectureSectionRef)}
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#2997ff] hover:underline cursor-pointer"
            >
              <span>CountTo&apos;nun katmanlarını canlı inceleyin</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== ACT 3: SCROLL-SCALED INTERACTIVE DESIGN SANDBOX ==================== */}
      <section
        ref={designSectionRef}
        className="relative py-24 sm:py-36 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <p className="text-sm sm:text-base font-semibold text-neutral-300">Tasarım</p>
            <h2
              className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Özel gösterim.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-neutral-400 leading-relaxed">
              Karşınızda tüm gerçek bileşenleriyle CountTo Atölyesi. Beş farklı zaman stilini,
              dikey ve yatay geçiş animasyonlarını, 10 milisaniye salise sayacını ve {themeList.length} özgün
              temayı aşağıda doğrudan test edin.
            </p>
          </div>

          <div style={{ perspective: '1400px' }}>
            <motion.div
              style={{
                scale: designStageScale,
                rotateX: designStageRotateX,
                opacity: designStageOpacity,
                transformStyle: 'preserve-3d',
              }}
              className="rounded-[32px] border border-white/12 bg-[#07090f] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.85)]"
            >
            {/* Interactive Top Toolbar */}
            <div className="p-5 sm:p-7 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
              {/* 5 Style Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {STYLE_OPTIONS.map((styleOpt) => {
                  const selected = previewStyle === styleOpt.id;
                  return (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => {
                        playLiquidPopSound(0.18);
                        setPreviewStyle(styleOpt.id);
                      }}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selected
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {styleOpt.name}
                    </button>
                  );
                })}
              </div>

              {/* Precision, Orientation & Focus Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playHoverClickSound(0.06);
                    setPreviewMilliseconds((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    previewMilliseconds
                      ? 'bg-[#2997ff] text-white'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  Salise: {previewMilliseconds ? 'Açık (10ms)' : 'Kapalı'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playHoverClickSound(0.06);
                    setPreviewVertical((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    previewVertical
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  Dizilim: {previewVertical ? 'Dikey' : 'Yatay'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playHoverClickSound(0.06);
                    setPreviewFocusSimulated((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    previewFocusSimulated
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  {previewFocusSimulated ? 'Odak Modu: Aktif' : 'Odak Modu Önizle'}
                </button>
              </div>
            </div>

            {/* Live Stage Area */}
            <div className="relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-6 sm:p-10 overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 transition-all duration-700"
                style={{ background: previewTheme.bgGradient }}
              />

              {/* Subtle grid overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Stage Top Info Row (fades cleanly when Odak Modu is toggled!) */}
              <div
                className={`relative z-10 flex flex-wrap items-center justify-between gap-4 transition-opacity duration-500 ${
                  previewFocusSimulated ? 'opacity-15' : 'opacity-100'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    {STYLE_OPTIONS.find((s) => s.id === previewStyle)?.name}
                  </p>
                  <p className="text-sm text-neutral-300 mt-0.5">
                    {STYLE_OPTIONS.find((s) => s.id === previewStyle)?.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyThemeAndStyle(previewEvent.id, previewThemeId, previewStyle);
                    playCelebrationChime(0.18);
                    setAppliedBanner(true);
                    setTimeout(() => setAppliedBanner(false), 3000);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2997ff] hover:bg-[#1a88ff] text-white px-5 py-2 text-xs font-semibold shadow-lg transition-all cursor-pointer"
                >
                  {appliedBanner ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Ana Sayaca Uygulandı</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bu Görünümü Sayacıma Uygula</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real Active Countdown Component */}
              <div className="relative z-10 my-auto py-8 flex items-center justify-center">
                {renderLiveCountdownEngine(
                  previewStyle,
                  effectiveLiveTime,
                  timeRemaining.isPast
                )}
              </div>

              {/* Interactive 33-Theme Selector Strip */}
              <div
                className={`relative z-10 pt-5 border-t border-white/10 transition-opacity duration-500 ${
                  previewFocusSimulated ? 'opacity-20' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-300">
                    {themeList.length} Sinematik Tema · Tıklayıp Akorunu Dinleyin
                  </span>
                  <span className="text-xs font-mono-numbers text-neutral-400">
                    {previewTheme.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {themeList.map((themeItem) => {
                    const isSelected = themeItem.id === previewThemeId;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          setPreviewThemeId(themeItem.id);
                          playThemeSound(themeItem.id, 0.22);
                        }}
                        className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-white text-black border-white font-semibold shadow-md'
                            : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${themeItem.primary}, ${themeItem.secondary})`,
                          }}
                        />
                        <span>{themeItem.name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== ACT 4: INTERACTIVE HIGHLIGHTS CAROUSEL ==================== */}
      <section
        ref={highlightsSectionRef}
        className="relative py-24 sm:py-36 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Row matching Apple "İşte öne çıkan başlıklar." + "Filmi izleyin ▷" */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <h2
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              İşte öne çıkan başlıklar.
            </h2>

            <button
              type="button"
              onClick={() => {
                playCelebrationChime(0.22);
                fireCelebrationConfetti();
              }}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#2997ff] hover:underline self-start sm:self-end cursor-pointer"
            >
              <span>Kutlama çanını ve konfetiyi test et</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Rounded Dark Apple Showcase Card with Real Interactive Components inside each slide */}
          <div className="relative rounded-[32px] bg-[#0b0d14] border border-white/12 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.85)]">
            <div className="min-h-[540px] sm:min-h-[580px] p-6 sm:p-12 pb-24 flex flex-col justify-between relative">
              <AnimatePresence mode="wait">
                {/* ---------- SLIDE 0: AKILLI TAHTA & ODAK SAHNESİ ---------- */}
                {activeSlide === 0 && (
                  <motion.div
                    key="slide-0"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto"
                  >
                    <div className="lg:col-span-5 space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                        Sınıf, Etüt ve Tam Ekran Sahne
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                        Akıllı tahtadan çalışma masasına. Sıfır dikkat dağıtan odak.
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Deneme sınavlarında, ders atölyelerinde veya kütüphanede tek tuşla tam
                        ekrana geçin. İmleç hareketsiz kaldığında tüm butonlar pürüzsüzce kaybolur;
                        geriye yalnızca yüksek kontrastlı zaman kalır.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {[
                          { label: 'Pomodoro (25 dk)', mins: 25 },
                          { label: 'TYT / LGS Deneme (120 dk)', mins: 120 },
                          { label: 'Mola & Teneffüs (10 dk)', mins: 10 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              playLiquidPopSound(0.18);
                              const nowIso = new Date().toISOString();
                              setClassroomCreatedIso(nowIso);
                              setClassroomTargetIso(
                                new Date(Date.now() + preset.mins * 60 * 1000).toISOString()
                              );
                              setClassroomLabel(preset.label);
                            }}
                            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              classroomLabel === preset.label
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                      <div
                        className="rounded-2xl p-6 sm:p-10 border border-white/15 relative overflow-hidden"
                        style={{ background: previewTheme.bgGradient }}
                      >
                        <div className="flex items-center justify-between text-xs text-neutral-300 mb-6">
                          <span className="font-semibold">{classroomLabel}</span>
                          <span className="font-mono-numbers text-neutral-400">
                            Canlı Zaman Motoru
                          </span>
                        </div>
                        <div className="py-4 flex items-center justify-center">
                          <CountToRollView
                            time={classroomRemaining}
                            theme={previewTheme}
                            hideDays={classroomRemaining.days === 0}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---------- SLIDE 1: GERÇEK STICKY NOTE & 36 STICKER STÜDYOSU ---------- */}
                {activeSlide === 1 && (
                  <motion.div
                    key="slide-1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto"
                  >
                    <div className="lg:col-span-5 space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                        Etkileşimli Notlar & {STICKERS.length} Sticker
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                        Sayacınızın üzerine yapışkan notlar ekleyin ve stickerlarla süsleyin.
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Kalın, italik, altı çizili ve fosforlu metin biçimlendirme; 7 ayrı not
                        rengi, gerçekçi kağıt yırtma efekti ve 15&apos;i hareketli tam{' '}
                        {STICKERS.length} özgün sticker ile çalışma alanınızı kişiselleştirin.
                      </p>

                      {/* Live Sample of Real Animated Stickers */}
                      <div className="grid grid-cols-6 gap-2 pt-2">
                        {STICKERS.slice(0, 6).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            title={`${st.name} yapıştır`}
                            onClick={() => {
                              playLiquidPopSound(0.2);
                              setShowcaseNote((prev) => {
                                const base = prev || createInitialShowcaseNote();
                                return {
                                  ...base,
                                  stickers: [
                                    ...(base.stickers || []),
                                    {
                                      id: `st-${Date.now()}`,
                                      stickerId: st.id,
                                      x: 40 + ((base.stickers?.length || 0) * 35) % 180,
                                      y: 25 + ((base.stickers?.length || 0) * 28) % 110,
                                      rotation: Math.round(Math.random() * 20 - 10),
                                      scale: 1,
                                    },
                                  ],
                                };
                              });
                            }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                          >
                            {st.render()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genuine StickyNoteItem Live Interactive Container */}
                    <div className="lg:col-span-7">
                      <div className="relative h-[340px] rounded-2xl border border-white/15 bg-gradient-to-br from-neutral-900/95 to-black overflow-hidden">
                        {showcaseNote ? (
                          <StickyNoteItem
                            note={showcaseNote}
                            theme={previewTheme}
                            onUpdate={(_, updates) =>
                              setShowcaseNote((prev) => {
                                if (!prev) return null;
                                const clampedX =
                                  updates.x !== undefined
                                    ? Math.max(8, Math.min(260, updates.x))
                                    : prev.x;
                                const clampedY =
                                  updates.y !== undefined
                                    ? Math.max(8, Math.min(80, updates.y))
                                    : prev.y;
                                return { ...prev, ...updates, x: clampedX, y: clampedY };
                              })
                            }
                            onDelete={() => setShowcaseNote(null)}
                            onAddAnother={() =>
                              setShowcaseNote(createInitialShowcaseNote())
                            }
                            onBringToFront={() => {}}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-3">
                            <p className="text-sm text-neutral-400">
                              Kağıt yırtma efekti tamamlandı.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowcaseNote(createInitialShowcaseNote())}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-xs font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Yeni Yapışkan Not Aç</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---------- SLIDE 2: GERÇEK GPS & OPEN-METEO 15 DAKİKALIK HAVA ZEKASI ---------- */}
                {activeSlide === 2 && (
                  <motion.div
                    key="slide-2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto"
                  >
                    <div className="lg:col-span-6 space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                        Akıllı Hava Durumu Asistanı
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                        Yağmur başlamadan 15 dakika önce sizi nazikçe uyarır.
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Bulunduğunuz şehre özel canlı hava koşullarını otomatik takip eder. Hava
                        kapandığında, rüzgâr arttığında veya yağış yaklaştığında tam ekran zarif
                        bildirim kartıyla önceden haber verir.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleLoadRealWeather}
                          disabled={weatherLoading}
                          className="inline-flex items-center gap-2 rounded-full bg-[#2997ff] hover:bg-[#1a88ff] disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>
                            {weatherLoading
                              ? 'Şehrinizin Havası Alınıyor...'
                              : 'Konumumdan Canlı Havayı Gör'}
                          </span>
                        </button>

                        {realWeather && (
                          <button
                            type="button"
                            onClick={() => {
                              playWeatherNotificationSound(previewThemeId, 0.24);
                              setShowcaseToast(realWeather);
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all cursor-pointer"
                          >
                            <CloudSun className="w-4 h-4" />
                            <span>Tam Ekran Bildirim Kartını Aç</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-6">
                      <div className="rounded-2xl p-6 sm:p-8 border border-white/15 bg-black/60 min-h-[260px] flex flex-col justify-center">
                        {realWeather ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff]">
                                {realWeather.header}
                              </span>
                              {weatherCoords && (
                                <span className="text-xs font-mono-numbers text-neutral-400">
                                  {weatherCoords.latitude.toFixed(2)}°K ·{' '}
                                  {weatherCoords.longitude.toFixed(2)}°D
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-4">
                              <span className="font-mono-numbers text-5xl sm:text-6xl font-extrabold text-white">
                                {realWeather.temperature}°C
                              </span>
                              <div>
                                <p className="text-lg font-semibold text-white">
                                  {realWeather.message}
                                </p>
                                {realWeather.context && (
                                  <p className="text-xs text-neutral-400 mt-1">
                                    {realWeather.context}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-3 py-6">
                            <CloudSun className="w-10 h-10 text-[#2997ff] mx-auto" />
                            <p className="text-base font-semibold text-white">
                              Anlık Hava Zekâsı Hazır
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                              Sol taraftaki düğmeye tıklayarak bulunduğunuz konumun anlık sıcaklığını
                              ve yaklaşan hava değişimlerini görebilirsiniz.
                            </p>
                            {weatherError && (
                              <p className="text-xs text-rose-400 pt-1">{weatherError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---------- SLIDE 3: KRİSTAL SES & AKOR STÜDYOSU ---------- */}
                {activeSlide === 3 && (
                  <motion.div
                    key="slide-3"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto"
                  >
                    <div className="lg:col-span-5 space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                        Kristal Akustik Deneyim
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                        Her saniyeye ruh katan canlı ve berrak ses dokunuşları.
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        İster çalışırken sakin bir kristal tik sesi, ister her saat başında çalan
                        zarif bir saat gongu... CountTo tüm sesleri anında ve tertemiz bir doğallıkla
                        üretir.
                      </p>
                      {lastPlayedAudio && (
                        <p className="text-xs font-semibold text-emerald-400">
                          Şimdi Dinlenen: {lastPlayedAudio}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: 'Saat Başı Gong ve Çan',
                          desc: 'Her tam saatte çalan sıcak ve asil saat gongu',
                          play: () => playHourlyChimeSound(12, previewThemeId, 0.24),
                        },
                        {
                          title: 'Temaya Özel Akor',
                          desc: `${previewTheme.name.split(' (')[0]} atmosferine özel melodi`,
                          play: () => playThemeSound(previewThemeId, 0.28),
                        },
                        {
                          title: 'Hava Durumu Kristal Sesi',
                          desc: 'Hava değişimi bildirimine eşlik eden yumuşak akor',
                          play: () => playWeatherNotificationSound(previewThemeId, 0.25),
                        },
                        {
                          title: 'Kutlama Fanfarı',
                          desc: 'Geri sayım tamamlandığında çalan coşkulu zil',
                          play: () => playCelebrationChime(0.22),
                        },
                        {
                          title: 'Kağıt & Not Sesi',
                          desc: 'Yapışkan notları açarken duyulan gerçekçi kağıt dokusu',
                          play: () => playPaperPageSound(0.3),
                        },
                        {
                          title: 'Hassas Saniye Tiki',
                          desc: 'Odaklanmanızı destekleyen yumuşak saniye ritmi',
                          play: () => playTickSound(0.14),
                        },
                      ].map((soundItem) => (
                        <button
                          key={soundItem.title}
                          type="button"
                          onClick={() => {
                            soundItem.play();
                            setLastPlayedAudio(soundItem.title);
                          }}
                          className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-left transition-all flex items-start justify-between gap-3 group cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-[#2997ff] transition-colors">
                              {soundItem.title}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">{soundItem.desc}</p>
                          </div>
                          <Volume2 className="w-4 h-4 text-neutral-400 group-hover:text-[#2997ff] shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ---------- SLIDE 4: 33 ATMOSFERİK RENK & TEMA PALETİ ---------- */}
                {activeSlide === 4 && (
                  <motion.div
                    key="slide-4"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6 my-auto"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                          {themeList.length} Özgün Görsel Atmosfer
                        </p>
                        <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                          Her ruh haline ve her mekana özel ışık.
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyThemeAndStyle(previewEvent.id, previewThemeId, previewStyle);
                          playCelebrationChime(0.18);
                          onClose();
                        }}
                        className="rounded-full bg-[#2997ff] hover:bg-[#1a88ff] text-white px-5 py-2 text-xs font-semibold transition-all self-start cursor-pointer"
                      >
                        Seçili Temayla Sayaca Git →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                      {themeList.map((th) => {
                        const active = th.id === previewThemeId;
                        return (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => {
                              setPreviewThemeId(th.id);
                              playThemeSound(th.id, 0.22);
                            }}
                            className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                              active
                                ? 'bg-white text-black border-white font-semibold'
                                : 'bg-white/[0.04] text-neutral-200 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className="w-4 h-4 rounded-full shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${th.primary}, ${th.secondary})`,
                                }}
                              />
                              <span
                                className={`text-xs truncate ${
                                  active ? 'text-black font-semibold' : 'text-white font-medium'
                                }`}
                              >
                                {th.name.split(' (')[0]}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ---------- SLIDE 5: ANLIK URL PAYLAŞIMI, 11 KISAYOL & YEREL GİZLİLİK ---------- */}
                {activeSlide === 5 && (
                  <motion.div
                    key="slide-5"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto"
                  >
                    <div className="lg:col-span-6 space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2997ff]">
                        Tek Tıkla Paylaşım ve Tam Gizlilik
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                        Üyelik yok, kurulum yok. Tek bağlantıyla sevdiklerinize gönderin.
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Sayacınızın başlığı, hedef saati, animasyon stili ve teması doğrudan
                        paylaşım bağlantısına işlenir. Bağlantıyı açan herkes hiçbir ayar yapmadan
                        aynı canlı geri sayımı görür.
                      </p>

                      {/* Real Live Share URL Box */}
                      <div className="p-3.5 rounded-2xl bg-black/70 border border-white/15 flex items-center justify-between gap-3">
                        <code className="text-xs font-mono-numbers text-neutral-300 truncate">
                          {shareUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(shareUrl).catch(() => {});
                            }
                            playLiquidPopSound(0.2);
                            setCopiedShareUrl(true);
                            setTimeout(() => setCopiedShareUrl(false), 2500);
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          {copiedShareUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Bağlantıyı Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-6">
                      <div className="p-5 rounded-2xl bg-black/50 border border-white/10">
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-3">
                          <Keyboard className="w-4 h-4 text-[#2997ff]" />
                          <span>11 Anlık Klavye Kısayolu Mimarisi</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {KEYBOARD_SHORTCUTS_REAL.map((sc) => (
                            <div
                              key={sc.key}
                              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2.5"
                            >
                              <kbd className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono-numbers font-bold text-white shrink-0">
                                {sc.key}
                              </kbd>
                              <span className="text-[11px] text-neutral-300 truncate">
                                {sc.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Signature Apple Floating Bottom Capsule Navigation Bar */}
            <div className="pb-6 px-4 flex items-center justify-center gap-3 relative z-20">
              {/* Prev Arrow */}
              <button
                type="button"
                aria-label="Önceki özellik"
                onClick={() => {
                  playHoverClickSound(0.05);
                  setCarouselPlaying(false);
                  setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
                }}
                className="w-9 h-9 rounded-full bg-[#1d1d1f]/90 hover:bg-neutral-800 border border-white/12 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Progress Dots Capsule with Smooth Live Auto-Play Fill */}
              <div className="px-4 py-3 rounded-full bg-[#1d1d1f]/90 backdrop-blur-xl border border-white/12 flex items-center gap-2.5">
                {Array.from({ length: totalSlides }).map((_, idx) => {
                  const isCurrent = idx === activeSlide;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Slayt ${idx + 1}`}
                      onClick={() => {
                        playHoverClickSound(0.05);
                        setActiveSlide(idx);
                      }}
                      className={`relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? 'w-11 bg-white/25'
                          : 'w-2 bg-neutral-500/70 hover:bg-neutral-300'
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          key={`progress-${activeSlide}-${carouselPlaying}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: carouselPlaying ? 1 : 0.45 }}
                          transition={{
                            duration: carouselPlaying ? 8.5 : 0.35,
                            ease: 'linear',
                          }}
                          className="absolute inset-0 origin-left bg-white rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Arrow */}
              <button
                type="button"
                aria-label="Sonraki özellik"
                onClick={() => {
                  playHoverClickSound(0.05);
                  setCarouselPlaying(false);
                  setActiveSlide((prev) => (prev + 1) % totalSlides);
                }}
                className="w-9 h-9 rounded-full bg-[#1d1d1f]/90 hover:bg-neutral-800 border border-white/12 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Play / Pause Button */}
              <button
                type="button"
                aria-label={carouselPlaying ? 'Slayt geçişini duraklat' : 'Slayt geçişini oynat'}
                onClick={() => {
                  playHoverClickSound(0.05);
                  setCarouselPlaying((prev) => !prev);
                }}
                className="w-10 h-10 rounded-full bg-[#1d1d1f]/90 hover:bg-neutral-800 border border-white/12 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                {carouselPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ACT 5A: STICKY 5-ENGINE SCROLL MORPH & PARALLAX ENVIRONMENTS ==================== */}
      <ShowcaseScrollMorphSection
        scrollContainerRef={scrollContainerRef}
        previewTheme={previewTheme}
        effectiveLiveTime={effectiveLiveTime}
        isPast={timeRemaining.isPast}
        onSelectThemeAndStyle={(chosenThemeId, chosenStyle) => {
          setPreviewThemeId(chosenThemeId);
          setPreviewStyle(chosenStyle);
          scrollToSection(designSectionRef);
        }}
      />

      {/* ==================== ACT 5B: CINEMA-GRADE 3D EXPLODED LAYER ARCHITECTURE ==================== */}
      <Showcase3DArchitectureSection
        sectionRef={architectureSectionRef}
        scrollContainerRef={scrollContainerRef}
        previewTheme={previewTheme}
        previewStyle={previewStyle}
        effectiveLiveTime={effectiveLiveTime}
        themeCount={themeList.length}
        realWeather={realWeather}
        onFetchRealWeather={handleLoadRealWeather}
      />

      {/* ==================== ACT 6: MONUMENTAL TYPOGRAPHIC METRICS ("RAKAMLARIN GÜCÜ.") & FINALE ==================== */}
      <section
        ref={metricsSectionRef}
        className="relative py-28 sm:py-40 px-4 sm:px-6 border-t border-white/5 overflow-hidden"
      >
        {/* Subtle Apple sub-pixel dot-matrix backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <h2
            className="text-center text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-20 sm:mb-28"
            style={{ textWrap: 'balance' }}
          >
            Rakamların gücü.
          </h2>

          {/* Pure Typographic 3x2 Metrics Grid (Zero card borders, zero pills) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-14 gap-y-16 sm:gap-y-20">
            {[
              {
                stat: '60 FPS',
                desc: 'GPU hızlandırmalı saat akışı sayesinde pürüzsüz ve göz alıcı saniye geçişleri.',
              },
              {
                stat: `${themeList.length} Tema`,
                desc: 'CountTo’nun birbirinden eşsiz temaları sayesinde her anı size özel kılar.',
              },
              {
                stat: `${STYLE_OPTIONS.length} Stil`,
                desc: 'CountTo Roll, 3D Flip, Yörünge Halkaları, Kinetik ve Saf Monolit saat görünümleri.',
              },
              {
                stat: `${STICKERS.length} Sticker`,
                desc: '15 hareketli özgün çıkartma ile ders notlarınıza ve hedeflerinize enerji katın.',
              },
              {
                stat: '15 Dakika',
                desc: 'Bulunduğunuz şehre özel canlı tahminle hava değişimlerini 15 dakika önceden bildirme.',
              },
              {
                stat: `${events.length} Sayaç`,
                desc: 'Şu an tarayıcınızda anında çalışmaya hazır kayıtlı ve dinamik geri sayım.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ root: scrollContainerRef, once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="font-mono-numbers text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
                  {item.stat}
                </div>
                <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Keynote Closing Finale */}
          <div className="mt-28 sm:mt-36 pt-20 border-t border-white/10 text-center">
            <p className="text-sm sm:text-base font-semibold text-[#2997ff]">
              Karşınızda CountTo
            </p>
            <h3
              className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Her saniyeyi kendi sahnenize dönüştürün.
            </h3>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  playHoverClickSound(0.06);
                  onClose();
                }}
                className="rounded-full bg-[#2997ff] hover:bg-[#1a88ff] text-white px-8 py-4 text-sm sm:text-base font-semibold shadow-[0_0_30px_rgba(41,151,255,0.4)] transition-all cursor-pointer"
              >
                CountTo Geri Sayıma Dön
              </button>

              <button
                type="button"
                onClick={() => {
                  playLiquidPopSound(0.2);
                  onClose();
                  onOpenCreateModal();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:bg-white/10 text-white px-8 py-4 text-sm sm:text-base font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Geri Sayım Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Genuine FullscreenWeatherToast preview inside showcase when user clicks "Tam Ekran Bildirim Kartını Aç" */}
      <FullscreenWeatherToast
        notification={showcaseToast}
        onDismiss={() => {
          playWeatherExitSound(previewThemeId);
          setShowcaseToast(null);
        }}
      />
    </motion.div>
  );
};
