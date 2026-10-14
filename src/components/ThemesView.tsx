import React from 'react';
import { Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { playThemeSound, playHoverClickSound } from '../utils/audio';
import { recordThemeSelection } from '../utils/themeRecommendations';
import { RecommendedThemesSlider } from './RecommendedThemesSlider';

interface ThemesViewProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onBackToDisplay: () => void;
  ambientEnabled?: boolean;
  onToggleAmbient?: () => void;
}

export const ThemesView: React.FC<ThemesViewProps> = ({
  currentTheme,
  onSelectTheme,
  onBackToDisplay,
  ambientEnabled = false,
  onToggleAmbient,
}) => {
  const themeIds = Object.keys(THEMES) as ThemeId[];
  const activeThemeConfig = THEMES[currentTheme];

  const handleCardClick = (tid: ThemeId) => {
    recordThemeSelection(tid);
    onSelectTheme(tid);
    playThemeSound(tid);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 z-10 select-none">
      {/* Sizin İçin Önerdiğimiz CountTo Temaları 3D Carousel Slider */}
      <RecommendedThemesSlider
        currentTheme={currentTheme}
        onSelectTheme={onSelectTheme}
      />

      {/* Clean Divider & Section Header */}
      <div className="mb-6 sm:mb-8 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Tüm Görsel Renk Temaları</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Geri sayım ekranınız için tasarlanmış {themeIds.length} farklı sinematik palet
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          {themeIds.length} Tema
        </span>
      </div>

      {/* Grid of Themes - Expansive 3 Columns with Generous Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {themeIds.map((tid) => {
          const t = THEMES[tid];
          const isSelected = tid === currentTheme;

          return (
            <div
              key={tid}
              onClick={() => handleCardClick(tid)}
              onMouseEnter={() => playHoverClickSound()}
              className={`group cursor-pointer rounded-3xl border p-6 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                isSelected
                  ? 'border-white/50 bg-neutral-900/90 ring-2 ring-white/20 shadow-2xl scale-[1.01]'
                  : 'border-white/10 bg-neutral-900/40 hover:border-white/25 hover:bg-neutral-900/60'
              }`}
              style={{
                boxShadow: isSelected ? `0 15px 35px -10px ${t.glow}` : undefined,
              }}
            >
              {/* Preview Gradient Sphere - Wide & Spacious */}
              <div className="relative h-32 sm:h-36 w-full rounded-2xl overflow-hidden mb-5 border border-white/10 flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-80"
                  style={{ background: t.bgGradient }}
                />
                <div
                  className="w-20 h-20 rounded-full blur-xl opacity-80 transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: t.primary }}
                />
                <div
                  className="w-14 h-14 rounded-full blur-lg opacity-70 -ml-6"
                  style={{ backgroundColor: t.secondary }}
                />
                {/* Sample numbers preview - Guaranteed single line with whitespace-nowrap */}
                <div className="relative z-10 font-mono-numbers text-2xl sm:text-3xl font-black text-white drop-shadow-md whitespace-nowrap tracking-wide flex items-center justify-center gap-2 select-none">
                  <span>07</span>
                  <span className="text-white/40 font-light text-xl sm:text-2xl pb-0.5">:</span>
                  <span>42</span>
                  <span className="text-white/40 font-light text-xl sm:text-2xl pb-0.5">:</span>
                  <span>19</span>
                </div>
              </div>

              {/* Title & Selection */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-white truncate tracking-tight">
                    {t.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-white/20 shrink-0"
                      style={{ backgroundColor: t.primary }}
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-white/20 shrink-0"
                      style={{ backgroundColor: t.secondary }}
                    />
                    <span className="text-xs text-neutral-400 capitalize">{tid}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-950 font-bold shadow-md shrink-0"
                    style={{ backgroundColor: t.primary }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/5 group-hover:bg-white/15 text-neutral-400 group-hover:text-white border border-white/5 transition-all shrink-0">
                    Seç
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minik Ambiyans Sesi Açma / Kapatma Switchi */}
      {onToggleAmbient && (
        <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-xl max-w-md mx-auto shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                ambientEnabled ? 'border-white/20 shadow-md' : 'border-white/5 bg-white/5 text-neutral-500'
              }`}
              style={
                ambientEnabled
                  ? { backgroundColor: `${activeThemeConfig.primary}25`, color: activeThemeConfig.primary }
                  : undefined
              }
            >
              {ambientEnabled ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Arka Plan Ambiyans Sesi</span>
                {ambientEnabled && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full inline-block animate-ping" 
                    style={{ backgroundColor: activeThemeConfig.primary }} 
                  />
                )}
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Seçili temanın kısık sesli, uzun ve süzülen kozmik akor akışı
              </p>
            </div>
          </div>

          {/* Smooth Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={ambientEnabled}
            onClick={onToggleAmbient}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              ambientEnabled ? 'bg-cyan-400' : 'bg-neutral-800'
            }`}
            style={ambientEnabled ? { backgroundColor: activeThemeConfig.primary } : undefined}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                ambientEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Return Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onBackToDisplay}
          className="px-6 py-2.5 rounded-full bg-neutral-900 border border-white/10 hover:border-white/25 text-white font-semibold text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Geri Sayım Ekranına Dön
        </button>
      </div>
    </div>
  );
};
