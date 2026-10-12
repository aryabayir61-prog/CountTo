import React from 'react';
import { ThemeConfig, TimeRemaining } from '../../types/countdown';

interface OrbitalRingsViewProps {
  time: TimeRemaining;
  theme: ThemeConfig;
  showMilliseconds?: boolean;
  hideDays?: boolean;
}

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  displayValue: string;
  theme: ThemeConfig;
  subLabel?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  label,
  displayValue,
  theme,
}) => {
  const radius = 62;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="flex flex-col items-center group">
      <div 
        className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
        style={{
          boxShadow: `0 10px 30px -10px ${theme.glow}`,
        }}
      >
        {/* Glow backdrop circle */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
          style={{ backgroundColor: theme.primary }}
        />

        {/* SVG Ring */}
        <svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="-rotate-90 transform"
        >
          {/* Subtle Background Track */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            className="text-white/[0.08]"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Animated Active Arc */}
          <circle
            stroke={theme.ringColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.35s ease-in-out',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
          <span className={`font-mono-numbers text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${theme.numberColor}`}>
            {displayValue}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-0.5 text-neutral-400">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export const OrbitalRingsView: React.FC<OrbitalRingsViewProps> = ({
  time,
  theme,
  showMilliseconds,
  hideDays = false,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const padDays = (n: number) => (n > 99 ? String(n) : String(n).padStart(2, '0'));

  // Day ring uses 30 or 365 as scale
  const daysMax = time.days > 30 ? 365 : 30;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 flex-wrap">
      {!hideDays && (
        <CircularProgress
          value={time.days}
          max={daysMax}
          label="GÜN"
          displayValue={padDays(time.days)}
          theme={theme}
        />
      )}

      <CircularProgress
        value={time.hours}
        max={24}
        label="SAAT"
        displayValue={pad(time.hours)}
        theme={theme}
      />

      <CircularProgress
        value={time.minutes}
        max={60}
        label="DAKİKA"
        displayValue={pad(time.minutes)}
        theme={theme}
      />

      <CircularProgress
        value={time.seconds}
        max={60}
        label="SANİYE"
        displayValue={pad(time.seconds)}
        theme={theme}
      />

      {showMilliseconds && (
        <CircularProgress
          value={time.milliseconds}
          max={100}
          label="SALİSE"
          displayValue={pad(time.milliseconds)}
          theme={theme}
        />
      )}
    </div>
  );
};
