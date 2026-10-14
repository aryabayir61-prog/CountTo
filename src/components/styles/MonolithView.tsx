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
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`flex justify-center select-none ${
            isVertical 
              ? 'flex-col items-center gap-4 sm:gap-6' 
              : 'items-baseline gap-1.5 sm:gap-4 md:gap-6 flex-wrap'
          }`}
        >
          {(() => {
            const units = [
              ...(!hideDays ? [{ key: 'days', value: padDays(time.days), label: 'GÜN', accent: false }] : []),
              { key: 'hours', value: pad(time.hours), label: 'SAAT', accent: false },
              { key: 'minutes', value: pad(time.minutes), label: 'DAKİKA', accent: false },
              { key: 'seconds', value: pad(time.seconds), label: 'SANİYE', accent: false },
              ...(showMilliseconds ? [{ key: 'ms', value: pad(time.milliseconds), label: 'SALİSE', accent: true }] : []),
            ];

            return units.map((unit, idx) => (
              <React.Fragment key={unit.key}>
                <motion.div
                  layout="position"
                  custom={idx}
                  variants={{
                    center: {
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.45,
                        delay: idx * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                    side: (i: number) => ({
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.62,
                        delay: i * 0.11, // Sequential stagger: Saat -> Dakika -> Saniye
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }),
                  }}
                  animate={isVertical ? 'side' : 'center'}
                  transition={{
                    layout: {
                      duration: 0.62,
                      delay: isVertical ? idx * 0.11 : idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                  className="flex flex-col items-center"
                >
                  <span className={`font-mono-numbers ${unit.accent ? 'text-3xl sm:text-5xl md:text-7xl font-bold' : 'text-5xl sm:text-7xl md:text-9xl font-black'} tracking-tighter leading-none ${unit.accent ? theme.textAccent : theme.numberColor}`}>
                    {unit.value}
                  </span>
                  <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-400 mt-2">
                    {unit.label}
                  </span>
                </motion.div>

                {!isVertical && idx < units.length - 1 && (
                  <motion.span
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-3xl sm:text-5xl md:text-7xl text-neutral-600 font-extralight self-start pt-2 sm:pt-4"
                  >
                    {unit.key === 'seconds' && showMilliseconds ? '.' : ':'}
                  </motion.span>
                )}
              </React.Fragment>
            ));
          })()}
        </motion.div>
      </div>
    </motion.div>
  );
};
