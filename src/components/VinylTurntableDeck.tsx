import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SongTrack } from '../utils/musicAudioEngine';

interface VinylTurntableDeckProps {
  track: SongTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onOpenCrate: () => void;
}

export const VinylTurntableDeck: React.FC<VinylTurntableDeckProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onOpenCrate,
}) => {
  const discRef = useRef<HTMLDivElement | null>(null);
  const angleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const [needleHovered, setNeedleHovered] = useState(false);

  isPlayingRef.current = isPlaying;

  // Authentic belt-drive platter inertia spin loop (33 1/3 RPM feel)
  useEffect(() => {
    let rafId = 0;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      const targetVel = isPlayingRef.current ? 78 : 0; // degrees/sec
      const accel = isPlayingRef.current ? 3.8 : 2.6;
      velocityRef.current += (targetVel - velocityRef.current) * Math.min(1, dt * accel);

      if (Math.abs(velocityRef.current) > 0.05) {
        angleRef.current = (angleRef.current + velocityRef.current * dt) % 360;
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  // Tonearm sweeps from outer edge (21 deg) toward inner run-out groove (35.5 deg) as song plays
  const tonearmAngle = isPlaying ? 21 + progress * 14.5 : -2;

  return (
    <div className="relative w-full h-[182px] sm:h-[202px] flex items-center justify-center select-none px-1">
      {/* Subtle platter deck base shadow */}
      <div className="relative w-full max-w-[366px] h-[176px] sm:h-[192px] flex items-center">
        {/* ================= LEFT: TACTILE CARDBOARD ALBUM SLEEVE ================= */}
        <AnimatePresence mode="wait">
          <motion.button
            key={track.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCrate();
            }}
            initial={{ opacity: 0, x: -16, rotate: -4, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, rotate: -2, scale: 1 }}
            exit={{ opacity: 0, x: -14, rotate: -5, scale: 0.94 }}
            whileHover={{ rotate: -0.5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            title="Albüm Kılıfı"
            className="relative z-20 w-[144px] h-[144px] sm:w-[162px] sm:h-[162px] rounded-[5px] overflow-hidden shrink-0 cursor-pointer group focus:outline-none"
            style={{
              boxShadow:
                '0 18px 34px -8px rgba(0,0,0,0.82), 4px 0 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
            <img
              src={track.albumCover}
              alt={track.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="eager"
            />
            {/* Cardboard spine crease & glossy sleeve wrap sheen */}
            <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-white/25 via-black/15 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-black/25 pointer-events-none" />
            {/* Right opening lip shadow */}
            <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-black/55 to-transparent pointer-events-none" />
          </motion.button>
        </AnimatePresence>

        {/* ================= CENTER-RIGHT: GLOSSY SPINNING VINYL PLATTER ================= */}
        <div className="relative z-10 -ml-[54px] sm:-ml-[58px] w-[158px] h-[158px] sm:w-[178px] sm:h-[178px] shrink-0 flex items-center justify-center">
          {/* Recessed dark platter well */}
          <div className="absolute inset-[-4px] rounded-full bg-black/50 border border-white/[0.06] shadow-[inset_0_4px_14px_rgba(0,0,0,0.9)] pointer-events-none" />

          {/* Clickable Vinyl Record */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlayPause();
            }}
            className="relative w-full h-full rounded-full cursor-pointer overflow-hidden shadow-[0_14px_32px_rgba(0,0,0,0.85)]"
            style={{
              background: '#0a0a0c',
            }}
          >
            {/* Rotating Grooves + Center Paper Label */}
            <div
              ref={discRef}
              className="w-full h-full rounded-full relative will-change-transform flex items-center justify-center"
              style={{
                background:
                  'repeating-radial-gradient(circle at center, #0c0c0f 0px, #0c0c0f 1.5px, #16161b 2.2px, #0a0a0d 3px)',
              }}
            >
              {/* Outer bevel edge */}
              <div className="absolute inset-0 rounded-full border border-white/15 pointer-events-none" />

              {/* Subtle run-out dead wax boundary ring */}
              <div
                className="absolute rounded-full border border-white/[0.08] pointer-events-none"
                style={{ inset: '24%' }}
              />

              {/* Circular Center Paper Label (rotates with vinyl, MD Vinyl style) */}
              <div
                className="relative w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] rounded-full flex flex-col items-center justify-center text-center px-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.45),0_0_0_2px_rgba(0,0,0,0.9)]"
                style={{
                  background: 'radial-gradient(circle at 38% 32%, #2d2d33 0%, #1c1c21 75%, #151519 100%)',
                }}
              >
                {/* Thin inner paper ring */}
                <div className="absolute inset-[3.5px] rounded-full border border-white/25 pointer-events-none" />

                {/* Track Title (top half of label) */}
                <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-tight text-zinc-100 leading-tight line-clamp-1 max-w-[56px] -mt-1 mb-2.5">
                  {track.name}
                </span>

                {/* Artist Name (bottom half of label) */}
                <span className="text-[7px] sm:text-[7.5px] font-medium text-zinc-400 leading-tight line-clamp-1 max-w-[52px] mt-1.5">
                  {track.artist}
                </span>

                {/* Micro catalog barcode mark */}
                <div className="absolute bottom-[6px] w-3.5 h-[2px] rounded-full bg-white/30" />

                {/* Brushed Steel Center Spindle Pin */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 border border-black/80 shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
              </div>
            </div>

            {/* Stationary Overhead Room Light Specular Reflections (stationary while grooves spin underneath!) */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-screen"
              style={{
                background:
                  'conic-gradient(from 25deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.22) 28deg, rgba(255,255,255,0.04) 54deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.18) 208deg, rgba(255,255,255,0.03) 235deg, transparent 270deg)',
              }}
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
        </div>

        {/* ================= FAR RIGHT: ARTICULATED METALLIC TONEARM ================= */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlayPause();
          }}
          onMouseEnter={() => setNeedleHovered(true)}
          onMouseLeave={() => setNeedleHovered(false)}
          className="relative z-30 -ml-3 sm:-ml-2 w-[54px] h-[168px] sm:h-[184px] shrink-0 cursor-pointer"
          title={isPlaying ? 'Duraklat' : 'Oynat'}
        >
          {/* Tonearm Mount Pedestal */}
          <div
            className="absolute top-1.5 right-1 w-9 h-14 rounded-full bg-gradient-to-b from-white/[0.08] to-black/50 border border-white/10 shadow-inner pointer-events-none"
          />

          {/* Pivoting Tonearm Assembly */}
          <motion.div
            animate={{ rotate: tonearmAngle }}
            transition={{
              type: 'spring',
              stiffness: 110,
              damping: 18,
              mass: 0.9,
            }}
            style={{ transformOrigin: '28px 26px' }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Rear Counterweight Block */}
            <div
              className={`absolute top-[4px] left-[19px] w-[18px] h-[22px] rounded-[4px] border transition-colors ${
                needleHovered
                  ? 'bg-zinc-700 border-white/35'
                  : 'bg-gradient-to-b from-zinc-700 to-zinc-900 border-white/15'
              } shadow-[0_4px_10px_rgba(0,0,0,0.8)]`}
            >
              <div className="absolute inset-x-1 top-1 h-[2px] rounded-full bg-white/20" />
            </div>

            {/* Gimbal Pivot Housing */}
            <div className="absolute top-[16px] left-[18px] w-[20px] h-[20px] rounded-full bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 border border-white/25 shadow-[0_3px_8px_rgba(0,0,0,0.85)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-zinc-950 border border-white/20" />
            </div>

            {/* Brushed Aluminum Arm Tube */}
            <div
              className="absolute top-[33px] left-[25.5px] w-[5px] h-[94px] sm:h-[104px] rounded-full shadow-[2px_4px_8px_rgba(0,0,0,0.75)]"
              style={{
                background: 'linear-gradient(90deg, #9ca3af 0%, #f4f4f5 45%, #71717a 100%)',
              }}
            />

            {/* Angled Matte Black Headshell + Finger Lift + Stylus */}
            <div
              className="absolute top-[121px] sm:top-[131px] left-[21px] w-[12px] h-[26px] rounded-[3px] bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
              style={{ transform: 'rotate(20deg)', transformOrigin: 'top center' }}
            >
              {/* Headshell finger hook */}
              <div className="absolute -right-[5px] top-[5px] w-[6px] h-[2px] rounded-full bg-zinc-400" />
              {/* Tiny stylus jewel glow when playing */}
              <div
                className={`absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full transition-colors duration-300 ${
                  isPlaying ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]' : 'bg-zinc-600'
                }`}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
