import React from 'react';

export interface StickerDefinition {
  id: string;
  name: string;
  category: 'animated' | 'study' | 'aesthetic' | 'badge';
  isAnimated: boolean;
  render: (props?: { className?: string; isPreview?: boolean }) => React.ReactNode;
}

export const STICKER_CATEGORIES = [
  { id: 'animated', name: '✨ Animasyonlu', shortName: 'Animasyon' },
  { id: 'study', name: '🎯 Ders & Odak', shortName: 'Ders' },
  { id: 'aesthetic', name: '🌸 Estetik & Mood', shortName: 'Mood' },
  { id: 'badge', name: '🏷️ Rozetler', shortName: 'Rozet' },
] as const;

export const STICKERS: StickerDefinition[] = [
  // ==================== 1. ANIMATED STICKERS ====================
  {
    id: 'sparkle_star',
    name: 'Sihirli Yıldız',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-twinkle"
        >
          {/* White die-cut sticker stroke */}
          <path
            d="M24 2 L28 17 L43 21 L30 29 L34 44 L24 35 L14 44 L18 29 L5 21 L20 17 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Main golden gradient star */}
          <defs>
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="miniStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
          <path
            d="M24 3 L27.5 17.5 L42 21 L29.5 29 L33.5 43 L24 34.5 L14.5 43 L18.5 29 L6 21 L20.5 17.5 Z"
            fill="url(#starGrad)"
          />
          {/* Sparkle highlights */}
          <circle cx="20" cy="18" r="1.5" fill="#ffffff" opacity="0.9" />
          <polygon points="36,8 37.5,12 41.5,13.5 37.5,15 36,19 34.5,15 30.5,13.5 34.5,12" fill="url(#miniStarGrad)" />
          <polygon points="10,34 11,36.5 13.5,37.5 11,38.5 10,41 9,38.5 6.5,37.5 9,36.5" fill="url(#miniStarGrad)" />
        </svg>
      </div>
    ),
  },
  {
    id: 'beating_heart',
    name: 'Atan Kalp',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-heartbeat"
        >
          {/* Die-cut white border */}
          <path
            d="M24 41 C24 41 7 28.5 7 16 A9.5 9.5 0 0 1 24 10.5 A9.5 9.5 0 0 1 41 16 C41 28.5 24 41 24 41 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="45%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="heartSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M24 39.5 C24 39.5 8.5 27.5 8.5 16 A8.5 8.5 0 0 1 24 11.2 A8.5 8.5 0 0 1 39.5 16 C39.5 27.5 24 39.5 24 39.5 Z"
            fill="url(#heartGrad)"
          />
          {/* Glossy reflection bubble */}
          <ellipse cx="16" cy="17" rx="3.5" ry="5.5" transform="rotate(-30 16 17)" fill="url(#heartSheen)" />
          <circle cx="21" cy="23" r="1.2" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>
    ),
  },
  {
    id: 'steaming_coffee',
    name: 'Tüten Kahve',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        >
          {/* White die-cut outline */}
          <rect x="7" y="16" width="28" height="23" rx="7" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
          <path d="M34 20 H39 C42 20 44 22 44 25 C44 28 42 30 39 30 H34" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          
          {/* Animated Steam */}
          <g className="animate-sticker-steam">
            <path d="M15 12 C13 9 17 6 15 3" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M21 13 C19 10 23 7 21 4" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M27 12 C25 9 29 6 27 3" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <defs>
            <linearGradient id="mugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          {/* Mug handle */}
          <path d="M34 20 H39 C41 20 42.5 21.5 42.5 25 C42.5 28.5 41 30 39 30 H34" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          {/* Mug body */}
          <rect x="9" y="18" width="26" height="21" rx="6" fill="url(#mugGrad)" />
          {/* Foam / Coffee rim */}
          <ellipse cx="22" cy="18" rx="12" ry="2.5" fill="#78350f" />
          {/* Heart icon on mug */}
          <path d="M22 28 C22 28 18 24.5 18 22.8 A2.2 2.2 0 0 1 22 21.5 A2.2 2.2 0 0 1 26 22.8 C26 24.5 22 28 22 28 Z" fill="#ffffff" opacity="0.9" />
          {/* Saucer */}
          <rect x="5" y="40.5" width="34" height="3" rx="1.5" fill="#ffffff" />
          <rect x="6" y="40.5" width="32" height="2" rx="1" fill="#fed7aa" />
        </svg>
      </div>
    ),
  },
  {
    id: 'flame_fire',
    name: 'Ateş & Güç',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-flame"
        >
          {/* Die-cut white border */}
          <path
            d="M24 3 C27 12 37 17 37 28 C37 36 31 43 24 43 C17 43 11 36 11 28 C11 21 16 16 19 12 C20 16 22 17 24 15 C24 11 24 6 24 3 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="flameOuter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="60%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="flameInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path
            d="M24 4 C27 13 36 18 36 28 C36 35.5 30.5 42 24 42 C17.5 42 12 35.5 12 28 C12 21.5 17 16.5 19.5 12.5 C20.5 16 22.5 17 24 15 C24 11 24 6.5 24 4 Z"
            fill="url(#flameOuter)"
          />
          {/* Inner core flame */}
          <path
            d="M24 20 C27 25 31 28 31 32 C31 36.5 28 39.5 24 39.5 C20 39.5 17 36.5 17 32 C17 27 20 25 21.5 23 C22.5 24.5 23.5 25 24 24 Z"
            fill="url(#flameInner)"
          />
        </svg>
      </div>
    ),
  },
  {
    id: 'ghost_cute',
    name: 'Tatlı Hayalet',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-float"
        >
          {/* White die-cut sticker outline */}
          <path
            d="M24 5 C14 5 10 14 10 23 C10 34 8 41 12 41 C15 41 16 37 19 37 C22 37 23 41 26 41 C29 41 30 37 33 37 C36 37 37 41 40 41 C43 41 40 33 40 23 C40 14 34 5 24 5 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M24 6 C15 6 11 15 11 24 C11 34 9.5 40 12.5 40 C15 40 16 37 19 37 C22 37 23 40 26 40 C29 40 30 37 33 37 C36 37 37.5 40 39.5 40 C42 40 39 33 39 24 C39 15 33 6 24 6 Z"
            fill="#f8fafc"
          />
          {/* Cute face */}
          <ellipse cx="19" cy="20" rx="2" ry="3" fill="#1e293b" />
          <ellipse cx="29" cy="20" rx="2" ry="3" fill="#1e293b" />
          <circle cx="18.5" cy="19" r="0.8" fill="#ffffff" />
          <circle cx="28.5" cy="19" r="0.8" fill="#ffffff" />
          <path d="M22 25 Q24 28 26 25" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Blushing cheeks */}
          <ellipse cx="15" cy="24" rx="2.5" ry="1.5" fill="#f472b6" opacity="0.6" />
          <ellipse cx="33" cy="24" rx="2.5" ry="1.5" fill="#f472b6" opacity="0.6" />
        </svg>
      </div>
    ),
  },
  {
    id: 'music_vinyl',
    name: 'Lo-Fi Plak',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        >
          {/* Die-cut white backing circle */}
          <circle cx="24" cy="24" r="22" fill="#ffffff" />
          {/* Rotating Vinyl Record */}
          <g className="animate-sticker-spin-slow origin-[24px_24px]">
            <circle cx="24" cy="24" r="20" fill="#18181b" />
            {/* Vinyl grooves */}
            <circle cx="24" cy="24" r="16.5" fill="none" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="24" cy="24" r="13.5" fill="none" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="24" cy="24" r="10.5" fill="none" stroke="#27272a" strokeWidth="0.8" />
            {/* Center label */}
            <defs>
              <linearGradient id="vinylCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="7" fill="url(#vinylCenter)" />
            <circle cx="24" cy="24" r="2.2" fill="#18181b" />
            {/* Vinyl sheen reflection */}
            <path d="M12 16 L24 24 L16 12 Z" fill="#ffffff" opacity="0.15" />
            <path d="M36 32 L24 24 L32 36 Z" fill="#ffffff" opacity="0.15" />
          </g>
        </svg>
      </div>
    ),
  },
  {
    id: 'energy_bolt',
    name: 'Enerji Yıldırımı',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-shimmer"
        >
          {/* Die cut white border */}
          <polygon
            points="28,3 10,25 24,25 18,45 38,21 24,21"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <polygon points="28,4 11,25 24,25 19,43 37,22 24,22" fill="url(#boltGrad)" />
          {/* Inner highlight */}
          <polygon points="26,8 16,24 23,24 21,34 31,23 23,23" fill="#ffffff" opacity="0.65" />
        </svg>
      </div>
    ),
  },
  {
    id: 'happy_flower',
    name: 'Mutlu Papatya',
    category: 'animated',
    isAnimated: true,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-10 h-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-sticker-wiggle"
        >
          {/* White die cut border around flower petals */}
          <circle cx="24" cy="24" r="21" fill="#ffffff" />
          {/* Petals */}
          <circle cx="24" cy="9" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="24" cy="39" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="9" cy="24" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="39" cy="24" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="13" cy="13" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="35" cy="13" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="13" cy="35" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          <circle cx="35" cy="35" r="6" fill="#fdf2f8" stroke="#f472b6" strokeWidth="1.5" />
          {/* Center yellow smiley disc */}
          <circle cx="24" cy="24" r="9" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
          <ellipse cx="21" cy="22.5" rx="1" ry="1.5" fill="#713f12" />
          <ellipse cx="27" cy="22.5" rx="1" ry="1.5" fill="#713f12" />
          <path d="M21 26 Q24 29 27 26" fill="none" stroke="#713f12" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="19" cy="25" r="1" fill="#f43f5e" opacity="0.6" />
          <circle cx="29" cy="25" r="1" fill="#f43f5e" opacity="0.6" />
        </svg>
      </div>
    ),
  },

  // ==================== 2. STUDY & FOCUS STICKERS ====================
  {
    id: 'target_100',
    name: 'Tam Not (100)',
    category: 'study',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <circle cx="24" cy="24" r="21" fill="#ffffff" />
          <circle cx="24" cy="24" r="19" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
          <text
            x="24"
            y="28"
            textAnchor="middle"
            fill="#dc2626"
            fontSize="16"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.5px"
          >
            100
          </text>
          {/* Double underline like Japanese test stamp */}
          <path d="M12 34 H36 M15 37 H33" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    id: 'study_books',
    name: 'Ders Kitapları',
    category: 'study',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          {/* White die cut */}
          <rect x="7" y="11" width="34" height="31" rx="4" fill="#ffffff" />
          {/* Bottom book (Emerald) */}
          <rect x="9" y="32" width="30" height="9" rx="2.5" fill="#10b981" />
          <rect x="9" y="32" width="6" height="9" rx="1.5" fill="#059669" />
          <rect x="15" y="34.5" width="22" height="4" fill="#ffffff" rx="1" />
          {/* Middle book (Violet) */}
          <rect x="11" y="22" width="27" height="9" rx="2.5" fill="#8b5cf6" />
          <rect x="11" y="22" width="6" height="9" rx="1.5" fill="#7c3aed" />
          <rect x="17" y="24.5" width="19" height="4" fill="#ffffff" rx="1" />
          {/* Top book (Coral) */}
          <rect x="13" y="12" width="23" height="9" rx="2.5" fill="#f43f5e" />
          <rect x="13" y="12" width="5.5" height="9" rx="1.5" fill="#e11d48" />
          <rect x="18.5" y="14.5" width="16" height="4" fill="#ffffff" rx="1" />
          {/* Golden ribbon */}
          <path d="M22 12 V24 L24.5 21 L27 24 V12" fill="#facc15" stroke="#eab308" strokeWidth="0.5" />
        </svg>
      </div>
    ),
  },
  {
    id: 'pomodoro_timer',
    name: 'Pomodoro',
    category: 'study',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <circle cx="24" cy="27" r="18" fill="#ffffff" />
          <ellipse cx="24" cy="28" rx="16" ry="14" fill="#ef4444" />
          {/* Gloss */}
          <ellipse cx="18" cy="22" rx="4" ry="2" transform="rotate(-25 18 22)" fill="#ffffff" opacity="0.6" />
          {/* Timer dial ring */}
          <path d="M12 28 H36" stroke="#991b1b" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="24" y="38" textAnchor="middle" fill="#fee2e2" fontSize="9" fontWeight="bold">
            25m
          </text>
          {/* Tomato stem leaves */}
          <path d="M24 14 C24 8 28 6 28 6" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="21" cy="15" rx="5" ry="2" transform="rotate(-20 21 15)" fill="#22c55e" />
          <ellipse cx="27" cy="15" rx="5" ry="2" transform="rotate(20 27 15)" fill="#22c55e" />
        </svg>
      </div>
    ),
  },
  {
    id: 'neon_highlighter',
    name: 'Fosforlu Kalem',
    category: 'study',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          {/* Highlighter body */}
          <g transform="rotate(-35 24 24)">
            <rect x="18" y="8" width="12" height="24" rx="2" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
            <rect x="18" y="8" width="12" height="22" rx="2" fill="#22c55e" />
            <rect x="18" y="8" width="12" height="6" fill="#15803d" />
            <polygon points="20,30 28,30 26,38 22,38" fill="#4ade80" />
            {/* Chisel tip */}
            <polygon points="22,38 26,38 28,44 24,44" fill="#a3e635" />
          </g>
          {/* Neon highlight swatch */}
          <path d="M8 40 Q24 43 40 38" stroke="#a3e635" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        </svg>
      </div>
    ),
  },
  {
    id: 'brain_idea',
    name: 'Fikir Işığı',
    category: 'study',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <circle cx="24" cy="24" r="21" fill="#ffffff" />
          {/* Lightbulb glowing */}
          <defs>
            <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          <path
            d="M24 8 C18 8 14 13 14 18 C14 22 17 25 19 28 L19 32 H29 L29 28 C31 25 34 22 34 18 C34 13 30 8 24 8 Z"
            fill="url(#bulbGrad)"
          />
          {/* Base */}
          <rect x="20" y="32" width="8" height="2" fill="#71717a" />
          <rect x="21" y="35" width="6" height="2" fill="#71717a" />
          <path d="M22 38 H26" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Filament rays */}
          <line x1="24" y1="2" x2="24" y2="5" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="7" x2="14" y2="10" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="7" x2="34" y2="10" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },

  // ==================== 3. AESTHETIC & MOOD STICKERS ====================
  {
    id: 'peeking_cat',
    name: 'Tatlı Kedi',
    category: 'aesthetic',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          {/* Die cut */}
          <path
            d="M10 40 V24 L14 14 L20 20 H28 L34 14 L38 24 V40 H10 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Black cat head */}
          <path d="M12 40 V25 L15 16 L20 21 H28 L33 16 L36 25 V40 Z" fill="#18181b" />
          {/* Inner ears */}
          <polygon points="16,18 19,21 16,23" fill="#f472b6" />
          <polygon points="32,18 29,21 32,23" fill="#f472b6" />
          {/* Big anime green eyes */}
          <ellipse cx="20" cy="27" rx="3" ry="3.5" fill="#4ade80" />
          <ellipse cx="28" cy="27" rx="3" ry="3.5" fill="#4ade80" />
          <circle cx="20" cy="27" r="1.5" fill="#18181b" />
          <circle cx="28" cy="27" r="1.5" fill="#18181b" />
          <circle cx="19" cy="25.5" r="0.8" fill="#ffffff" />
          <circle cx="27" cy="25.5" r="0.8" fill="#ffffff" />
          {/* Nose & whiskers */}
          <polygon points="23,31 25,31 24,32.5" fill="#f472b6" />
          <path d="M16 32 H11 M16 34 H12 M32 32 H37 M32 34 H36" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          {/* Paws resting on bottom */}
          <ellipse cx="16" cy="40" rx="3.5" ry="2" fill="#ffffff" stroke="#18181b" strokeWidth="1" />
          <ellipse cx="32" cy="40" rx="3.5" ry="2" fill="#ffffff" stroke="#18181b" strokeWidth="1" />
        </svg>
      </div>
    ),
  },
  {
    id: 'washi_tape_strip',
    name: 'Washi Bant',
    category: 'aesthetic',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 54 28" className="w-12 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          <polygon
            points="2,2 52,2 50,26 4,26"
            fill="#f472b6"
            opacity="0.85"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Grid pattern on tape */}
          <line x1="12" y1="2" x2="12" y2="26" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
          <line x1="22" y1="2" x2="22" y2="26" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
          <line x1="32" y1="2" x2="32" y2="26" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
          <line x1="42" y1="2" x2="42" y2="26" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
          <line x1="2" y1="14" x2="52" y2="14" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
        </svg>
      </div>
    ),
  },
  {
    id: 'four_leaf_clover',
    name: 'Uğur Yoncası',
    category: 'aesthetic',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <circle cx="24" cy="24" r="21" fill="#ffffff" />
          <defs>
            <linearGradient id="cloverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          {/* 4 heart shaped leaves */}
          <path d="M24 24 C24 16 16 12 16 18 C16 24 24 24 24 24 Z" fill="url(#cloverGrad)" />
          <path d="M24 24 C24 16 32 12 32 18 C32 24 24 24 24 24 Z" fill="url(#cloverGrad)" />
          <path d="M24 24 C16 24 12 32 18 32 C24 32 24 24 24 24 Z" fill="url(#cloverGrad)" />
          <path d="M24 24 C32 24 36 32 30 32 C24 32 24 24 24 24 Z" fill="url(#cloverGrad)" />
          {/* Stem */}
          <path d="M24 24 Q23 38 29 42" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dew sparkle */}
          <circle cx="20" cy="18" r="1.2" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    ),
  },
  {
    id: 'crystal_diamond',
    name: 'Elmas Kristal',
    category: 'aesthetic',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`relative inline-flex items-center justify-center p-1 ${className}`}>
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
          <polygon
            points="14,14 34,14 42,23 24,42 6,23"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <polygon points="14,14 34,14 42,23 24,42 6,23" fill="#06b6d4" />
          {/* Facets */}
          <polygon points="14,14 24,23 34,14" fill="#67e8f9" />
          <polygon points="6,23 14,14 24,23" fill="#22d3ee" />
          <polygon points="34,14 42,23 24,23" fill="#0891b2" />
          <polygon points="6,23 24,23 24,42" fill="#0e7490" />
          <polygon points="24,23 42,23 24,42" fill="#155e75" />
          {/* Sparkle highlight */}
          <circle cx="16" cy="17" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    ),
  },

  // ==================== 4. BADGES & QUICK TAGS ====================
  {
    id: 'badge_urgent',
    name: 'Önemli!',
    category: 'badge',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[11px] tracking-wider uppercase border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>ÖNEMLİ!</span>
        </div>
      </div>
    ),
  },
  {
    id: 'badge_exam',
    name: 'Sınav Günü',
    category: 'badge',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-black text-[11px] tracking-wide uppercase border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] select-none">
          <span>📝</span>
          <span>SINAV</span>
        </div>
      </div>
    ),
  },
  {
    id: 'badge_today',
    name: 'Bugün',
    category: 'badge',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] tracking-wide border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] select-none">
          <span>🎯</span>
          <span>BUGÜN</span>
        </div>
      </div>
    ),
  },
  {
    id: 'badge_done',
    name: 'Yapıldı',
    category: 'badge',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-[11px] tracking-wide border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] select-none">
          <span className="font-extrabold text-[12px]">✓</span>
          <span>YAPILDI</span>
        </div>
      </div>
    ),
  },
  {
    id: 'badge_break',
    name: 'Mola',
    category: 'badge',
    isAnimated: false,
    render: ({ className = '' } = {}) => (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-[11px] tracking-wide border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] select-none">
          <span>☕</span>
          <span>MOLA</span>
        </div>
      </div>
    ),
  },
];
