import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Disc3, Headphones, Orbit, Sparkles, Volume2 } from 'lucide-react';
import {
  AcousticSpaceId,
  OrbitSpeed,
  SpatialAudioState,
  spatialAudioProcessor,
} from '../utils/spatialAudioProcessor';

interface SpatialOrbitControlProps {
  activeColors: [string, string];
  onBackToPlayer: () => void;
  onInteraction: () => void;
}

const ACOUSTIC_SPACES: { id: AcousticSpaceId; label: string; desc: string }[] = [
  { id: 'pure', label: 'Saf', desc: 'Doğal çıkış' },
  { id: 'studio', label: 'Stüdyo', desc: 'Yakın akustik' },
  { id: 'concert', label: 'Konser', desc: 'Geniş sahne' },
  { id: 'car', label: 'Gece Arabası', desc: 'Sıcak kabin bası' },
];

const ORBIT_SPEEDS: { id: OrbitSpeed; label: string }[] = [
  { id: 'slow', label: 'Yavaş' },
  { id: 'balanced', label: 'Dengeli' },
  { id: 'fast', label: 'Hızlı' },
];

function describeDirection(az: number, el: number): string {
  if (el > 38) return 'Tepeden';
  const absAz = Math.abs(az);
  const side = az >= 0 ? 'Sağ' : 'Sol';
  if (absAz < 26) return 'Tam Ön';
  if (absAz > 154) return 'Tam Arka';
  if (absAz < 72) return `${side} Ön`;
  if (absAz <= 112) return `${side} Kulak`;
  return `${side} Arka`;
}

export const SpatialOrbitControl: React.FC<SpatialOrbitControlProps> = ({
  activeColors,
  onBackToPlayer,
  onInteraction,
}) => {
  const [spState, setSpState] = useState<SpatialAudioState>(() => spatialAudioProcessor.getState());
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const unsubState = spatialAudioProcessor.subscribeState(setSpState);
    const unsubTel = spatialAudioProcessor.subscribeTelemetry((tel) => {
      setSpState((prev) =>
        prev.azimuthDeg === tel.azimuthDeg && prev.elevationDeg === tel.elevationDeg
          ? prev
          : { ...prev, azimuthDeg: tel.azimuthDeg, elevationDeg: tel.elevationDeg }
      );
    });
    return () => {
      unsubState();
      unsubTel();
    };
  }, []);

  const updatePositionFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = sphereRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = rect.width * 0.42;

      const dx = (clientX - cx) / radius;
      const dy = (clientY - cy) / radius;
      const clampedDist = Math.min(1.15, Math.hypot(dx, dy));

      // Map horizontal offset + top/bottom into 3D spherical azimuth & elevation
      // Left/Right controls azimuth (-180..180), vertical controls front/back & elevation
      const angleRad = Math.atan2(dx, -dy);
      const azDeg = (angleRad * 180) / Math.PI;
      const elDeg = Math.max(-35, Math.min(60, (1 - Math.min(1, clampedDist)) * 55));

      spatialAudioProcessor.setOrbitMode('manual');
      spatialAudioProcessor.setManualPosition(azDeg, elDeg);
      onInteraction();
    },
    [onInteraction]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    updatePositionFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    updatePositionFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Compute 2D projected coordinates of the 3D sound source inside the 168x168 sphere
  const azRad = (spState.azimuthDeg * Math.PI) / 180;
  const elRad = (spState.elevationDeg * Math.PI) / 180;
  const orbitR = 58;
  const projX = Math.sin(azRad) * Math.cos(elRad) * orbitR;
  const projY = -Math.cos(azRad) * Math.cos(elRad) * orbitR * 0.72 - Math.sin(elRad) * 26;
  const depthFactor = Math.cos(azRad); // +1 front, -1 behind
  const isBehind = depthFactor < -0.05;
  const orbScale = 0.8 + (depthFactor + 1) * 0.2;

  // Trailing arc points behind the orb when orbiting
  const trailPoints = Array.from({ length: 14 }, (_, idx) => {
    const stepAz = ((spState.azimuthDeg - idx * 6.5) * Math.PI) / 180;
    const x = 84 + Math.sin(stepAz) * Math.cos(elRad) * orbitR;
    const y = 84 - Math.cos(stepAz) * Math.cos(elRad) * orbitR * 0.72 - Math.sin(elRad) * 26;
    return { x, y, opacity: Math.max(0, 0.75 - idx * 0.055), r: Math.max(1.2, 5.2 - idx * 0.3) };
  });

  return (
    <motion.div
      key="spatial-view"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="relative z-10 flex flex-col gap-3"
    >
      {/* Header: Title + Back to Player */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-white/20 shadow-inner"
            style={{ backgroundColor: `${activeColors[0]}33` }}
          >
            <Orbit className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white leading-none">
              8D Uzamsal Sahne
            </span>
            <span className="text-[10px] text-white/55 mt-0.5">
              {spState.spatialEnabled
                ? spState.orbitMode === 'auto'
                  ? `Oto-Yörünge · ${describeDirection(spState.azimuthDeg, spState.elevationDeg)}`
                  : `Sabit Konum · ${describeDirection(spState.azimuthDeg, spState.elevationDeg)}`
                : 'Küreye dokun veya 8D aç'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBackToPlayer();
          }}
          className="px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-white transition-all active:scale-95 cursor-pointer"
        >
          Çalar
        </button>
      </div>

      {/* Interactive 3D Sound Orbit Radar Sphere */}
      <div className="flex items-center justify-between gap-3">
        <div
          ref={sphereRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-[168px] h-[168px] shrink-0 rounded-full mx-auto cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden border border-white/15 bg-black/45 shadow-[inset_0_0_32px_rgba(255,255,255,0.06)]"
        >
          {/* Ambient internal sphere glow */}
          <div
            className="absolute inset-0 opacity-35 pointer-events-none transition-colors duration-700"
            style={{
              background: `radial-gradient(circle at ${50 + (projX / 84) * 32}% ${50 + (projY / 84) * 32}%, ${activeColors[0]}88 0%, transparent 62%)`,
            }}
          />

          {/* Orbital Guides SVG */}
          <svg viewBox="0 0 168 168" className="w-full h-full pointer-events-none">
            {/* Outer tilted equator ellipse */}
            <ellipse
              cx="84"
              cy="84"
              rx={orbitR}
              ry={orbitR * 0.72}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            {/* Inner elevation horizon */}
            <ellipse
              cx="84"
              cy="84"
              rx={orbitR * 0.56}
              ry={orbitR * 0.4}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            {/* Axis crosshairs */}
            <line x1="84" y1="18" x2="84" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="18" y1="84" x2="150" y2="84" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Comet trail when 8D spatial is enabled */}
            {spState.spatialEnabled &&
              trailPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.r}
                  fill={idx % 2 === 0 ? activeColors[0] : activeColors[1]}
                  opacity={pt.opacity * (isBehind ? 0.5 : 0.9)}
                />
              ))}

            {/* Listener Tether Line */}
            {spState.spatialEnabled && (
              <line
                x1="84"
                y1="84"
                x2={84 + projX}
                y2={84 + projY}
                stroke={activeColors[0]}
                strokeOpacity={isBehind ? 0.25 : 0.5}
                strokeWidth="1.2"
              />
            )}
          </svg>

          {/* Sound Source Orb (renders behind listener if isBehind) */}
          {spState.spatialEnabled && isBehind && (
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full pointer-events-none border border-white/60"
              style={{
                left: 84 + projX,
                top: 84 + projY,
                transform: `scale(${orbScale})`,
                backgroundColor: activeColors[0],
                boxShadow: `0 0 16px ${activeColors[0]}`,
                opacity: 0.72,
              }}
            />
          )}

          {/* Central Listener Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg pointer-events-none">
            <Headphones className="w-4 h-4 text-white/90" />
          </div>

          {/* Sound Source Orb (renders in foreground when in front) */}
          {(!spState.spatialEnabled || !isBehind) && (
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full pointer-events-none border border-white/85 transition-transform duration-75"
              style={{
                left: spState.spatialEnabled ? 84 + projX : 84,
                top: spState.spatialEnabled ? 84 + projY : 38,
                transform: `scale(${spState.spatialEnabled ? orbScale : 0.85})`,
                backgroundColor: spState.spatialEnabled ? activeColors[0] : 'rgba(255,255,255,0.45)',
                boxShadow: spState.spatialEnabled ? `0 0 20px ${activeColors[0]}, 0 0 6px #fff` : 'none',
              }}
            />
          )}

          {/* Subtle cardinal labels */}
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest text-white/35 pointer-events-none">
            ÖN
          </span>
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest text-white/35 pointer-events-none">
            ARKA
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white/35 pointer-events-none">
            L
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white/35 pointer-events-none">
            R
          </span>
        </div>

        {/* Right Column: 8D Master Switch + Orbit Mode & Speed */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              spatialAudioProcessor.toggleSpatial();
              if (!spState.spatialEnabled) {
                spatialAudioProcessor.setOrbitMode('auto');
              }
              onInteraction();
            }}
            className={`w-full py-2 px-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              spState.spatialEnabled
                ? 'bg-white/18 border-white/35 text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-white/70'
            }`}
          >
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" style={{ color: spState.spatialEnabled ? activeColors[0] : undefined }} />
              <span>8D Audio</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                spState.spatialEnabled ? 'bg-lime-400/20 text-lime-300' : 'bg-white/10 text-white/50'
              }`}
            >
              {spState.spatialEnabled ? 'AÇIK' : 'KAPALI'}
            </span>
          </button>

          {/* Auto vs Manual */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/35 border border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!spState.spatialEnabled) spatialAudioProcessor.setSpatialEnabled(true);
                spatialAudioProcessor.setOrbitMode('auto');
                onInteraction();
              }}
              className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                spState.spatialEnabled && spState.orbitMode === 'auto'
                  ? 'bg-white/20 text-white'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              Oto-Dönüş
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!spState.spatialEnabled) spatialAudioProcessor.setSpatialEnabled(true);
                spatialAudioProcessor.setOrbitMode('manual');
                onInteraction();
              }}
              className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                spState.spatialEnabled && spState.orbitMode === 'manual'
                  ? 'bg-white/20 text-white'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              Elle Tut
            </button>
          </div>

          {/* Orbit Speed */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-white/45 px-0.5 flex items-center gap-1">
              <Disc3 className="w-3 h-3" />
              Dönüş Hızı
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/35 border border-white/10">
              {ORBIT_SPEEDS.map((spd) => (
                <button
                  key={spd.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!spState.spatialEnabled) spatialAudioProcessor.setSpatialEnabled(true);
                    spatialAudioProcessor.setOrbitMode('auto');
                    spatialAudioProcessor.setOrbitSpeed(spd.id);
                    onInteraction();
                  }}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    spState.orbitSpeed === spd.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {spd.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Space Selector */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/55 flex items-center gap-1.5">
            <Volume2 className="w-3 h-3" style={{ color: activeColors[0] }} />
            Akustik Mekân & Atmosfer
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {ACOUSTIC_SPACES.map((space) => {
            const active = spState.acousticSpace === space.id;
            return (
              <button
                key={space.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  spatialAudioProcessor.setAcousticSpace(space.id);
                  onInteraction();
                }}
                title={space.desc}
                className={`py-1.5 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? 'bg-white/20 border-white/35 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/12 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-bold leading-tight truncate">{space.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
