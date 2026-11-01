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

      {/* Atmospheric hand-crafted SVG scenes based on illustrationType */}

      {/* 1. DEEP FOCUS: Glowing laser focus rings, neural target grid & digital hourglass */}
      {coverStyle.illustrationType === 'deepfocus' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="focusLaser" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
            </linearGradient>
            <filter id="focusGlow">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="focusBlurSmall">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Perspective Matrix Floor */}
          <line x1="0" y1="280" x2="600" y2="280" stroke="#f97316" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="300" y1="230" x2="60" y2="320" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="300" y1="230" x2="180" y2="320" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.3" />
          <line x1="300" y1="230" x2="420" y2="320" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.3" />
          <line x1="300" y1="230" x2="540" y2="320" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Concentric Neural Focus Rings */}
          <circle cx="300" cy="140" r="110" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 14" opacity="0.35" />
          <circle cx="300" cy="140" r="85" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="80 30" opacity="0.5" />
          <circle cx="300" cy="140" r="60" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
          <circle cx="300" cy="140" r="60" fill="none" stroke="#f97316" strokeWidth="3" opacity="0.4" filter="url(#focusGlow)" />

          {/* Glowing Digital Hourglass in Center */}
          <path
            d="M 270 85 L 330 85 L 305 135 L 330 185 L 270 185 L 295 135 Z"
            fill="none"
            stroke="#fb923c"
            strokeWidth="3.5"
            strokeLinejoin="round"
            filter="url(#focusBlurSmall)"
          />
          <path
            d="M 270 85 L 330 85 L 305 135 L 330 185 L 270 185 L 295 135 Z"
            fill="#1e1008"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Upper Chamber Falling Ember Sand */}
          <polygon points="278,95 322,95 300,132" fill="#f97316" opacity="0.75" />
          {/* Lower Chamber Accumulated Sand */}
          <polygon points="280,180 320,180 300,155" fill="#ef4444" opacity="0.85" />
          {/* Dripping Spark Line */}
          <line x1="300" y1="130" x2="300" y2="160" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Crosshair Target Marks */}
          <line x1="170" y1="140" x2="210" y2="140" stroke="#f97316" strokeWidth="2" opacity="0.7" />
          <line x1="390" y1="140" x2="430" y2="140" stroke="#f97316" strokeWidth="2" opacity="0.7" />
          <line x1="300" y1="30" x2="300" y2="60" stroke="#f97316" strokeWidth="2" opacity="0.7" />
          <line x1="300" y1="210" x2="300" y2="240" stroke="#f97316" strokeWidth="2" opacity="0.7" />

          {/* Subtle Cyber Data Floating Points */}
          <circle cx="150" cy="80" r="2.5" fill="#f97316" opacity="0.7" />
          <circle cx="450" cy="80" r="2.5" fill="#ef4444" opacity="0.7" />
          <circle cx="480" cy="190" r="2" fill="#fb923c" opacity="0.6" />
          <circle cx="120" cy="200" r="2" fill="#fb923c" opacity="0.6" />
        </svg>
      )}

      {/* 2. NORDIC: Architectural minimalism, snowy pine peaks, frosted glass monolith */}
      {coverStyle.illustrationType === 'nordic' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="nordicSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0b1329" stopOpacity="0.95" />
            </linearGradient>
            <filter id="nordicGlow">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          {/* Distant Mountain Ridge */}
          <polygon points="-20,320 120,160 260,320" fill="#0f1b36" opacity="0.8" />
          <polygon points="120,160 90,195 150,195" fill="#e0f2fe" opacity="0.25" />
          <polygon points="340,320 480,140 620,320" fill="#0f1b36" opacity="0.8" />
          <polygon points="480,140 450,180 510,180" fill="#e0f2fe" opacity="0.3" />

          {/* Architectural Frosted Minimal Monolith */}
          <rect x="235" y="70" width="130" height="190" rx="16" fill="#111c38" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
          <rect x="235" y="70" width="130" height="190" rx="16" fill="none" stroke="#38bdf8" strokeWidth="3" strokeOpacity="0.3" filter="url(#nordicGlow)" />

          {/* Minimal Dial inside Monolith */}
          <circle cx="300" cy="150" r="50" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="300" cy="150" r="4" fill="#38bdf8" />
          <line x1="300" y1="150" x2="300" y2="115" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="300" y1="150" x2="325" y2="160" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

          {/* Geometric Pine Tree Silhouettes */}
          <polygon points="170,320 185,260 200,320" fill="#132448" />
          <polygon points="175,280 185,240 195,280" fill="#1e3a6e" />
          <polygon points="400,320 415,250 430,320" fill="#132448" />
          <polygon points="405,270 415,230 425,270" fill="#1e3a6e" />
          <polygon points="435,320 445,275 455,320" fill="#132448" />

          {/* Luminous Arctic Aurora Arc */}
          <path d="M 0 90 Q 300 40 600 80" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.45" filter="url(#nordicGlow)" />
          <path d="M 0 90 Q 300 40 600 80" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
        </svg>
      )}

      {/* 3. COSMOS: Deep violet stardust nebula, crescent moon, floating geometric prism */}
      {coverStyle.illustrationType === 'cosmos' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="cosmosGlow">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <linearGradient id="moonGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          {/* Stardust Field */}
          <circle cx="70" cy="40" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="130" cy="90" r="1.2" fill="#c084fc" opacity="0.75" />
          <circle cx="210" cy="50" r="2" fill="#ffffff" opacity="0.8" />
          <circle cx="390" cy="45" r="1.8" fill="#e9d5ff" opacity="0.85" />
          <circle cx="470" cy="80" r="1.5" fill="#ffffff" opacity="0.7" />
          <circle cx="530" cy="40" r="2" fill="#c084fc" opacity="0.9" />
          <circle cx="100" cy="220" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="500" cy="230" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Glowing Violet Crescent Moon */}
          <circle cx="300" cy="140" r="55" fill="#a855f7" opacity="0.35" filter="url(#cosmosGlow)" />
          <path
            d="M 300 90 A 50 50 0 1 0 345 165 A 42 42 0 1 1 300 90 Z"
            fill="url(#moonGlow)"
            stroke="#e9d5ff"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Floating Sacred Geometry Diamond Prism */}
          <polygon
            points="300,50 370,140 300,230 230,140"
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="140 10"
            opacity="0.6"
          />
          <polygon
            points="300,65 355,140 300,215 245,140"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1"
            opacity="0.35"
          />

          {/* Concentric Horizon Arcs */}
          <ellipse cx="300" cy="280" rx="260" ry="60" fill="none" stroke="#7e22ce" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="300" cy="280" rx="360" ry="80" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.25" />
        </svg>
      )}

      {/* 4. ZEN STONE: Japanese balanced stones cairn, misty bamboo, water ripples */}
      {coverStyle.illustrationType === 'zenstone' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="zenGlow">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <linearGradient id="zenStone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#224830" />
              <stop offset="100%" stopColor="#0d1f14" />
            </linearGradient>
          </defs>

          {/* Concentric Water Meditation Ripples */}
          <ellipse cx="300" cy="245" rx="190" ry="32" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.2" />
          <ellipse cx="300" cy="245" rx="140" ry="24" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.3" />
          <ellipse cx="300" cy="245" rx="90" ry="16" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.45" />

          {/* Balanced Zen Stones Cairn (Bottom to Top) */}
          {/* Base Stone */}
          <ellipse cx="300" cy="240" rx="80" ry="24" fill="url(#zenStone)" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.5" />
          <path d="M 235 235 Q 300 220 365 235" fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.4" />

          {/* Second Stone */}
          <ellipse cx="300" cy="202" rx="62" ry="19" fill="url(#zenStone)" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M 248 198 Q 300 186 352 198" fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.4" />

          {/* Third Stone */}
          <ellipse cx="300" cy="170" rx="46" ry="15" fill="url(#zenStone)" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.7" />
          <path d="M 262 167 Q 300 157 338 167" fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.45" />

          {/* Top Stone */}
          <ellipse cx="300" cy="142" rx="30" ry="12" fill="url(#zenStone)" stroke="#86efac" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="300" cy="142" r="16" fill="#4ade80" opacity="0.2" filter="url(#zenGlow)" />

          {/* Bamboo Reeds on Left */}
          <line x1="90" y1="40" x2="90" y2="280" stroke="#15803d" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <line x1="86" y1="120" x2="94" y2="120" stroke="#4ade80" strokeWidth="2" />
          <line x1="86" y1="200" x2="94" y2="200" stroke="#4ade80" strokeWidth="2" />
          <path d="M 90 90 Q 130 80 155 105 Q 120 100 90 90 Z" fill="#4ade80" opacity="0.6" />
          <path d="M 90 170 Q 140 160 165 185 Q 130 180 90 170 Z" fill="#22c55e" opacity="0.5" />

          {/* Bamboo Reeds on Right */}
          <line x1="510" y1="60" x2="510" y2="290" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
          <line x1="506" y1="140" x2="514" y2="140" stroke="#4ade80" strokeWidth="2" />
          <path d="M 510 120 Q 470 110 445 135 Q 480 130 510 120 Z" fill="#4ade80" opacity="0.5" />
        </svg>
      )}

      {/* 5. RAIN CITY: Moody rain streaking down window, glowing urban bokeh lights, steaming coffee */}
      {coverStyle.illustrationType === 'raincity' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="cityRainBlur">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="bokehBlur">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* Distant City Skyline Silhouettes through Rain */}
          <rect x="60" y="110" width="55" height="210" fill="#081820" />
          <rect x="130" y="80" width="70" height="240" fill="#0c232e" />
          <rect x="220" y="130" width="50" height="190" fill="#091b24" />
          <rect x="340" y="90" width="80" height="230" fill="#0c232e" />
          <rect x="440" y="120" width="60" height="200" fill="#081820" />
          <rect x="520" y="75" width="65" height="245" fill="#0c232e" />

          {/* Warm Golden & Teal Bokeh City Window Lights */}
          <circle cx="160" cy="120" r="32" fill="#f59e0b" opacity="0.35" filter="url(#bokehBlur)" />
          <circle cx="160" cy="120" r="14" fill="#fbbf24" opacity="0.6" filter="url(#cityRainBlur)" />
          <circle cx="380" cy="140" r="38" fill="#5eead4" opacity="0.3" filter="url(#bokehBlur)" />
          <circle cx="380" cy="140" r="16" fill="#99f6e4" opacity="0.6" filter="url(#cityRainBlur)" />
          <circle cx="480" cy="160" r="28" fill="#f59e0b" opacity="0.3" filter="url(#bokehBlur)" />

          {/* Window Glass Pane Frame */}
          <line x1="300" y1="0" x2="300" y2="320" stroke="#0f766e" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="0" y1="260" x2="600" y2="260" stroke="#0f766e" strokeWidth="2.5" strokeOpacity="0.4" />

          {/* Diagonal Rain Streaks */}
          <line x1="80" y1="20" x2="55" y2="100" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <line x1="170" y1="50" x2="145" y2="150" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
          <line x1="250" y1="30" x2="225" y2="110" stroke="#99f6e4" strokeWidth="1.6" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="330" y1="70" x2="305" y2="170" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.8" strokeLinecap="round" />
          <line x1="420" y1="35" x2="395" y2="120" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <line x1="500" y1="60" x2="475" y2="160" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
          <line x1="130" y1="170" x2="105" y2="250" stroke="#5eead4" strokeWidth="1.8" strokeOpacity="0.65" strokeLinecap="round" />
          <line x1="280" y1="180" x2="255" y2="260" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
          <line x1="410" y1="170" x2="385" y2="250" stroke="#99f6e4" strokeWidth="1.6" strokeOpacity="0.6" strokeLinecap="round" />

          {/* Steaming Ceramic Mug Silhouette on Windowsill */}
          <rect x="270" y="240" width="36" height="32" rx="4" fill="#0a1a20" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M 306 246 Q 318 252 306 262" fill="none" stroke="#5eead4" strokeWidth="1.8" strokeOpacity="0.6" />
          {/* Coffee Steam Waves */}
          <path d="M 280 234 Q 275 220 282 210 T 280 195" fill="none" stroke="#99f6e4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 292 234 Q 298 220 290 210 T 294 195" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      )}

      {/* 6. HORIZON: Golden desert dawn, soaring peaks, celestial compass rose */}
      {coverStyle.illustrationType === 'horizon' && (
        <svg
          viewBox="0 0 600 320"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="horizonSun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
            </linearGradient>
            <filter id="horizonGlow">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          {/* Majestic Rising Golden Sun */}
          <circle cx="300" cy="160" r="60" fill="url(#horizonSun)" opacity="0.4" filter="url(#horizonGlow)" />
          <circle cx="300" cy="160" r="38" fill="#fbbf24" opacity="0.95" />

          {/* Rolling Golden Dune Contours */}
          <path d="M 0 170 Q 140 120 300 185 T 600 150 L 600 320 L 0 320 Z" fill="#1b1710" opacity="0.85" />
          <path d="M 0 210 Q 180 160 380 225 T 600 195 L 600 320 L 0 320 Z" fill="#292011" />
          <path d="M 0 255 Q 220 215 440 260 T 600 240 L 600 320 L 0 320 Z" fill="#14110b" />

          {/* Crystal Oasis Stream / Lake */}
          <ellipse cx="280" cy="270" rx="90" ry="14" fill="#38bdf8" opacity="0.65" filter="url(#horizonGlow)" />
          <ellipse cx="280" cy="270" rx="75" ry="10" fill="#7dd3fc" opacity="0.8" />

          {/* Soaring Celestial Compass Rose Star in the Sky */}
          <g transform="translate(480, 75)">
            {/* 8-pointed star */}
            <polygon points="0,-24 4,-6 24,0 4,6 0,24 -4,6 -24,0 -4,-6" fill="#fbbf24" opacity="0.9" />
            <polygon points="0,-16 2.5,-4 16,0 2.5,4 0,16 -2.5,4 -16,0 -2.5,-4" fill="#ffffff" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
          </g>

          <g transform="translate(120, 65)">
            <polygon points="0,-16 3,-4 16,0 3,4 0,16 -3,4 -16,0 -3,-4" fill="#fbbf24" opacity="0.75" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>

          {/* Subtle Radiant Rays from Horizon */}
          <line x1="300" y1="160" x2="160" y2="40" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="300" y1="160" x2="300" y2="20" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="300" y1="160" x2="440" y2="40" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.3" />
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
