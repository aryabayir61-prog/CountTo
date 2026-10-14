import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface FlipCardViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
  hideDays?: boolean;
  isVertical?: boolean;
}

interface SingleDigitCardProps {
  value: string;
  label: string;
  theme: ThemeConfig;
}

const SingleDigitCard: React.FC<SingleDigitCardProps> = ({ value, label, theme }) => {
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setPrevVal(prevRef.current);
      setCurrentVal(value);
      setIsFlipping(true);
      prevRef.current = value;

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center group">
      {/* 3D Flip Card Container */}
      <div 
        className="relative w-20 h-28 sm:w-28 sm:h-36 md:w-36 md:h-44 rounded-2xl perspective-1000 select-none shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
        style={{
          boxShadow: `0 20px 40px -15px ${theme.glow}`,
        }}
      >
        {/* Glow rim */}
        <div 
          className="absolute -inset-[1px] rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${theme.cardBorder}, rgba(255,255,255,0.04))`,
          }}
        />

        {/* Card Background Container */}
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl border border-white/10"
          style={{ backgroundColor: theme.cardBg }}
        >
          {/* Top Half (Stationary) */}
          <div className="relative w-full h-1/2 overflow-hidden bg-white/[0.03] border-b border-black/40 flex items-end justify-center">
            <span 
              className={`font-mono-numbers text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight translate-y-1/2 leading-none ${theme.numberColor}`}
            >
              {currentVal}
            </span>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Bottom Half (Stationary) */}
          <div className="relative w-full h-1/2 overflow-hidden bg-black/20 flex items-start justify-center">
            <span 
              className={`font-mono-numbers text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight -translate-y-1/2 leading-none ${theme.numberColor}`}
            >
              {currentVal}
            </span>
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Center Crease / Split-Flap Hairline & Screws */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-black/70 z-30 flex items-center justify-between px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600/80 shadow-xs" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600/80 shadow-xs" />
          </div>

          {/* Animated Flipping Flap */}
          {isFlipping && (
            <div 
              className="absolute inset-x-0 top-0 h-1/2 origin-bottom z-20 overflow-hidden bg-white/[0.04] border-b border-black/50 flex items-end justify-center"
              style={{
                animation: 'flipTopHalf 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                backgroundColor: theme.cardBg,
              }}
            >
              <span 
                className={`font-mono-numbers text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight translate-y-1/2 leading-none ${theme.numberColor}`}
              >
                {prevVal}
              </span>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Unit Label */}
      <div className="mt-3.5 text-center">
        <span className="text-xs sm:text-sm font-medium tracking-wider uppercase text-neutral-400">
          {label}
        </span>
      </div>

      <style>{`
        @keyframes flipTopHalf {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-180deg);
          }
        }
      `}</style>
    </div>
  );
};

export const FlipCardView: React.FC<FlipCardViewProps> = ({ 
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
            <SingleDigitCard value={unit.value} label={unit.label} theme={theme} />
          </motion.div>

          {!isVertical && idx < units.length - 1 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-4xl text-neutral-500 font-light select-none pb-8 sm:pb-10"
            >
              {unit.key === 'seconds' && showMilliseconds ? '.' : ':'}
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};
