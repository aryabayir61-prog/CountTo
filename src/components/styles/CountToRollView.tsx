import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface CountToRollViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
  hideDays?: boolean;
  isVertical?: boolean;
}

interface SingleDigitSlotProps {
  digit: string;
  theme: ThemeConfig;
}

/**
 * Individual digit column slot.
 * When digit changes (e.g. 9 -> 8), the 9 smoothly slides downwards,
 * and the 8 enters downwards from the top, with zero dividing lines.
 */
const SingleDigitSlot: React.FC<SingleDigitSlotProps> = ({ digit, theme }) => {
  return (
    <div 
      className="relative w-6 sm:w-9 md:w-12 h-16 sm:h-22 md:h-28 overflow-hidden flex items-center justify-center select-none"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '-90%', opacity: 0.1, filter: 'blur(2px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '90%', opacity: 0.1, filter: 'blur(2px)' }}
          transition={{
            duration: 0.38,
            ease: [0.22, 1, 0.36, 1], // Smooth organic deceleration
          }}
          className={`absolute inset-0 flex items-center justify-center font-mono-numbers text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none ${theme.numberColor}`}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

interface UnifiedUnitProps {
  value: string;
  label: string;
  theme: ThemeConfig;
}

const UnifiedUnit: React.FC<UnifiedUnitProps> = ({ value, label, theme }) => {
  const digits = value.split('');

  return (
    <div className="flex flex-col items-center">
      {/* Seamless Digits Block (no lines, no dividers, tightly unified) */}
      <div 
        className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-xl transition-all duration-300"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: `0 15px 35px -12px ${theme.glow}`,
        }}
      >
        {/* Digits placed seamlessly together with zero lines */}
        <div className="flex items-center">
          {digits.map((d, index) => (
            <SingleDigitSlot key={index} digit={d} theme={theme} />
          ))}
        </div>
      </div>

      {/* Clean Unit Label */}
      <div className="mt-2.5 text-center">
        <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-neutral-400">
          {label}
        </span>
      </div>
    </div>
  );
};

export const CountToRollView: React.FC<CountToRollViewProps> = ({
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
      className={`p-3 sm:p-5 md:p-6 rounded-3xl border border-white/5 backdrop-blur-2xl flex select-none shadow-2xl transition-all duration-500 ${
        isVertical
          ? 'flex-col items-center gap-3 sm:gap-4.5'
          : 'flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-4 flex-wrap'
      }`}
      style={{
        backgroundColor: 'rgba(10, 12, 18, 0.45)',
        boxShadow: `0 20px 50px -15px ${theme.glow}`,
      }}
    >
      {/* Gün (Days) - Hidden when hideDays is true */}
      {!hideDays && (
        <>
          <UnifiedUnit value={padDays(time.days)} label="GÜN" theme={theme} />
          {!isVertical && (
            <span className="text-xl sm:text-3xl md:text-4xl text-neutral-500 font-light pb-6 select-none opacity-80">
              :
            </span>
          )}
        </>
      )}

      {/* Saat (Hours) */}
      <UnifiedUnit value={pad(time.hours)} label="SAAT" theme={theme} />

      {/* Subtle Colon in horizontal mode */}
      {!isVertical && (
        <span className="text-xl sm:text-3xl md:text-4xl text-neutral-500 font-light pb-6 select-none opacity-80">
          :
        </span>
      )}

      {/* Dakika (Minutes) */}
      <UnifiedUnit value={pad(time.minutes)} label="DAKİKA" theme={theme} />

      {/* Subtle Colon in horizontal mode */}
      {!isVertical && (
        <span className="text-xl sm:text-3xl md:text-4xl text-neutral-500 font-light pb-6 select-none opacity-80">
          :
        </span>
      )}

      {/* Saniye (Seconds) */}
      <UnifiedUnit value={pad(time.seconds)} label="SANİYE" theme={theme} />

      {/* Salise (Milliseconds) */}
      {showMilliseconds && (
        <>
          {!isVertical && (
            <span className="text-xl sm:text-3xl md:text-4xl text-neutral-500 font-light pb-6 select-none opacity-80">
              .
            </span>
          )}
          <UnifiedUnit value={pad(time.milliseconds)} label="SALİSE" theme={theme} />
        </>
      )}
    </motion.div>
  );
};
