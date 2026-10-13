import React from 'react';
import { motion } from 'motion/react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface MonolithViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
  hideDays?: boolean;
  isVertical?: boolean;
}

export const MonolithView: React.FC<MonolithViewProps> = ({
  time,
  theme,
  showMilliseconds,
  hideDays = false,
  isVertical = false,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const padDays = (n: number) => (n > 99 ? String(n) : String(n).padStart(2, '0'));

  return (
    <motion.div 
      layout
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      {/* Monolith Container */}
      <div 
        className={`rounded-3xl backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500 ${
          isVertical 
            ? 'px-8 py-8 sm:px-12 sm:py-10' 
            : 'px-6 py-8 sm:px-10 sm:py-12 md:px-16 md:py-14'
        }`}
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: `0 25px 50px -12px ${theme.glow}`,
        }}
      >
        {/* Subtle horizontal gradient highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Primary Monolith Numbers Display */}
        <motion.div 
          layout
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`flex justify-center select-none ${
            isVertical 
              ? 'flex-col items-center gap-4 sm:gap-6' 
              : 'items-baseline gap-1.5 sm:gap-4 md:gap-6 flex-wrap'
          }`}
        >
          {/* Days - Hidden when hideDays is true */}
          {!hideDays && (
            <>
              <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
                  {padDays(time.days)}
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
                  GÜN
                </span>
              </motion.div>

              {!isVertical && (
                <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
                  :
                </span>
              )}
            </>
          )}

          {/* Hours */}
          <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.hours)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              SAAT
            </span>
          </motion.div>

          {!isVertical && (
            <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
              :
            </span>
          )}

          {/* Minutes */}
          <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.minutes)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              DAKİKA
            </span>
          </motion.div>

          {!isVertical && (
            <span className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4 animate-pulse">
              :
            </span>
          )}

          {/* Seconds */}
          <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
            <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none ${theme.numberColor}`}>
              {pad(time.seconds)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
              SANİYE
            </span>
          </motion.div>

          {showMilliseconds && (
            <>
              {!isVertical && (
                <span className="text-2xl sm:text-4xl text-neutral-600 font-light self-start pt-3">
                  .
                </span>
              )}
              <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
                <span className={`font-mono-numbers text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-none ${theme.textAccent}`}>
                  {pad(time.milliseconds)}
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
                  SALİSE
                </span>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
