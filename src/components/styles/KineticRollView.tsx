import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface KineticRollViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
}

interface KineticDigitBoxProps {
  value: string;
  label: string;
  theme: ThemeConfig;
}

const KineticDigitBox: React.FC<KineticDigitBoxProps> = ({ value, label, theme }) => {
  return (
    <div className="flex flex-col items-center">
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
    </div>
  );
};

export const KineticRollView: React.FC<KineticRollViewProps> = ({
  time,
  theme,
  showMilliseconds,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const padDays = (n: number) => (n > 99 ? String(n) : String(n).padStart(2, '0'));

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 flex-wrap">
      <KineticDigitBox value={padDays(time.days)} label="GÜN" theme={theme} />

      <div className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-7 sm:pb-9">
        :
      </div>

      <KineticDigitBox value={pad(time.hours)} label="SAAT" theme={theme} />

      <div className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-7 sm:pb-9">
        :
      </div>

      <KineticDigitBox value={pad(time.minutes)} label="DAKİKA" theme={theme} />

      <div className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-7 sm:pb-9">
        :
      </div>

      <KineticDigitBox value={pad(time.seconds)} label="SANİYE" theme={theme} />

      {showMilliseconds && (
        <>
          <div className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-7 sm:pb-9">
            .
          </div>
          <KineticDigitBox value={pad(time.milliseconds)} label="SALİSE" theme={theme} />
        </>
      )}
    </div>
  );
};
