import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import { ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { playThemeSound, playHoverClickSound } from '../utils/audio';
import { getRecommendedThemes, recordThemeSelection } from '../utils/themeRecommendations';

interface RecommendedThemesSliderProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const RecommendedThemesSlider: React.FC<RecommendedThemesSliderProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Personalized & daily rotated recommended themes based on user preferences
  const recommendedThemeIds = useMemo(() => {
    return getRecommendedThemes(currentTheme);
  }, [currentTheme]);

  const total = recommendedThemeIds.length;

  // Auto-slide effect every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const handleApplyTheme = (themeId: ThemeId) => {
    recordThemeSelection(themeId);
    onSelectTheme(themeId);
    playThemeSound(themeId);
  };

  // Helper to calculate relative offset for circular wrapping
  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div
      className="mb-2 relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mini Title Label */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-300 uppercase tracking-wider">
          Sizin İçin Önerdiğimiz CountTo Temaları
        </h3>
      </div>

      {/* 3D Stepped Carousel Stage */}
      <div className="relative h-72 sm:h-76 w-full overflow-hidden flex items-center justify-center py-1">
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          {recommendedThemeIds.map((tid, idx) => {
            const offset = getOffset(idx);
            const isCenter = offset === 0;
            const themeConfig = THEMES[tid];
            const isThisSelected = currentTheme === tid;

            // Only render items within visual range [-2, 2]
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            // Stepped transforms matching user diagram
            let translateX = 0;
            let scale = 1;
            let zIndex = 30;
            let filter = 'none';

            if (offset === 0) {
              translateX = 0;
              scale = 1;
              zIndex = 30;
              filter = 'none';
            } else if (offset === -1) {
              translateX = -195;
              scale = 0.85;
              zIndex = 20;
              filter = 'brightness(0.65)';
            } else if (offset === 1) {
              translateX = 195;
              scale = 0.85;
              zIndex = 20;
              filter = 'brightness(0.65)';
            } else if (offset === -2) {
              translateX = -345;
              scale = 0.72;
              zIndex = 10;
              filter = 'brightness(0.38)';
            } else if (offset === 2) {
              translateX = 345;
              scale = 0.72;
              zIndex = 10;
              filter = 'brightness(0.38)';
            }

            return (
              <div
                key={tid}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(idx);
                    playHoverClickSound();
                  } else {
                    handleApplyTheme(tid);
                  }
                }}
                className={`group absolute w-[295px] sm:w-[390px] rounded-3xl border p-5 sm:p-6 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer select-none overflow-hidden bg-[#141418] ${
                  isCenter
                    ? isThisSelected
                      ? 'border-white/50 ring-2 ring-white/20'
                      : 'border-white/30 hover:border-white/45'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  filter,
                }}
              >
                {/* Preview Gradient Sphere - EXACT MATCH TO BOTTOM CARDS */}
                <div className="relative h-28 sm:h-34 w-full rounded-2xl overflow-hidden mb-4 sm:mb-5 border border-white/10 flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-80 transition-transform duration-500"
                    style={{ background: themeConfig.bgGradient }}
                  />
                  <div
                    className="w-20 h-20 rounded-full blur-xl opacity-80 transition-transform duration-300 group-hover:scale-125"
                    style={{ backgroundColor: themeConfig.primary }}
                  />
                  <div
                    className="w-14 h-14 rounded-full blur-lg opacity-70 -ml-6"
                    style={{ backgroundColor: themeConfig.secondary }}
                  />
                  {/* Sample numbers preview */}
                  <div className="relative z-10 font-mono-numbers text-2xl sm:text-3xl font-black text-white drop-shadow-md whitespace-nowrap tracking-wide flex items-center justify-center gap-2 select-none">
                    <span>07</span>
                    <span className="text-white/40 font-light text-xl sm:text-2xl pb-0.5">:</span>
                    <span>42</span>
                    <span className="text-white/40 font-light text-xl sm:text-2xl pb-0.5">:</span>
                    <span>19</span>
                  </div>
                </div>

                {/* Title & Selection - EXACT MATCH TO BOTTOM CARDS */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-white truncate tracking-tight">
                      {themeConfig.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-white/20 shrink-0"
                        style={{ backgroundColor: themeConfig.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-white/20 shrink-0"
                        style={{ backgroundColor: themeConfig.secondary }}
                      />
                      <span className="text-xs text-neutral-400 capitalize">{tid}</span>
                    </div>
                  </div>

                  {isThisSelected ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-950 font-bold shadow-md shrink-0"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCenter) {
                          handleApplyTheme(tid);
                        } else {
                          setActiveIndex(idx);
                          playHoverClickSound();
                        }
                      }}
                      className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/5 group-hover:bg-white/15 text-neutral-400 group-hover:text-white border border-white/5 transition-all shrink-0 cursor-pointer"
                    >
                      Seç
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
