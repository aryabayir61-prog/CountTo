import React from 'react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface MonolithViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
}

export const MonolithView: React.FC<MonolithViewProps> = ({
  time,
  theme,
  showMilliseconds,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const padDays = (n: number) => (n > 99 ? String(n) : String(n).padStart(2, '0'));

  return (
    <div className="flex flex-col items-center">
      {/* Monolith Container */}
      <div 
        className="px-6 py-8 sm:px-10 sm:py-12 md:px-16 md:py-14 rounded-3xl backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: `0 25px 50px -12px ${theme.glow}`,
        }}
      >
        {/* Subtle horizontal gradient highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Primary Monolith Numbers Display */}
        <div className="flex items-baseline justify-center gap-1.5 sm:gap-4 md:gap-6 flex-wrap select-none">
          {/* Days */}
          <div className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {padDays(time.days)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              GÜN
            </span>
          </div>

          <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
            :
          </span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.hours)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              SAAT
            </span>
          </div>

          <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.minutes)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              DAKİKA
            </span>
          </div>

          <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.seconds)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              SANİYE
            </span>
          </div>

          {showMilliseconds && (
            <>
              <span className="text-2xl sm:text-4xl text-neutral-600 font-light self-start pt-3">
                .
              </span>
              <div className="flex flex-col items-center">
                <span className={`font-mono-numbers text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-none ${theme.textAccent}`}>
                  {pad(time.milliseconds)}
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
                  SALİSE
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
