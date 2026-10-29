import React from 'react';
import { CollectionArticle } from '../data/collectionsBlog';

interface CollectionCoverArtProps {
  article: CollectionArticle;
  className?: string;
  isHero?: boolean;
}

export const CollectionCoverArt: React.FC<CollectionCoverArtProps> = ({
  article,
  className = '',
  isHero = false,
}) => {
  const { coverStyle } = article;
  const heightClass = isHero ? 'h-64 sm:h-80 md:h-96' : 'h-48 sm:h-52';

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl select-none ${className}`}
      style={{ background: coverStyle.bgGradient }}
    >
      {/* Dynamic ambient blur light */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-60 pointer-events-none transition-transform duration-700 group-hover:scale-125"
        style={{ backgroundColor: coverStyle.accentHex }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ backgroundColor: coverStyle.secondaryHex }}
      />

      {/* Atmospheric hand-crafted SVG scene based on illustrationType */}
      {coverStyle.illustrationType === 'tokyo' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="tokyoSkyline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0816" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="neonGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="tokyoBlur">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Distant neon skyline buildings */}
          <rect x="40" y="110" width="45" height="210" fill="#0f0c22" opacity="0.9" />
          <rect x="95" y="70" width="60" height="250" fill="#140f2e" opacity="0.95" />
          <rect x="165" y="130" width="50" height="190" fill="#0f0c22" opacity="0.9" />
          <rect x="225" y="90" width="75" height="230" fill="#181238" />
          <rect x="310" y="50" width="65" height="270" fill="#140f2e" opacity="0.95" />
          <rect x="385" y="120" width="55" height="200" fill="#0f0c22" opacity="0.9" />
          <rect x="450" y="80" width="70" height="240" fill="#181238" />
          <rect x="530" y="140" width="50" height="180" fill="#0f0c22" opacity="0.9" />

          {/* Glowing neon signage bars on buildings */}
          <rect x="110" y="90" width="6" height="55" rx="3" fill="#f43f5e" filter="url(#tokyoBlur)" opacity="0.85" />
          <rect x="110" y="90" width="6" height="55" rx="3" fill="#ffffff" />
          <rect x="245" y="110" width="35" height="8" rx="4" fill="#06b6d4" filter="url(#tokyoBlur)" opacity="0.85" />
          <rect x="245" y="110" width="35" height="8" rx="4" fill="#e0f2fe" />
          <rect x="330" y="75" width="25" height="60" rx="3" fill="#ec4899" opacity="0.3" />
          <circle cx="342" cy="100" r="12" fill="none" stroke="#f43f5e" strokeWidth="3" filter="url(#tokyoBlur)" />
          <circle cx="342" cy="100" r="12" fill="none" stroke="#ffffff" strokeWidth="2" />
          <rect x="475" y="110" width="22" height="6" rx="3" fill="#06b6d4" filter="url(#tokyoBlur)" />
          <rect x="475" y="110" width="22" height="6" rx="3" fill="#ffffff" />

          {/* Perspective grid street floor with wet light streaks */}
          <line x1="0" y1="260" x2="600" y2="260" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="0" y1="285" x2="600" y2="285" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.6" />
          <line x1="300" y1="250" x2="50" y2="320" stroke="url(#neonGlow)" strokeWidth="2.5" strokeOpacity="0.7" />
          <line x1="300" y1="250" x2="200" y2="320" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="300" y1="250" x2="400" y2="320" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="300" y1="250" x2="550" y2="320" stroke="url(#neonGlow)" strokeWidth="2.5" strokeOpacity="0.7" />

          {/* Ambient luminous moon glow in the sky */}
          <circle cx="480" cy="55" r="28" fill="#f43f5e" opacity="0.25" filter="url(#tokyoBlur)" />
          <circle cx="480" cy="55" r="18" fill="#ffffff" opacity="0.85" />
        </svg>
      )}

      {coverStyle.illustrationType === 'matcha' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="matchaBlur">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Minimalist Zen Ensō Circle */}
          <circle cx="300" cy="150" r="85" fill="none" stroke="#4ade80" strokeWidth="18" strokeDasharray="420 80" strokeLinecap="round" opacity="0.35" filter="url(#matchaBlur)" />
          <circle cx="300" cy="150" r="85" fill="none" stroke="#4ade80" strokeWidth="12" strokeDasharray="420 80" strokeLinecap="round" opacity="0.7" />

          {/* Japanese Ceramic Matcha Bowl Silhouette */}
          <path d="M 230 190 Q 235 250 300 250 Q 365 250 370 190 Z" fill="#0f2617" stroke="#4ade80" strokeWidth="2" strokeOpacity="0.5" />
          <ellipse cx="300" cy="190" rx="70" ry="14" fill="#15803d" opacity="0.8" />
          <ellipse cx="300" cy="190" rx="55" ry="10" fill="#4ade80" opacity="0.6" filter="url(#matchaBlur)" />

          {/* Gentle Rising Steam Waves */}
          <path d="M 285 175 Q 275 140 290 110 T 285 75" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M 315 175 Q 325 140 310 110 T 315 75" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

          {/* Bamboo leaves silhouettes on edge */}
          <path d="M 40 40 Q 90 70 140 60 Q 90 90 40 40 Z" fill="#4ade80" opacity="0.4" />
          <path d="M 50 80 Q 110 110 160 100 Q 100 130 50 80 Z" fill="#15803d" opacity="0.5" />
          <path d="M 540 260 Q 480 230 430 240 Q 480 210 540 260 Z" fill="#4ade80" opacity="0.35" />
        </svg>
      )}

      {coverStyle.illustrationType === 'oasis' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="oasisWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="oasisGlow">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          {/* Radiant Desert Sun on the Horizon */}
          <circle cx="380" cy="95" r="45" fill="#f59e0b" opacity="0.4" filter="url(#oasisGlow)" />
          <circle cx="380" cy="95" r="28" fill="#fbbf24" opacity="0.9" />

          {/* Rolling Golden Dune Contours */}
          <path d="M 0 160 Q 140 100 320 180 T 600 140 L 600 320 L 0 320 Z" fill="#1f180e" opacity="0.9" />
          <path d="M 0 200 Q 180 140 380 220 T 600 190 L 600 320 L 0 320 Z" fill="#2d2210" />

          {/* Crystal Oasis Lagoon Basin */}
          <path d="M 120 250 Q 280 210 440 250 Q 300 295 120 250 Z" fill="url(#oasisWater)" opacity="0.85" />
          <ellipse cx="280" cy="252" rx="120" ry="16" fill="#38bdf8" opacity="0.6" filter="url(#oasisGlow)" />

          {/* Subtle desert ripples */}
          <path d="M 60 170 Q 120 165 180 172" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
          <path d="M 220 185 Q 290 180 360 188" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
        </svg>
      )}

      {coverStyle.illustrationType === 'minimal' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="minimalGlow">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Architectural Swiss Minimal Dial */}
          <circle cx="300" cy="150" r="95" fill="#12100d" stroke="#eab308" strokeWidth="1.5" strokeOpacity="0.5" />
          <circle cx="300" cy="150" r="105" fill="none" stroke="#eab308" strokeWidth="0.75" strokeOpacity="0.25" />

          {/* Clock dial hour markers */}
          <line x1="300" y1="62" x2="300" y2="76" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="300" y1="224" x2="300" y2="238" stroke="#eab308" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="212" y1="150" x2="226" y2="150" stroke="#eab308" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="374" y1="150" x2="388" y2="150" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />

          {/* Clean minimal clock hands */}
          <line x1="300" y1="150" x2="300" y2="92" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="300" y1="150" x2="350" y2="150" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
          <circle cx="300" cy="150" r="5" fill="#eab308" filter="url(#minimalGlow)" />
          <circle cx="300" cy="150" r="3" fill="#ffffff" />

          {/* Monolithic architectural angle lines */}
          <line x1="0" y1="280" x2="600" y2="280" stroke="#eab308" strokeWidth="1" strokeOpacity="0.2" />
          <line x1="480" y1="0" x2="480" y2="320" stroke="#eab308" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
      )}

      {coverStyle.illustrationType === 'rain' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="rainBlur">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* Soft warm interior bokeh lights seen through rainy window */}
          <circle cx="120" cy="110" r="42" fill="#5eead4" opacity="0.25" filter="url(#rainBlur)" />
          <circle cx="380" cy="90" r="55" fill="#f59e0b" opacity="0.2" filter="url(#rainBlur)" />
          <circle cx="480" cy="190" r="36" fill="#38bdf8" opacity="0.2" filter="url(#rainBlur)" />

          {/* Angled raindrops streaking down the glass pane */}
          <line x1="90" y1="30" x2="60" y2="105" stroke="#a7f3d0" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <line x1="180" y1="60" x2="150" y2="150" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
          <line x1="260" y1="20" x2="235" y2="90" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="340" y1="80" x2="310" y2="175" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.7" strokeLinecap="round" />
          <line x1="430" y1="40" x2="405" y2="115" stroke="#a7f3d0" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <line x1="510" y1="70" x2="480" y2="160" stroke="#5eead4" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
          <line x1="130" y1="180" x2="105" y2="255" stroke="#ffffff" strokeWidth="1.7" strokeOpacity="0.65" strokeLinecap="round" />
          <line x1="280" y1="190" x2="255" y2="270" stroke="#a7f3d0" strokeWidth="2.2" strokeOpacity="0.8" strokeLinecap="round" />
          <line x1="420" y1="180" x2="395" y2="260" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />

          {/* Eucalyptus leaf spray silhouette */}
          <path d="M 520 320 Q 460 260 490 190 Q 530 250 520 320 Z" fill="#0f766e" opacity="0.65" />
          <path d="M 490 230 Q 420 210 440 160 Q 480 190 490 230 Z" fill="#5eead4" opacity="0.45" />
          <path d="M 515 270 Q 450 280 435 240 Q 480 250 515 270 Z" fill="#0f766e" opacity="0.5" />
        </svg>
      )}

      {coverStyle.illustrationType === 'aurora' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="auroraRibbon1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="auroraRibbon2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <filter id="auroraGlow">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* Starry night points */}
          <circle cx="80" cy="50" r="1.5" fill="#ffffff" opacity="0.8" />
          <circle cx="160" cy="30" r="1" fill="#ffffff" opacity="0.6" />
          <circle cx="270" cy="45" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="390" cy="25" r="1.5" fill="#ffffff" opacity="0.75" />
          <circle cx="490" cy="60" r="1.5" fill="#ffffff" opacity="0.7" />

          {/* Undulating northern lights ribbon waves */}
          <path d="M -50 80 Q 150 160 300 70 T 650 110 L 650 200 Q 450 140 300 210 T -50 160 Z" fill="url(#auroraRibbon1)" opacity="0.65" filter="url(#auroraGlow)" />
          <path d="M -50 80 Q 150 160 300 70 T 650 110" fill="none" stroke="#67e8f9" strokeWidth="4" opacity="0.85" />
          <path d="M -50 120 Q 200 40 380 140 T 650 90" fill="none" stroke="#6ee7b7" strokeWidth="3" opacity="0.7" />

          {/* Snowy mountain silhouettes at the bottom */}
          <polygon points="0,320 80,240 180,320" fill="#060c18" />
          <polygon points="120,320 240,195 360,320" fill="#0a1224" />
          <polygon points="300,320 420,220 540,320" fill="#080f1e" />
          <polygon points="460,320 550,250 600,320" fill="#060c18" />
          {/* Mountain snow peak highlights */}
          <polygon points="240,195 220,225 260,225" fill="#a5f3fc" opacity="0.4" />
          <polygon points="420,220 405,245 435,245" fill="#6ee7b7" opacity="0.35" />
        </svg>
      )}

      {/* Category kicker & Read time metadata on top of cover */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
        <span
          className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10"
          style={{ color: coverStyle.accentHex }}
        >
          {article.category}
        </span>
        <span className="text-[11px] font-medium text-white/80 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
          {article.readingTime}
        </span>
      </div>

      {/* Bottom title scrim for clarity */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent pointer-events-none" />

      {/* Floating date and theme indicator */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/80 z-10">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{
              backgroundColor: coverStyle.accentHex,
              boxShadow: `0 0 8px ${coverStyle.accentHex}`,
            }}
          />
          <span className="font-semibold text-white truncate">{article.title}</span>
        </div>
        <span className="text-white/50 text-[11px] shrink-0">{article.date}</span>
      </div>
    </div>
  );
};
