import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface KineticRollViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
  hideDays?: boolean;
  isVertical?: boolean;
}

interface KineticDigitBoxProps {
  value: string;
  label: string;
  theme: ThemeConfig;
}

const KineticDigitBox: React.FC<KineticDigitBoxProps> = ({ value, label, theme }) => {
  return (
    <motion.div layout transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center">
      {/* Sleek Frosted Glass Container */}
      <div 
        className="relative w-20 h-24 sm:w-28 sm:h-32 md:w-36 md:h-40 rounded-2xl overflow-hidden flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-xl"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: `0 15px 35px -10px ${theme.glow}`,
        }}
      >
        {/* Soft top gradient highlight */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

        {/* Animated Rolling Number */}
        <div className="relative h-12 sm:h-16 md:h-20 flex items-center justify-center overflow-hidden w-full">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 28, opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ y: -28, opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
              transition={{
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`font-mono-numbers text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight select-none leading-none ${theme.numberColor}`}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Bottom subtle rim */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ backgroundColor: theme.primary, opacity: 0.6 }}
        />
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-neutral-400">
          {label}
        </span>
      </div>
    </motion.div>
  );
};

export const KineticRollView: React.FC<KineticRollViewProps> = ({ 
  time, 
  theme, 
  showMilliseconds,
  hideDays = false,
  isVertical = false,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const padDays = (n: number) => (n > 99 ? String(n) : String(n).padStart(2, '0'));

  const units = [
    ...(!hideDays ? [{ key: 'days', value: padDays(time.days), label: 'GÜN' }] : []),
    { key: 'hours', value: pad(time.hours), label: 'SAAT' },
    { key: 'minutes', value: pad(time.minutes), label: 'DAKİKA' },
    { key: 'seconds', value: pad(time.seconds), label: 'SANİYE' },
    ...(showMilliseconds ? [{ key: 'ms', value: pad(time.milliseconds), label: 'SALİSE' }] : []),
  ];

  return (
    <motion.div 
      layout
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center justify-center transition-all duration-500 ${
        isVertical ? 'flex-col gap-3.5 sm:gap-5' : 'flex-row gap-2.5 sm:gap-4 md:gap-6 flex-wrap'
      }`}
    >
      {units.map((unit, idx) => (
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
          >
            <KineticDigitBox value={unit.value} label={unit.label} theme={theme} />
          </motion.div>

          {!isVertical && idx < units.length - 1 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-7 sm:pb-9"
            >
              {unit.key === 'seconds' && showMilliseconds ? '.' : ':'}
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};
