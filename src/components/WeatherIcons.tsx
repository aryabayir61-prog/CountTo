import React from 'react';
import { motion } from 'framer-motion';

interface WeatherIconProps {
  type: 'rain' | 'heavy_rain' | 'thunderstorm' | 'snow' | 'wind' | 'clear' | 'clouds' | 'fog';
  className?: string;
}

export const WeatherAnimatedIcon: React.FC<WeatherIconProps> = ({ type, className = 'w-12 h-12' }) => {
  switch (type) {
    case 'rain':
    case 'heavy_rain': {
      const isHeavy = type === 'heavy_rain';
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            {/* Cloud Outline */}
            <motion.path
              d="M46 38c3.9 0 7-3.1 7-7 0-3.6-2.7-6.5-6.2-6.9C45.8 19.3 41.5 16 36.3 16c-4.2 0-7.8 2.2-9.6 5.5-1.1-.9-2.5-1.5-4.1-1.5-3.6 0-6.6 2.9-6.6 6.5 0 .6.1 1.2.3 1.7C13.5 30 11 32.7 11 36c0 3.9 3.1 7 7 7h28"
              animate={{
                y: [0, -1.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Droplet 1 */}
            <motion.line
              x1="22"
              y1="47"
              x2="20"
              y2="55"
              animate={{
                y1: [43, 49, 56],
                y2: [49, 56, 62],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: isHeavy ? 0.65 : 0.85,
                repeat: Infinity,
                delay: 0,
                ease: 'easeInOut',
              }}
            />

            {/* Droplet 2 */}
            <motion.line
              x1="32"
              y1="47"
              x2="30"
              y2="55"
              animate={{
                y1: [43, 49, 56],
                y2: [49, 56, 62],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: isHeavy ? 0.65 : 0.85,
                repeat: Infinity,
                delay: 0.25,
                ease: 'easeInOut',
              }}
            />

            {/* Droplet 3 */}
            <motion.line
              x1="42"
              y1="47"
              x2="40"
              y2="55"
              animate={{
                y1: [43, 49, 56],
                y2: [49, 56, 62],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: isHeavy ? 0.65 : 0.85,
                repeat: Infinity,
                delay: 0.5,
                ease: 'easeInOut',
              }}
            />

            {isHeavy && (
              <motion.line
                x1="27"
                y1="48"
                x2="25"
                y2="56"
                animate={{
                  y1: [43, 50, 58],
                  y2: [49, 57, 63],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.65,
                  repeat: Infinity,
                  delay: 0.35,
                  ease: 'easeInOut',
                }}
              />
            )}
          </svg>
        </div>
      );
    }

    case 'thunderstorm': {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            {/* Cloud */}
            <path d="M46 36c3.9 0 7-3.1 7-7 0-3.6-2.7-6.5-6.2-6.9C45.8 17.3 41.5 14 36.3 14c-4.2 0-7.8 2.2-9.6 5.5-1.1-.9-2.5-1.5-4.1-1.5-3.6 0-6.6 2.9-6.6 6.5 0 .6.1 1.2.3 1.7C13.5 28 11 30.7 11 34c0 3.9 3.1 7 7 7h28" />

            {/* Lightning Bolt */}
            <motion.path
              d="M32 38l-4 9h6l-3 9 9-11h-6l4-7z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="1.5"
              animate={{
                opacity: [1, 0.2, 1, 0.4, 1],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </svg>
        </div>
      );
    }

    case 'snow': {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            <path d="M46 36c3.9 0 7-3.1 7-7 0-3.6-2.7-6.5-6.2-6.9C45.8 17.3 41.5 14 36.3 14c-4.2 0-7.8 2.2-9.6 5.5-1.1-.9-2.5-1.5-4.1-1.5-3.6 0-6.6 2.9-6.6 6.5 0 .6.1 1.2.3 1.7C13.5 28 11 30.7 11 34c0 3.9 3.1 7 7 7h28" />
            {/* Flake 1 */}
            <motion.g
              animate={{
                y: [0, 8, 16],
                opacity: [0, 1, 0],
                rotate: [0, 90],
              }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0 }}
            >
              <line x1="22" y1="44" x2="22" y2="50" />
              <line x1="19" y1="47" x2="25" y2="47" />
            </motion.g>
            {/* Flake 2 */}
            <motion.g
              animate={{
                y: [0, 8, 16],
                opacity: [0, 1, 0],
                rotate: [0, -90],
              }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.5 }}
            >
              <line x1="32" y1="44" x2="32" y2="50" />
              <line x1="29" y1="47" x2="35" y2="47" />
            </motion.g>
            {/* Flake 3 */}
            <motion.g
              animate={{
                y: [0, 8, 16],
                opacity: [0, 1, 0],
                rotate: [0, 90],
              }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.9 }}
            >
              <line x1="42" y1="44" x2="42" y2="50" />
              <line x1="39" y1="47" x2="45" y2="47" />
            </motion.g>
          </svg>
        </div>
      );
    }

    case 'clear': {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            {/* Core Sun */}
            <motion.circle
              cx="32"
              cy="32"
              r="12"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Sun Rays */}
            <motion.g
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ originX: '32px', originY: '32px' }}
            >
              <line x1="32" y1="10" x2="32" y2="15" />
              <line x1="32" y1="49" x2="32" y2="54" />
              <line x1="10" y1="32" x2="15" y2="32" />
              <line x1="49" y1="32" x2="54" y2="32" />
              <line x1="16.4" y1="16.4" x2="20" y2="20" />
              <line x1="44" y1="44" x2="47.6" y2="47.6" />
              <line x1="16.4" y1="47.6" x2="20" y2="44" />
              <line x1="44" y1="20" x2="47.6" y2="16.4" />
            </motion.g>
          </svg>
        </div>
      );
    }

    case 'wind': {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            <motion.path
              d="M12 26h28a6 6 0 1 0-6-6"
              animate={{ strokeDashoffset: [0, -30] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M8 34h36a6 6 0 1 1-6 6"
              animate={{ strokeDashoffset: [0, -30] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M16 42h20a5 5 0 1 0-5-5"
              animate={{ strokeDashoffset: [0, -25] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>
      );
    }

    case 'fog': {
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="w-full h-full text-neutral-900"
          >
            <motion.line
              x1="14"
              y1="24"
              x2="50"
              y2="24"
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="10"
              y1="32"
              x2="54"
              y2="32"
              animate={{ x: [2, -2, 2] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="18"
              y1="40"
              x2="46"
              y2="40"
              animate={{ x: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      );
    }

    default: {
      // Clouds
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-neutral-900"
          >
            <motion.path
              d="M46 38c3.9 0 7-3.1 7-7 0-3.6-2.7-6.5-6.2-6.9C45.8 19.3 41.5 16 36.3 16c-4.2 0-7.8 2.2-9.6 5.5-1.1-.9-2.5-1.5-4.1-1.5-3.6 0-6.6 2.9-6.6 6.5 0 .6.1 1.2.3 1.7C13.5 30 11 32.7 11 36c0 3.9 3.1 7 7 7h28"
              animate={{
                x: [-1.5, 1.5, -1.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </svg>
        </div>
      );
    }
  }
};
