import React from 'react';
import { Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { playThemeSound, playHoverClickSound } from '../utils/audio';

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
    onSelectTheme(tid);
    playThemeSound(tid);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 z-10 select-none">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Görsel Renk Temaları
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Geri sayım ekranınızın atmosferini tek bir dokunuşla kişiselleştirin.
        </p>
      </div>

      {/* Grid of Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {themeIds.map((tid) => {
          const t = THEMES[tid];
          const isSelected = tid === currentTheme;

          return (
            <div
              key={tid}
              onClick={() => handleCardClick(tid)}
              onMouseEnter={() => playHoverClickSound()}
              className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                isSelected
                  ? 'border-white/50 bg-neutral-900/90 ring-2 ring-white/20 shadow-2xl scale-[1.01]'
                  : 'border-white/10 bg-neutral-900/40 hover:border-white/25 hover:bg-neutral-900/60'
              }`}
              style={{
                boxShadow: isSelected ? `0 15px 35px -10px ${t.glow}` : undefined,
              }}
            >
              {/* Preview Gradient Sphere */}
              <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-80"
                  style={{ background: t.bgGradient }}
                />
                <div
                  className="w-16 h-16 rounded-full blur-lg opacity-80 transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: t.primary }}
                />
                <div
                  className="w-10 h-10 rounded-full blur-md opacity-70 -ml-4"
                  style={{ backgroundColor: t.secondary }}
                />
                {/* Sample numbers preview */}
                <div className="relative z-10 font-mono-numbers text-2xl font-black text-white drop-shadow-md">
                  07 : 42 : 19
                </div>
              </div>

              {/* Title & Selection */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                      style={{ backgroundColor: t.primary }}
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                      style={{ backgroundColor: t.secondary }}
                    />
                    <span className="text-xs text-neutral-400 capitalize">{tid}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-950 font-bold shadow-md"
                    style={{ backgroundColor: t.primary }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 group-hover:bg-white/15 text-neutral-400 group-hover:text-white border border-white/5 transition-all">
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
