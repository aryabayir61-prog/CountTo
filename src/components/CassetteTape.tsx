import React, { useMemo } from 'react';

interface CassetteTapeProps {
  trackName: string;
  artistName: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onClick?: () => void;
  className?: string;
}

export const CassetteTape: React.FC<CassetteTapeProps> = ({
  trackName,
  artistName,
  currentTime,
  duration,
  isPlaying,
  onClick,
  className = '',
}) => {
  // Safe progress percentage between 0 and 1
  const progress = useMemo(() => {
    if (!duration || duration <= 0 || isNaN(currentTime)) return 0;
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  // Center coordinates of the two reels inside SVG (viewBox: 0 0 310 190)
  const cx1 = 108; // Left spool center X
  const cx2 = 202; // Right spool center X
  const cyReel = 109; // Spool center Y

  // Realistic tape radius calculation (conserving tape area / volume)
  // rMin: just the bare spool hub (10.5px)
  // rMax: full tape spool packed inside the 40px height window (19.5px)
  const rMin = 10.5;
  const rMax = 19.5;
  const rLeft = Math.sqrt((1 - progress) * (rMax * rMax - rMin * rMin) + rMin * rMin);
  const rRight = Math.sqrt(progress * (rMax * rMax - rMin * rMin) + rMin * rMin);

  // Tangent coordinates for the connecting tape strip across the bottom
  const tapeYLeft = cyReel + rLeft - 0.5;
  const tapeYRight = cyReel + rRight - 0.5;

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer transition-transform duration-200 active:scale-[0.985] group ${className}`}
      title={isPlaying ? 'Durdurmak için tıklayın' : 'Oynatmak için tıklayın'}
    >
      <svg
        viewBox="0 0 310 190"
        className="w-full h-auto drop-shadow-2xl overflow-visible"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.65))' }}
      >
        <defs>
          {/* Subtle metallic sheen for screws */}
          <radialGradient id="screwMetal" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#88888e" />
            <stop offset="60%" stopColor="#4a4a50" />
            <stop offset="100%" stopColor="#2c2c30" />
          </radialGradient>

          {/* Magnetic tape sheen */}
          <linearGradient id="tapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#452a18" />
            <stop offset="50%" stopColor="#331e10" />
            <stop offset="100%" stopColor="#22140a" />
          </linearGradient>

          {/* Cassette chassis subtle top-down lighting */}
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#323236" />
            <stop offset="8%" stopColor="#262629" />
            <stop offset="92%" stopColor="#1f1f22" />
            <stop offset="100%" stopColor="#171719" />
          </linearGradient>

          {/* Spool Cogwheel Hub Template */}
          <g id="cassetteSpoolHub">
            {/* White outer gear circle */}
            <circle cx="0" cy="0" r="10" fill="#ffffff" />
            {/* Dark center spindle hole */}
            <circle cx="0" cy="0" r="4.2" fill="#0d0d10" />
            {/* 6 Cogteeth Cutouts (60-deg increments) */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x = 6.2 * Math.cos(rad);
              const y = 6.2 * Math.sin(rad);
              return <circle key={deg} cx={x} cy={y} r="1.3" fill="#0d0d10" />;
            })}
          </g>
        </defs>

        {/* 1. OUTER CHASSIS BODY */}
        <rect
          x="3"
          y="3"
          width="304"
          height="184"
          rx="18"
          fill="url(#chassisGrad)"
          stroke="#161618"
          strokeWidth="2.5"
        />

        {/* Inner Chassis Bevel Border */}
        <rect
          x="7"
          y="7"
          width="296"
          height="176"
          rx="14"
          fill="none"
          stroke="#3d3d42"
          strokeWidth="1"
          opacity="0.45"
        />

        {/* 4 Corner Screws (Authentic Vintage Details) */}
        {[
          { x: 19, y: 19 },
          { x: 291, y: 19 },
          { x: 19, y: 171 },
          { x: 291, y: 171 },
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="3.6" fill="url(#screwMetal)" stroke="#1a1a1c" strokeWidth="0.8" />
            <line
              x1={pt.x - 2}
              y1={pt.y - 1.2}
              x2={pt.x + 2}
              y2={pt.y + 1.2}
              stroke="#18181a"
              strokeWidth="0.9"
            />
            <line
              x1={pt.x - 1.2}
              y1={pt.y + 2}
              x2={pt.x + 1.2}
              y2={pt.y - 2}
              stroke="#18181a"
              strokeWidth="0.9"
            />
          </g>
        ))}

        {/* 2. CREAM PARCHMENT STICKER LABEL */}
        <rect
          x="22"
          y="18"
          width="266"
          height="114"
          rx="10"
          fill="#f3efe4"
          stroke="#ded8c8"
          strokeWidth="1.2"
        />

        {/* Golden / Mustard Yellow Header Ribbon */}
        <path
          d="M 22 28 A 10 10 0 0 1 32 18 L 278 18 A 10 10 0 0 1 288 28 L 288 38 L 22 38 Z"
          fill="#d8b15e"
        />

        {/* Yellow Header Text: SHUFFLER */}
        <text
          x="32"
          y="31"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="800"
          fontSize="9.5"
          letterSpacing="0.28em"
          fill="#3b2b11"
        >
          SHUFFLER
        </text>

        {/* Ruled Horizontal Lines on Label */}
        <line x1="32" y1="67" x2="278" y2="67" stroke="#d5cebc" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="32" y1="88" x2="278" y2="88" stroke="#d5cebc" strokeWidth="1.2" strokeLinecap="round" />

        {/* Handwritten Song Title (Exact style from reference screenshot) */}
        <text
          x="34"
          y="61"
          fontFamily="'Caveat', cursive, sans-serif"
          fontWeight="700"
          fontSize="23"
          fill="#171719"
          style={{ letterSpacing: '0.02em' }}
        >
          {trackName.length > 24 ? `${trackName.slice(0, 22)}…` : trackName}
        </text>

        {/* Handwritten Artist Name */}
        <text
          x="34"
          y="82"
          fontFamily="'Caveat', cursive, sans-serif"
          fontWeight="700"
          fontSize="17"
          fill="#1f1f22"
          style={{ letterSpacing: '0.02em' }}
        >
          {artistName.length > 28 ? `${artistName.slice(0, 26)}…` : artistName}
        </text>

        {/* 3. CENTER CAPSULE WINDOW (Black Tape Chamber) */}
        <rect
          x="80"
          y="88"
          width="150"
          height="42"
          rx="21"
          fill="#0a0a0c"
          stroke="#000000"
          strokeWidth="1.6"
        />

        {/* Internal Chamber Depth Inset */}
        <rect
          x="82"
          y="90"
          width="146"
          height="38"
          rx="19"
          fill="none"
          stroke="#1d1d22"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* 4. DYNAMIC MAGNETIC TAPE SPOOLS (Physical Volume Simulation) */}
        {/* Left Spool Tape Roll (Dark brown disk that smoothly unspools as progress increases) */}
        <circle
          cx={cx1}
          cy={cyReel}
          r={rLeft}
          fill="url(#tapeGradient)"
          stroke="#26170d"
          strokeWidth="0.8"
        />

        {/* Right Spool Tape Roll (Dark brown disk that smoothly spools up as progress increases) */}
        <circle
          cx={cx2}
          cy={cyReel}
          r={rRight}
          fill="url(#tapeGradient)"
          stroke="#26170d"
          strokeWidth="0.8"
        />

        {/* Connecting Magnetic Tape Ribbon (Taut ribbon joining the two reels along the bottom) */}
        <line
          x1={cx1}
          y1={tapeYLeft}
          x2={cx2}
          y2={tapeYRight}
          stroke="#3d2817"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* 5. ROTATING WHITE SPOOL COGWHEELS */}
        {/* Left Cogwheel Hub */}
        <g
          transform={`translate(${cx1}, ${cyReel})`}
          style={{
            transformOrigin: `${cx1}px ${cyReel}px`,
            animation: isPlaying ? 'cassette-spool-spin 2.2s linear infinite' : 'none',
          }}
        >
          <use href="#cassetteSpoolHub" />
        </g>

        {/* Right Cogwheel Hub */}
        <g
          transform={`translate(${cx2}, ${cyReel})`}
          style={{
            transformOrigin: `${cx2}px ${cyReel}px`,
            animation: isPlaying ? 'cassette-spool-spin 2.2s linear infinite' : 'none',
          }}
        >
          <use href="#cassetteSpoolHub" />
        </g>

        {/* 6. BOTTOM TRAPEZOID AREA (Tape Head Chassis Section) */}
        <path
          d="M 68 143 L 242 143 L 253 183 L 57 183 Z"
          fill="#18181b"
          stroke="#111113"
          strokeWidth="1.4"
        />

        {/* Tape Head Cutout Holes */}
        {/* Left Circular Inset */}
        <circle
          cx="123"
          cy="165"
          r="7.5"
          fill="#0c0c0e"
          stroke="#2f2f35"
          strokeWidth="1.2"
        />

        {/* Center Rounded Rectangle Inset */}
        <rect
          x="142"
          y="157"
          width="26"
          height="16"
          rx="4.5"
          fill="#0c0c0e"
          stroke="#2f2f35"
          strokeWidth="1.2"
        />

        {/* Right Circular Inset */}
        <circle
          cx="187"
          cy="165"
          r="7.5"
          fill="#0c0c0e"
          stroke="#2f2f35"
          strokeWidth="1.2"
        />

        {/* Top Specular Rim Glaze */}
        <path
          d="M 12 7 L 298 7"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
