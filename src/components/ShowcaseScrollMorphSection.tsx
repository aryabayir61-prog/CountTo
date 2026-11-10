import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from 'motion/react';
import { CountdownStyle, ThemeConfig, ThemeId, TimeRemaining } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { CountToRollView } from './styles/CountToRollView';
import { FlipCardView } from './styles/FlipCardView';
import { OrbitalRingsView } from './styles/OrbitalRingsView';
import { KineticRollView } from './styles/KineticRollView';
import { MonolithView } from './styles/MonolithView';
import { playLiquidPopSound, playThemeSound } from '../utils/audio';

interface ShowcaseScrollMorphSectionProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  previewTheme: ThemeConfig;
  effectiveLiveTime: TimeRemaining;
  isPast: boolean;
  onSelectThemeAndStyle: (themeId: ThemeId, style: CountdownStyle) => void;
}

const MORPH_STAGES: {
  id: CountdownStyle;
  num: string;
  name: string;
  headline: string;
  desc: string;
  scrollTarget: number;
}[] = [
  {
    id: 'countTo',
    num: '01',
    name: 'CountTo Roll',
    headline: 'Sıfır çizgi. İpek gibi dikey akış.',
    desc: 'Klasik rakam çizgilerini ortadan kaldırır; her saniye geçişini göz yormayan yumuşak bir ışık ve netlik şölenine dönüştürür.',
    scrollTarget: 0.12,
  },
  {
    id: 'flip',
    num: '02',
    name: '3D Mekanik Flip',
    headline: 'Üstten katlanan klasik kart zarafeti.',
    desc: 'Havalimanı ve meydan saatlerinin ikonik yaprak devrilme hissini akıcı 3B derinlikle çalışma masanıza getirir.',
    scrollTarget: 0.32,
  },
  {
    id: 'orbital',
    num: '03',
    name: 'Yörünge Halkaları',
    headline: 'Zamanın ışıklı halkaları.',
    desc: 'Gün, saat, dakika ve saniye birimlerini kendi yörüngesinde dönen zarif halkalar ve yumuşak renk parıltılarıyla gösterir.',
    scrollTarget: 0.52,
  },
  {
    id: 'kinetic',
    num: '04',
    name: 'Buzlu Cam Kinetik',
    headline: 'Derinlik hissi veren modern cam paneller.',
    desc: 'Seçtiğiniz temanın ışığını süzen zarif cam çerçeveler içinde her saniyede canlı nefes alan modern tasarım.',
    scrollTarget: 0.72,
  },
  {
    id: 'monolith',
    num: '05',
    name: 'Saf Monolit',
    headline: 'Odanın öbür ucundan bile anında net.',
    desc: 'Okullardaki akıllı tahtalar, etüt salonları ve geniş çalışma alanları için en yüksek okunabilirlik ve yalınlık.',
    scrollTarget: 0.9,
  },
];

const SHOWCASE_ENVIRONMENTS: {
  title: string;
  context: string;
  themeId: ThemeId;
  style: CountdownStyle;
}[] = [
  {
    title: 'Akıllı Tahta Sınav Sayacı',
    context: 'Sınıf & Etüt Salonu · Yüksek Kontrast',
    themeId: 'aurora',
    style: 'countTo',
  },
  {
    title: 'Stüdyo Canlı Yayın Saati',
    context: 'Prodüksiyon & Reji · 10 ms Salise',
    themeId: 'cyber',
    style: 'flip',
  },
  {
    title: 'Gece Kütüphane Odak Masası',
    context: 'Sessiz Çalışma · Sıfır Göz Yorgunluğu',
    themeId: 'midnight',
    style: 'orbital',
  },
  {
    title: 'Yazılım Lansman Geri Sayımı',
    context: 'Proje Teslim & Tanıtım Ekranı',
    themeId: 'violet',
    style: 'kinetic',
  },
  {
    title: 'Sabah Antrenman & Koşu',
    context: 'Dinamik Tempo · Geniş Tipografi',
    themeId: 'emerald',
    style: 'monolith',
  },
  {
    title: 'Yılbaşı & Özel Kutlama',
    context: 'Tam Ekran Sahne · Konfeti & Çan',
    themeId: 'gold',
    style: 'countTo',
  },
];

export const ShowcaseScrollMorphSection: React.FC<ShowcaseScrollMorphSectionProps> = ({
  scrollContainerRef,
  previewTheme,
  effectiveLiveTime,
  isPast,
  onSelectThemeAndStyle,
}) => {
  const morphSectionRef = useRef<HTMLElement | null>(null);
  const ribbonSectionRef = useRef<HTMLElement | null>(null);
  const [stageIdx, setStageIdx] = useState<number>(0);

  const { scrollYProgress: rawMorph } = useScroll({
    container: scrollContainerRef,
    target: morphSectionRef,
    offset: ['start start', 'end end'],
  });

  const morphProgress = useSpring(rawMorph, {
    stiffness: 100,
    damping: 26,
    mass: 0.4,
  });

  useMotionValueEvent(morphProgress, 'change', (v) => {
    if (v < 0.22) setStageIdx(0);
    else if (v < 0.42) setStageIdx(1);
    else if (v < 0.62) setStageIdx(2);
    else if (v < 0.82) setStageIdx(3);
    else setStageIdx(4);
  });

  // 3D Stage subtle cinema swing across the 5 scroll chapters
  const stageRotateY = useTransform(morphProgress, [0, 0.25, 0.5, 0.75, 1], [-8, 5, -5, 6, 0]);
  const stageRotateX = useTransform(morphProgress, [0, 0.5, 1], [8, 12, 4]);
  const stageScale = useTransform(morphProgress, [0, 0.5, 1], [0.95, 1, 0.97]);

  // Dual opposing horizontal scroll-parallax tracks
  const { scrollYProgress: rawRibbon } = useScroll({
    container: scrollContainerRef,
    target: ribbonSectionRef,
    offset: ['start end', 'end start'],
  });
  const ribbonProgress = useSpring(rawRibbon, { stiffness: 90, damping: 24 });
  const topRowX = useTransform(ribbonProgress, [0, 1], [48, -110]);
  const bottomRowX = useTransform(ribbonProgress, [0, 1], [-110, 48]);

  const activeStage = MORPH_STAGES[stageIdx];

  const jumpToStage = (target: number) => {
    const container = scrollContainerRef.current;
    const sec = morphSectionRef.current;
    if (!container || !sec) return;
    playLiquidPopSound(0.16);
    const maxScroll = sec.offsetHeight - container.clientHeight;
    container.scrollTo({
      top: sec.offsetTop + maxScroll * target,
      behavior: 'smooth',
    });
  };

  const renderStageEngine = () => {
    switch (activeStage.id) {
      case 'flip':
        return (
          <FlipCardView
            time={effectiveLiveTime}
            theme={previewTheme}
            showMilliseconds={false}
            hideDays={isPast}
          />
        );
      case 'orbital':
        return (
          <OrbitalRingsView
            time={effectiveLiveTime}
            theme={previewTheme}
            showMilliseconds={false}
            hideDays={isPast}
          />
        );
      case 'kinetic':
        return (
          <KineticRollView
            time={effectiveLiveTime}
            theme={previewTheme}
            showMilliseconds={false}
            hideDays={isPast}
          />
        );
      case 'monolith':
        return (
          <MonolithView
            time={effectiveLiveTime}
            theme={previewTheme}
            showMilliseconds={false}
            hideDays={isPast}
          />
        );
      case 'countTo':
      default:
        return (
          <CountToRollView
            time={effectiveLiveTime}
            theme={previewTheme}
            showMilliseconds={false}
            hideDays={isPast}
          />
        );
    }
  };

  return (
    <>
      {/* ==================== PART A: STICKY SCROLL-MORPHING 5 ENGINES ==================== */}
      <section
        ref={morphSectionRef}
        className="relative h-[220vh] border-t border-white/5"
      >
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 5 Cols: Scroll-Synced Editorial Copy + Ring Progress */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90 shrink-0">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#2997ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ pathLength: morphProgress }}
                  />
                </svg>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#2997ff]">
                  Motor {activeStage.num} / 05 · {activeStage.name}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <h2
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]"
                    style={{ textWrap: 'balance' }}
                  >
                    {activeStage.headline}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                    {activeStage.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Clickable Stage Selector Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {MORPH_STAGES.map((st, idx) => {
                  const selected = idx === stageIdx;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => jumpToStage(st.scrollTarget)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selected
                          ? 'bg-white text-black shadow-md'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {st.num}. {st.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 7 Cols: 3D Perspective Live Morphing Engine Viewport */}
            <div
              className="lg:col-span-7 flex items-center justify-center"
              style={{ perspective: '1400px' }}
            >
              <motion.div
                style={{
                  rotateY: stageRotateY,
                  rotateX: stageRotateX,
                  scale: stageScale,
                  transformStyle: 'preserve-3d',
                }}
                className="w-full rounded-[30px] p-2.5 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/15 shadow-[0_35px_120px_rgba(0,0,0,0.9)]"
              >
                <div
                  className="relative rounded-[24px] overflow-hidden min-h-[310px] sm:min-h-[360px] p-6 sm:p-10 flex flex-col justify-between"
                  style={{ background: previewTheme.bgGradient }}
                >
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-semibold">{activeStage.name}</span>
                    <span className="font-mono-numbers text-neutral-400">
                      Gerçek Zamanlı Render
                    </span>
                  </div>

                  <div className="my-auto py-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStage.id}
                        initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {renderStageEngine()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-white/10">
                    <span>Tema: {previewTheme.name.split(' (')[0]}</span>
                    <span className="font-mono-numbers">GPU Hızlandırmalı Akış</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PART B: DUAL OPPOSING HORIZONTAL PARALLAX RIBBON ==================== */}
      <section
        ref={ribbonSectionRef}
        className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold text-[#2997ff]">Her Yere Hazır</p>
          <h2
            className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            CountTo&apos;nun birbirinden zengin temaları sayesinde her anı size özel kılar.
          </h2>
        </div>

        {/* Opposing Scroll-Linked Parallax Track 1 (Slides Left on Scroll) */}
        <motion.div
          style={{ x: topRowX }}
          className="flex items-stretch gap-5 px-4 mb-5 w-max"
        >
          {[
            ...SHOWCASE_ENVIRONMENTS.slice(0, 3),
            ...SHOWCASE_ENVIRONMENTS.slice(0, 2),
          ].map((env, idx) => {
            const themeObj = THEMES[env.themeId];
            return (
              <div
                key={`${env.title}-top-${idx}`}
                onClick={() => {
                  playThemeSound(env.themeId, 0.22);
                  onSelectThemeAndStyle(env.themeId, env.style);
                }}
                className="w-[330px] sm:w-[410px] shrink-0 rounded-3xl border border-white/12 p-6 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: themeObj.bgGradient }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${themeObj.primary}, ${themeObj.secondary})`,
                    }}
                  />
                  <span className="text-[11px] font-mono-numbers text-neutral-300">
                    {String(effectiveLiveTime.hours).padStart(2, '0')}:
                    {String(effectiveLiveTime.minutes).padStart(2, '0')}:
                    {String(effectiveLiveTime.seconds).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                  {env.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1">{env.context}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Opposing Scroll-Linked Parallax Track 2 (Slides Right on Scroll) */}
        <motion.div
          style={{ x: bottomRowX }}
          className="flex items-stretch gap-5 px-4 w-max"
        >
          {[
            ...SHOWCASE_ENVIRONMENTS.slice(3, 6),
            ...SHOWCASE_ENVIRONMENTS.slice(3, 5),
          ].map((env, idx) => {
            const themeObj = THEMES[env.themeId];
            return (
              <div
                key={`${env.title}-bottom-${idx}`}
                onClick={() => {
                  playThemeSound(env.themeId, 0.22);
                  onSelectThemeAndStyle(env.themeId, env.style);
                }}
                className="w-[330px] sm:w-[410px] shrink-0 rounded-3xl border border-white/12 p-6 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: themeObj.bgGradient }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${themeObj.primary}, ${themeObj.secondary})`,
                    }}
                  />
                  <span className="text-[11px] font-mono-numbers text-neutral-300">
                    {String(effectiveLiveTime.hours).padStart(2, '0')}:
                    {String(effectiveLiveTime.minutes).padStart(2, '0')}:
                    {String(effectiveLiveTime.seconds).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#2997ff] transition-colors">
                  {env.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1">{env.context}</p>
              </div>
            );
          })}
        </motion.div>
      </section>
    </>
  );
};
