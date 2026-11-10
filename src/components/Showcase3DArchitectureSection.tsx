import React, { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import { Layers, Volume2, Sparkles, CloudSun, Clock, StickyNote as StickyNoteIcon } from 'lucide-react';
import { ThemeConfig, TimeRemaining, CountdownStyle } from '../types/countdown';
import { STICKERS } from '../data/stickers';
import { RealWeatherNotification } from '../utils/weatherService';
import { playLiquidPopSound, playThemeSound } from '../utils/audio';

interface Showcase3DArchitectureSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  previewTheme: ThemeConfig;
  previewStyle: CountdownStyle;
  effectiveLiveTime: TimeRemaining;
  themeCount: number;
  realWeather: RealWeatherNotification | null;
  onFetchRealWeather: () => void;
}

const ARCHITECTURE_STEPS = [
  {
    id: 'ambient',
    num: '01',
    title: 'Size Özel Işık ve Atmosfer',
    componentName: '33 Canlı Tema',
    targetProgress: 0.2,
    accent: '#38bdf8',
    desc: 'Her Yere Hazır — CountTo’nun birbirinden eşsiz 33 teması sayesinde seçtiğiniz renkler ve yumuşak ışık geçişleri her anı size özel kılar.',
  },
  {
    id: 'engine',
    num: '02',
    title: 'GPU Hızlandırmalı Akıcı Saat',
    componentName: '5 Zaman Stili',
    targetProgress: 0.36,
    accent: '#22d3ee',
    desc: 'CountTo, GPU hızlandırmalı akıcı saat motoru ve 10 milisaniye salise hassasiyetiyle her anı size özel kılmayı başarıyor.',
  },
  {
    id: 'workspace',
    num: '03',
    title: 'Yapışkan Notlar ve 36 Sticker',
    componentName: '15 Animasyonlu Sticker',
    targetProgress: 0.52,
    accent: '#34d399',
    desc: 'Sayacınızın üzerine dilediğiniz kadar not yapıştırın, önemli satırları vurgulayın ve hareketli stickerlarla ekranınızı canlandırın.',
  },
  {
    id: 'weather',
    num: '04',
    title: '15 Dakika Önceden Hava Zekâsı',
    componentName: 'Anlık Konum Uyarısı',
    targetProgress: 0.68,
    accent: '#60a5fa',
    desc: 'Bulunduğunuz şehre özel anlık hava tahmini sayesinde yağmur başlamadan veya hava değişmeden 15 dakika önce haberdar olun.',
  },
  {
    id: 'audio',
    num: '05',
    title: 'Kristal Ses ve Saat Başı Çanı',
    componentName: 'Doğal Akustik',
    targetProgress: 0.82,
    accent: '#a78bfa',
    desc: 'Her saniyeye eşlik eden yumuşak kristal tikler, saat başı çanları ve seçtiğiniz temaya özel armonilerle zamanı hissedin.',
  },
  {
    id: 'unified',
    num: '06',
    title: 'Tek Ekranda Kusursuz Uyum',
    componentName: 'Hazır Sahne',
    targetProgress: 0.96,
    accent: '#ffffff',
    desc: 'Tüm bu katmanlar tek karede bir araya gelerek çalışma masanızdan sınıf tahtasına kadar her yerde kusursuz çalışır.',
  },
] as const;

export const Showcase3DArchitectureSection: React.FC<Showcase3DArchitectureSectionProps> = ({
  sectionRef,
  scrollContainerRef,
  previewTheme,
  previewStyle,
  effectiveLiveTime,
  themeCount,
  realWeather,
  onFetchRealWeather,
}) => {
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Raw scroll progress along the tall 310vh 3D choreography track
  const { scrollYProgress: rawArchProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Cinema-damped spring curve for butter-smooth optical camera motion
  const archProgress = useSpring(rawArchProgress, {
    stiffness: 95,
    damping: 26,
    mass: 0.45,
  });

  // Track active chapter index as user scrolls
  useMotionValueEvent(archProgress, 'change', (latest) => {
    if (latest < 0.26) setActiveStep(0);
    else if (latest < 0.42) setActiveStep(1);
    else if (latest < 0.58) setActiveStep(2);
    else if (latest < 0.74) setActiveStep(3);
    else if (latest < 0.87) setActiveStep(4);
    else setActiveStep(5);
  });

  // Interactive cursor micro-parallax on top of scroll rotation
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothPointerX = useSpring(pointerX, { stiffness: 120, damping: 20 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 120, damping: 20 });

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(normX * 10);
    pointerY.set(-normY * 8);
  };

  const handleStageMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  // Isometric camera angles driven by scroll
  const cameraRotateX = useTransform(
    archProgress,
    [0, 0.14, 0.5, 0.84, 1],
    [10, 50, 52, 46, 0]
  );
  const cameraRotateZ = useTransform(
    archProgress,
    [0, 0.14, 0.5, 0.84, 1],
    [-3, -24, -26, -20, 0]
  );
  const cameraScale = useTransform(
    archProgress,
    [0, 0.14, 0.5, 0.84, 1],
    [0.95, 0.86, 0.84, 0.88, 1]
  );

  // 5-Layer 3D Depth Separation & Orthogonal Exploded Offset + Magnetic Re-Assembly at 0.84 -> 1.0
  const z0 = useTransform(archProgress, [0.08, 0.25, 0.78, 0.96], [0, -165, -165, 0]);
  const y0 = useTransform(archProgress, [0.08, 0.25, 0.78, 0.96], [0, 128, 128, 0]);
  const x0 = useTransform(archProgress, [0.08, 0.25, 0.78, 0.96], [0, -40, -40, 0]);

  const z1 = useTransform(archProgress, [0.08, 0.34, 0.78, 0.96], [0, -60, -60, 0]);
  const y1 = useTransform(archProgress, [0.08, 0.34, 0.78, 0.96], [0, 48, 48, 0]);
  const x1 = useTransform(archProgress, [0.08, 0.34, 0.78, 0.96], [0, -14, -14, 0]);

  const z2 = useTransform(archProgress, [0.08, 0.48, 0.78, 0.96], [0, 48, 48, 0]);
  const y2 = useTransform(archProgress, [0.08, 0.48, 0.78, 0.96], [0, -32, -32, 0]);
  const x2 = useTransform(archProgress, [0.08, 0.48, 0.78, 0.96], [0, 12, 12, 0]);

  const z3 = useTransform(archProgress, [0.08, 0.62, 0.78, 0.96], [0, 155, 155, 0]);
  const y3 = useTransform(archProgress, [0.08, 0.62, 0.78, 0.96], [0, -112, -112, 0]);
  const x3 = useTransform(archProgress, [0.08, 0.62, 0.78, 0.96], [0, 36, 36, 0]);

  const z4 = useTransform(archProgress, [0.08, 0.75, 0.84, 0.96], [0, 255, 255, 0]);
  const y4 = useTransform(archProgress, [0.08, 0.75, 0.84, 0.96], [0, -188, -188, 0]);
  const x4 = useTransform(archProgress, [0.08, 0.75, 0.84, 0.96], [0, 58, 58, 0]);

  // Ambient floor reflection glow
  const floorGlowScale = useTransform(archProgress, [0, 0.5, 1], [0.8, 1.18, 0.95]);
  const floorGlowOpacity = useTransform(archProgress, [0, 0.25, 0.8, 1], [0.2, 0.55, 0.5, 0.35]);

  // Jump directly to a 3D exploded layer on click
  const scrollToLayerStep = (targetProgress: number) => {
    const container = scrollContainerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;
    playLiquidPopSound(0.16);
    const maxScrollWithinSection = section.offsetHeight - container.clientHeight;
    const targetTop = section.offsetTop + maxScrollWithinSection * targetProgress;
    container.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      className="relative h-[310vh] border-t border-white/5"
    >
      <div
        ref={stageContainerRef}
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
        className="sticky top-14 h-[calc(100vh-3.5rem)] max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center overflow-hidden"
      >
        {/* Top Section Heading + Live Layer Readout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#2997ff]">
              Derinlemesine Tasarım
            </p>
            <h2
              className="mt-1 text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Beş özel katman. Tek kusursuz sahne.
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="font-mono-numbers text-neutral-400">
              Adım {ARCHITECTURE_STEPS[activeStep].num} / 06
            </span>
            <span className="text-neutral-600">·</span>
            <span
              className="font-semibold transition-colors duration-300"
              style={{ color: ARCHITECTURE_STEPS[activeStep].accent }}
            >
              {ARCHITECTURE_STEPS[activeStep].title}
            </span>
          </div>
        </div>

        {/* Split Choreography Layout: Interactive Layer Index (Left) + 3D Exploded Camera Stage (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 5 Cols: Interactive Step-by-Step Scroll & Click Inspector */}
          <div className="lg:col-span-5 space-y-2">
            {ARCHITECTURE_STEPS.map((step, idx) => {
              const isCurrent = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToLayerStep(step.targetProgress)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-300 border cursor-pointer ${
                    isCurrent
                      ? 'bg-white/[0.08] border-white/25 shadow-[0_12px_35px_rgba(0,0,0,0.45)]'
                      : 'bg-white/[0.015] border-white/5 opacity-60 hover:opacity-95 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="font-mono-numbers text-xs font-bold"
                        style={{ color: isCurrent ? step.accent : '#737373' }}
                      >
                        {step.num}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono-numbers text-neutral-400 truncate max-w-[140px]">
                      {step.componentName.split(' ')[0]}
                    </span>
                  </div>

                  {isCurrent && (
                    <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed pl-6">
                      {step.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right 7 Cols: True 3D Isometric Exploded CountTo Stack */}
          <div
            className="lg:col-span-7 relative h-[390px] sm:h-[450px] flex items-center justify-center select-none"
            style={{ perspective: '1600px' }}
          >
            {/* Atmospheric optical floor reflection under the floating 3D planes */}
            <motion.div
              aria-hidden="true"
              style={{
                scale: floorGlowScale,
                opacity: floorGlowOpacity,
                x: smoothPointerX,
                y: smoothPointerY,
                background: `radial-gradient(ellipse at center, ${previewTheme.primary}66 0%, #2997ff33 45%, transparent 72%)`,
              }}
              className="pointer-events-none absolute w-[420px] h-[260px] rounded-full blur-[65px] translate-y-24"
            />

            {/* Master Camera Rig rotating smoothly on scroll + micro mouse tilt */}
            <motion.div
              style={{
                rotateX: cameraRotateX,
                rotateZ: cameraRotateZ,
                scale: cameraScale,
                rotateY: smoothPointerX,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-[460px] h-[250px] sm:h-[280px] flex items-center justify-center"
            >
              {/* ==================== KATMAN 01: OPTİK ARKA PLAN MOTORU ==================== */}
              <motion.div
                style={{
                  z: z0,
                  y: y0,
                  x: x0,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => scrollToLayerStep(ARCHITECTURE_STEPS[0].targetProgress)}
                className={`absolute inset-0 rounded-[26px] border transition-colors duration-300 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] cursor-pointer ${
                  activeStep === 0
                    ? 'border-sky-400 ring-2 ring-sky-400/40'
                    : 'border-white/20'
                }`}
              >
                <div
                  className="absolute inset-0 transition-all duration-700"
                  style={{ background: previewTheme.bgGradient }}
                />
                {/* Optical ambient light spheres */}
                <div
                  className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-2xl opacity-50"
                  style={{ backgroundColor: previewTheme.primary }}
                />
                <div
                  className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full blur-2xl opacity-40"
                  style={{ backgroundColor: previewTheme.secondary }}
                />
                <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-numbers font-semibold uppercase tracking-wider text-sky-300">
                      01 · Renk ve Atmosfer ({themeCount} Tema)
                    </span>
                    <span className="text-[11px] font-mono-numbers text-white/80">
                      {previewTheme.name.split(' (')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono-numbers text-neutral-300">
                    <span>Her Yere Hazır Canlı Işık Paleti</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: previewTheme.primary }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: previewTheme.secondary }}
                      />
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* ==================== KATMAN 02: MİLİMETRİK ZAMAN ÇEKİRDEĞİ ==================== */}
              <motion.div
                style={{
                  z: z1,
                  y: y1,
                  x: x1,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => scrollToLayerStep(ARCHITECTURE_STEPS[1].targetProgress)}
                className={`absolute inset-0 rounded-[26px] border bg-[#060913]/82 backdrop-blur-md p-5 flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.85)] cursor-pointer transition-colors duration-300 ${
                  activeStep === 1
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                    : 'border-cyan-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers font-semibold uppercase tracking-wider text-cyan-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>02 · GPU Hızlandırmalı Saat</span>
                  </span>
                  <span className="text-[11px] font-mono-numbers text-cyan-200/80">
                    İlerleme %{effectiveLiveTime.progressPercent.toFixed(0)}
                  </span>
                </div>

                {/* Live Real Ticking Time inside 3D Plane */}
                <div className="my-auto text-center">
                  <div className="font-mono-numbers text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(34,211,238,0.4)]">
                    {effectiveLiveTime.days > 0 ? `${pad(effectiveLiveTime.days)} : ` : ''}
                    {pad(effectiveLiveTime.hours)} : {pad(effectiveLiveTime.minutes)} :{' '}
                    {pad(effectiveLiveTime.seconds)}
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(8, effectiveLiveTime.progressPercent)}%`,
                      background: `linear-gradient(90deg, ${previewTheme.primary}, ${previewTheme.secondary})`,
                    }}
                  />
                </div>
              </motion.div>

              {/* ==================== KATMAN 03: YAPIŞKAN NOT & 36 STİCKER ==================== */}
              <motion.div
                style={{
                  z: z2,
                  y: y2,
                  x: x2,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => scrollToLayerStep(ARCHITECTURE_STEPS[2].targetProgress)}
                className={`absolute inset-0 rounded-[26px] border bg-[#09121a]/75 backdrop-blur-md p-5 flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.8)] cursor-pointer transition-colors duration-300 ${
                  activeStep === 2
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                    : 'border-emerald-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers font-semibold uppercase tracking-wider text-emerald-300">
                    <StickyNoteIcon className="w-3.5 h-3.5" />
                    <span>03 · Not & {STICKERS.length} Sticker Katmanı</span>
                  </span>
                  <span className="text-[11px] font-mono-numbers text-emerald-200/80">
                    Sürükle & Biçimlendir
                  </span>
                </div>

                {/* Live Mini Sticky Note + Real Animated SVG Stickers */}
                <div className="flex items-center justify-between gap-4 my-auto">
                  <div className="rounded-xl bg-amber-400/95 text-neutral-950 p-3 shadow-lg max-w-[210px] border border-amber-200/60">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider border-b border-black/15 pb-1 mb-1">
                      Çalışma Notu
                    </div>
                    <p className="text-[11px] font-semibold leading-snug">
                      Odak zamanı başladı. Hedefe kilitlen!
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {STICKERS.slice(0, 3).map((st) => (
                      <div key={st.id} className="scale-90">
                        {st.render()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] font-mono-numbers text-neutral-300">
                  15 Hareketli Sticker · Zengin Metin Düzenleme
                </div>
              </motion.div>

              {/* ==================== KATMAN 04: ANLIK HAVA & BİLDİRİM KATMANI ==================== */}
              <motion.div
                style={{
                  z: z3,
                  y: y3,
                  x: x3,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => scrollToLayerStep(ARCHITECTURE_STEPS[3].targetProgress)}
                className={`absolute inset-0 rounded-[26px] border bg-[#0b1322]/78 backdrop-blur-lg p-5 flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.8)] cursor-pointer transition-colors duration-300 ${
                  activeStep === 3
                    ? 'border-blue-400 ring-2 ring-blue-400/45'
                    : 'border-blue-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers font-semibold uppercase tracking-wider text-blue-300">
                    <CloudSun className="w-3.5 h-3.5" />
                    <span>04 · Akıllı Hava Durumu Bildirimi</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFetchRealWeather();
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#2997ff] hover:bg-[#1a88ff] text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    {realWeather ? 'Havayı Güncelle' : 'Şehrimin Havasını Gör'}
                  </button>
                </div>

                <div className="rounded-2xl bg-white/95 text-neutral-900 p-3.5 shadow-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      CountTo Hava Zekâsı
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
                      {realWeather
                        ? realWeather.message
                        : 'Yağmur ve hava değişimini 15 dakika önce bildirir'}
                    </p>
                  </div>
                  <div className="font-mono-numbers text-2xl sm:text-3xl font-extrabold text-neutral-900 shrink-0">
                    {realWeather ? `${realWeather.temperature}°C` : 'Canlı'}
                  </div>
                </div>

                <div className="text-[11px] font-mono-numbers text-blue-200/80">
                  Tam Ekran Zarif Bildirim Kartı & Yumuşak Uyarı Sesi
                </div>
              </motion.div>

              {/* ==================== KATMAN 05: KRİSTAL SES & AKOR KATMANI ==================== */}
              <motion.div
                style={{
                  z: z4,
                  y: y4,
                  x: x4,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => scrollToLayerStep(ARCHITECTURE_STEPS[4].targetProgress)}
                className={`absolute inset-0 rounded-[26px] border bg-[#111322]/78 backdrop-blur-xl p-5 flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.85)] cursor-pointer transition-colors duration-300 ${
                  activeStep === 4 || activeStep === 5
                    ? 'border-violet-400 ring-2 ring-violet-400/50'
                    : 'border-violet-400/35'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers font-semibold uppercase tracking-wider text-violet-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>05 · Kristal Ses & Akor Atölyesi</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playThemeSound(previewTheme.id, 0.24);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Temayı Dinle</span>
                  </button>
                </div>

                {/* Live Harmonic Frequency Spectrum Bars */}
                <div className="flex items-end justify-center gap-2 h-16 my-auto px-4">
                  {[42, 74, 58, 92, 68, 100, 76, 88, 52, 95, 64, 48].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [`${Math.max(20, h * 0.45)}%`, `${h}%`, `${Math.max(25, h * 0.55)}%`],
                      }}
                      transition={{
                        duration: 1.4 + (i % 4) * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-2.5 rounded-full"
                      style={{
                        background: `linear-gradient(to top, ${previewTheme.primary}, #a78bfa)`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-numbers text-violet-200/80">
                  <span>Her Saniyeye Eşlik Eden Doğal ve Akustik Tınılar</span>
                  <Layers className="w-3.5 h-3.5 text-violet-300" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
