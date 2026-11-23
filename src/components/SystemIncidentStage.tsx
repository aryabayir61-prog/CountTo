import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type IncidentPhase =
  | 'idle'
  | 'dissolving'
  | 'blackout'
  | 'message'
  | 'sadface'
  | 'welling'
  | 'crying';

interface SystemIncidentStageProps {
  phase: IncidentPhase;
}

interface AshParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  aspect: number;
  color: string;
  turbulenceSeed: number;
  delay: number;
}

interface TearDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  length: number;
  alpha: number;
  side: 'left' | 'right';
}

interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface WaterRipple {
  x: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const SystemIncidentStage: React.FC<SystemIncidentStageProps> = ({ phase }) => {
  const ashCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tearsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceContainerRef = useRef<HTMLDivElement | null>(null);

  // Phase 1: Dust & Ash Disintegration Particle System
  useEffect(() => {
    if (phase !== 'dissolving' && phase !== 'blackout') return;

    const canvas = ashCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const ashColors = [
      '#e5e7eb',
      '#cbd5e1',
      '#9ca3af',
      '#6b7280',
      '#4b5563',
      '#374151',
      '#78716c',
      '#a8a29e',
    ];

    const particles: AshParticle[] = [];
    const totalCount = Math.min(1150, Math.max(550, Math.floor((width * height) / 1450)));

    for (let i = 0; i < totalCount; i++) {
      // Concentrate slightly more around UI areas (top bar, center hero, footer) plus full-screen dust
      const regionRoll = Math.random();
      let x = Math.random() * width;
      let y = Math.random() * height;
      if (regionRoll < 0.52) {
        // Center hero cluster
        x = width * 0.5 + (Math.random() - 0.5) * width * 0.68;
        y = height * 0.48 + (Math.random() - 0.5) * height * 0.46;
      } else if (regionRoll < 0.66) {
        // Top nav region
        y = Math.random() * 88;
      } else if (regionRoll < 0.76) {
        // Footer region
        y = height - Math.random() * 72;
      }

      const isFineDust = Math.random() < 0.65;
      particles.push({
        x,
        y,
        vx: 0.35 + Math.random() * 1.45,
        vy: -(0.25 + Math.random() * 1.25),
        size: isFineDust ? 1.1 + Math.random() * 2.1 : 2.4 + Math.random() * 4.0,
        alpha: 0.45 + Math.random() * 0.5,
        decay: 0.0028 + Math.random() * 0.0042,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.07,
        aspect: isFineDust ? 1 : 0.45 + Math.random() * 0.6,
        color: ashColors[Math.floor(Math.random() * ashColors.length)],
        turbulenceSeed: Math.random() * 100,
        delay: Math.random() * 75,
      });
    }

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (tick < p.delay) {
          activeCount += 1;
          continue;
        }
        if (p.alpha <= 0.01) continue;
        activeCount += 1;

        const swirlX = Math.sin(tick * 0.028 + p.turbulenceSeed) * 0.32;
        const swirlY = Math.cos(tick * 0.022 + p.turbulenceSeed * 1.3) * 0.24;

        p.x += p.vx + swirlX;
        p.y += p.vy + swirlY;
        // Slight gravity settling after initial updraft
        p.vy += 0.0045;
        p.vx *= 0.996;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.size <= 2.2) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Irregular ash flake polygon
          const w = p.size;
          const h = p.size * p.aspect;
          ctx.beginPath();
          ctx.moveTo(-w * 0.5, -h * 0.3);
          ctx.lineTo(w * 0.2, -h * 0.55);
          ctx.lineTo(w * 0.55, h * 0.1);
          ctx.lineTo(-w * 0.1, h * 0.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (activeCount > 0) {
        animId = window.requestAnimationFrame(render);
      }
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  // Phase 4: Detailed Torrential Crying Canvas (streams, falling droplets, splashes, rising flood pool)
  useEffect(() => {
    if (phase !== 'crying') return;

    const canvas = tearsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: TearDrop[] = [];
    const splashes: SplashDroplet[] = [];
    const ripples: WaterRipple[] = [];

    const startTime = performance.now();

    const getEyeOrigins = () => {
      const rect = faceContainerRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        // Match SVG eye lower-rim positions inside the 176x176 viewBox
        const leftX = rect.left + rect.width * (62 / 176);
        const rightX = rect.left + rect.width * (114 / 176);
        const eyeY = rect.top + rect.height * (84 / 176);
        return { leftX, rightX, eyeY };
      }
      return {
        leftX: width * 0.5 - 26,
        rightX: width * 0.5 + 26,
        eyeY: height * 0.5 + 20,
      };
    };

    let tick = 0;
    const render = (now: number) => {
      tick += 1;
      const elapsedSec = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      const { leftX, rightX, eyeY } = getEyeOrigins();

      // Flood water level rises smoothly from bottom up to ~16% of viewport height
      const floodBuild = Math.min(1, elapsedSec / 7.5);
      const maxFloodHeight = Math.min(138, Math.max(72, height * 0.145));
      const waterSurfaceY = height - maxFloodHeight * (0.18 + 0.82 * (1 - Math.pow(1 - floodBuild, 2.2)));

      // Stream intensity ramps rapidly over first 1.2s
      const intensity = Math.min(1, elapsedSec / 1.15);

      // Draw twin continuous rushing tear streams from eyes down to waterSurfaceY
      const drawStream = (originX: number, phaseOffset: number, side: -1 | 1) => {
        const streamTop = eyeY;
        const streamBottom = waterSurfaceY + 6;
        const streamHeight = Math.max(40, streamBottom - streamTop);

        // Soft outer mist glow
        const outerGrad = ctx.createLinearGradient(0, streamTop, 0, streamBottom);
        outerGrad.addColorStop(0, `rgba(147, 197, 253, ${0.42 * intensity})`);
        outerGrad.addColorStop(0.55, `rgba(96, 165, 250, ${0.32 * intensity})`);
        outerGrad.addColorStop(1, `rgba(56, 189, 248, ${0.22 * intensity})`);

        // Build slightly widening, undulating cascading waterfall ribbons
        const segments = 24;
        ctx.save();
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const y = streamTop + streamHeight * t;
          const spread = 5.5 + t * 13 * intensity;
          const wave =
            Math.sin(t * 10 - tick * 0.24 + phaseOffset) * (1.8 + t * 2.5) +
            side * Math.sin(t * 4.2) * 1.4;
          const x = originX - spread * 0.5 + wave;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let s = segments; s >= 0; s--) {
          const t = s / segments;
          const y = streamTop + streamHeight * t;
          const spread = 5.5 + t * 13 * intensity;
          const wave =
            Math.sin(t * 10 - tick * 0.24 + phaseOffset + 1.1) * (1.8 + t * 2.5) +
            side * Math.sin(t * 4.2) * 1.4;
          const x = originX + spread * 0.5 + wave;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Bright inner turbulent water core
        const coreGrad = ctx.createLinearGradient(0, streamTop, 0, streamBottom);
        coreGrad.addColorStop(0, `rgba(224, 242, 254, ${0.78 * intensity})`);
        coreGrad.addColorStop(0.45, `rgba(186, 230, 253, ${0.58 * intensity})`);
        coreGrad.addColorStop(1, `rgba(125, 211, 252, ${0.34 * intensity})`);

        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const y = streamTop + streamHeight * t;
          const spread = 2.6 + t * 5.4 * intensity;
          const wave = Math.sin(t * 14 - tick * 0.31 + phaseOffset) * (1.1 + t * 1.8);
          const x = originX - spread * 0.5 + wave;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let s = segments; s >= 0; s--) {
          const t = s / segments;
          const y = streamTop + streamHeight * t;
          const spread = 2.6 + t * 5.4 * intensity;
          const wave = Math.sin(t * 14 - tick * 0.31 + phaseOffset + 0.8) * (1.1 + t * 1.8);
          const x = originX + spread * 0.5 + wave;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Fast downward white highlight streaks inside the waterfall
        ctx.strokeStyle = `rgba(240, 249, 255, ${0.52 * intensity})`;
        ctx.lineWidth = 1.25;
        for (let k = 0; k < 3; k++) {
          const offsetProgress = ((tick * 0.045 + k * 0.33 + phaseOffset * 0.2) % 1);
          const streakY1 = streamTop + offsetProgress * (streamHeight - 36);
          const streakY2 = streakY1 + 18 + Math.random() * 14;
          const sx = originX + Math.sin(offsetProgress * 8 + k) * (2.5 + offsetProgress * 3.5);
          ctx.beginPath();
          ctx.moveTo(sx, streakY1);
          ctx.lineTo(sx + side * 0.5, Math.min(streamBottom, streakY2));
          ctx.stroke();
        }

        ctx.restore();
      };

      drawStream(leftX, 0, -1);
      drawStream(rightX, 2.3, 1);

      // Spawn fast falling individual tear droplets & edge spray
      const spawnCount = intensity > 0.35 ? 2 : 1;
      for (let i = 0; i < spawnCount; i++) {
        if (Math.random() < 0.82 * intensity) {
          const isLeft = Math.random() < 0.5;
          const baseX = isLeft ? leftX : rightX;
          drops.push({
            x: baseX + (Math.random() - 0.5) * 14,
            y: eyeY + 4 + Math.random() * 18,
            vx: (Math.random() - 0.5) * 0.9,
            vy: 4.5 + Math.random() * 4.5,
            radius: 1.5 + Math.random() * 2.5,
            length: 7 + Math.random() * 11,
            alpha: 0.55 + Math.random() * 0.4,
            side: isLeft ? 'left' : 'right',
          });
        }
      }

      // Update and draw falling tear droplets
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += 0.34; // gravity
        d.x += d.vx;
        d.y += d.vy;

        if (d.y >= waterSurfaceY) {
          // Spawn splash droplets & ripple on water impact
          if (splashes.length < 180) {
            const burst = Math.random() < 0.55 ? 2 : 1;
            for (let b = 0; b < burst; b++) {
              splashes.push({
                x: d.x + (Math.random() - 0.5) * 6,
                y: waterSurfaceY,
                vx: (Math.random() - 0.5) * 3.4,
                vy: -(1.8 + Math.random() * 3.6),
                radius: 1.0 + Math.random() * 1.7,
                alpha: 0.8,
                life: 0,
                maxLife: 18 + Math.random() * 16,
              });
            }
          }
          if (ripples.length < 28 && Math.random() < 0.38) {
            ripples.push({
              x: d.x,
              radius: 4,
              maxRadius: 28 + Math.random() * 38,
              alpha: 0.55,
            });
          }
          drops.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = d.alpha * intensity;
        const grad = ctx.createLinearGradient(d.x, d.y - d.length, d.x, d.y + d.radius);
        grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
        grad.addColorStop(0.55, 'rgba(125, 211, 252, 0.72)');
        grad.addColorStop(1, 'rgba(224, 242, 254, 0.95)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.length);
        ctx.quadraticCurveTo(d.x + d.radius, d.y, d.x, d.y + d.radius);
        ctx.quadraticCurveTo(d.x - d.radius, d.y, d.x, d.y - d.length);
        ctx.fill();
        ctx.restore();
      }

      // Draw rising & undulating flood pool at bottom of screen
      ctx.save();
      const wavePoints = 48;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i <= wavePoints; i++) {
        const px = (i / wavePoints) * width;
        const distLeft = Math.abs(px - leftX);
        const distRight = Math.abs(px - rightX);
        const impactDist = Math.min(distLeft, distRight);
        const impactRipple =
          Math.sin(impactDist * 0.08 - tick * 0.25) *
          Math.exp(-impactDist * 0.012) *
          5.2 *
          intensity;
        const ambientWave =
          Math.sin(px * 0.015 + tick * 0.045) * 3.0 +
          Math.cos(px * 0.028 - tick * 0.06) * 1.8;
        const py = waterSurfaceY + ambientWave + impactRipple;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const poolGrad = ctx.createLinearGradient(0, waterSurfaceY - 8, 0, height);
      poolGrad.addColorStop(0, 'rgba(125, 211, 252, 0.34)');
      poolGrad.addColorStop(0.28, 'rgba(56, 189, 248, 0.24)');
      poolGrad.addColorStop(1, 'rgba(14, 116, 144, 0.42)');
      ctx.fillStyle = poolGrad;
      ctx.fill();

      // Shimmering water surface edge line
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const px = (i / wavePoints) * width;
        const distLeft = Math.abs(px - leftX);
        const distRight = Math.abs(px - rightX);
        const impactDist = Math.min(distLeft, distRight);
        const impactRipple =
          Math.sin(impactDist * 0.08 - tick * 0.25) *
          Math.exp(-impactDist * 0.012) *
          5.2 *
          intensity;
        const ambientWave =
          Math.sin(px * 0.015 + tick * 0.045) * 3.0 +
          Math.cos(px * 0.028 - tick * 0.06) * 1.8;
        const py = waterSurfaceY + ambientWave + impactRipple;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.55 * intensity})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Draw elliptical splash ripples on surface
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.25;
        r.alpha *= 0.93;
        if (r.radius >= r.maxRadius || r.alpha < 0.03) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(r.x, waterSurfaceY + 4, r.radius, r.radius * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw bouncing splash droplets
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life += 1;
        s.vy += 0.24;
        s.x += s.vx;
        s.y += s.vy;
        const progress = s.life / s.maxLife;
        if (progress >= 1) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${(1 - progress) * s.alpha})`;
        ctx.fill();
      }

      // Subtle continuous foam crown right where left/right streams hit the flood
      [leftX, rightX].forEach((sx) => {
        const glow = ctx.createRadialGradient(sx, waterSurfaceY, 2, sx, waterSurfaceY, 28);
        glow.addColorStop(0, `rgba(224, 242, 254, ${0.42 * intensity})`);
        glow.addColorStop(1, 'rgba(125, 211, 252, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(sx, waterSurfaceY + 2, 28, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  if (phase === 'idle') return null;

  const isBlackOrBeyond =
    phase === 'blackout' ||
    phase === 'message' ||
    phase === 'sadface' ||
    phase === 'welling' ||
    phase === 'crying';

  const showMessage =
    phase === 'message' ||
    phase === 'sadface' ||
    phase === 'welling' ||
    phase === 'crying';

  const showSadFace =
    phase === 'sadface' ||
    phase === 'welling' ||
    phase === 'crying';

  const isWelling = phase === 'welling' || phase === 'crying';
  const isCrying = phase === 'crying';

  return (
    <>
      {/* Pitch black backdrop fading in over the disintegrating UI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isBlackOrBeyond ? 1 : 0.72 }}
        transition={{ duration: phase === 'dissolving' ? 3.8 : 0.8, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9997] bg-black pointer-events-auto"
      />

      {/* Dust & Ash Disintegration Canvas */}
      {(phase === 'dissolving' || phase === 'blackout') && (
        <canvas
          ref={ashCanvasRef}
          className="fixed inset-0 z-[9998] pointer-events-none"
        />
      )}

      {/* Torrential Tear Streams, Droplets & Flood Canvas */}
      {isCrying && (
        <canvas
          ref={tearsCanvasRef}
          className="fixed inset-0 z-[10000] pointer-events-none"
        />
      )}

      {/* Serious Deadpan Text + Clean Sad Face */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6 select-none pointer-events-auto"
          >
            {/* Serious, deadpan typography */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-100"
            >
              Defne Beni Bozdu
            </motion.h1>

            {/* Clean, well-proportioned mid-detail Sad Face */}
            <AnimatePresence>
              {showSadFace && (
                <motion.div
                  ref={faceContainerRef}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={
                    isCrying
                      ? {
                          opacity: 1,
                          scale: 1,
                          y: [0, 3.5, 0, 2, 0],
                          rotate: [0, -0.7, 0.6, -0.4, 0],
                        }
                      : isWelling
                        ? {
                            opacity: 1,
                            scale: 1,
                            y: [0, 1.5, 0],
                          }
                        : {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }
                  }
                  transition={
                    isCrying
                      ? {
                          opacity: { duration: 0.8 },
                          scale: { duration: 0.8 },
                          y: { duration: 1.45, repeat: Infinity, ease: 'easeInOut' },
                          rotate: { duration: 2.1, repeat: Infinity, ease: 'easeInOut' },
                        }
                      : isWelling
                        ? {
                            y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                          }
                        : { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="mt-10 relative flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 176 176"
                    className="w-36 h-36 sm:w-44 sm:h-44 overflow-visible drop-shadow-[0_12px_36px_rgba(0,0,0,0.9)]"
                    aria-hidden="true"
                  >
                    <defs>
                      {/* Clean muted slate-metallic gradient for a composed, tasteful sad face */}
                      <radialGradient id="sadFaceSkin" cx="42%" cy="32%" r="68%">
                        <stop offset="0%" stopColor="#3f3f46" />
                        <stop offset="58%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#141417" />
                      </radialGradient>

                      <radialGradient id="sadFaceRim" cx="50%" cy="50%" r="50%">
                        <stop offset="76%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.18" />
                      </radialGradient>

                      <linearGradient id="tearSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
                      </linearGradient>

                      <linearGradient id="cheekWet" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>

                      <clipPath id="leftEyeClip">
                        <ellipse cx="62" cy="76" rx="10.5" ry={isCrying ? 8.5 : 10.5} />
                      </clipPath>
                      <clipPath id="rightEyeClip">
                        <ellipse cx="114" cy="76" rx="10.5" ry={isCrying ? 8.5 : 10.5} />
                      </clipPath>
                    </defs>

                    {/* Face Circle */}
                    <circle
                      cx="88"
                      cy="88"
                      r="74"
                      fill="url(#sadFaceSkin)"
                      stroke="#52525b"
                      strokeWidth="1.5"
                    />
                    <circle cx="88" cy="88" r="73" fill="url(#sadFaceRim)" />

                    {/* Subtle wet cheek streaks during crying */}
                    {isCrying && (
                      <g opacity="0.85">
                        <path
                          d="M55 83 C53 102, 54 126, 56 149 L68 149 C69 126, 68 102, 69 83 Z"
                          fill="url(#cheekWet)"
                        />
                        <path
                          d="M107 83 C106 102, 107 126, 108 149 L120 149 C121 126, 120 102, 119 83 Z"
                          fill="url(#cheekWet)"
                        />
                      </g>
                    )}

                    {/* Eyebrows - downcast & expressive, slightly furrowed more while crying */}
                    <motion.path
                      d={
                        isCrying
                          ? 'M45 60 Q57 57 69 51'
                          : isWelling
                            ? 'M46 61 Q57 58 69 53'
                            : 'M46 62 Q58 59 69 55'
                      }
                      fill="none"
                      stroke="#d4d4d8"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      animate={isCrying ? { y: [0, -1, 0] } : { y: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.path
                      d={
                        isCrying
                          ? 'M131 60 Q119 57 107 51'
                          : isWelling
                            ? 'M130 61 Q119 58 107 53'
                            : 'M130 62 Q118 59 107 55'
                      }
                      fill="none"
                      stroke="#d4d4d8"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      animate={isCrying ? { y: [0, -1, 0] } : { y: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Left Eye */}
                    <g>
                      <ellipse
                        cx="62"
                        cy="76"
                        rx="10.5"
                        ry={isCrying ? 8.5 : 10.5}
                        fill="#09090b"
                        stroke="#3f3f46"
                        strokeWidth="1"
                      />
                      {/* Eye Catchlights */}
                      <circle cx="58.5" cy="72.5" r="2.6" fill="#f4f4f5" opacity={isWelling ? 0.95 : 0.78} />
                      <circle cx="65.5" cy="79" r="1.2" fill="#e4e4e7" opacity="0.55" />

                      {/* Rising Tear Meniscus inside Left Eye */}
                      {isWelling && (
                        <g clipPath="url(#leftEyeClip)">
                          <motion.rect
                            x="50"
                            width="24"
                            height="14"
                            fill="url(#tearSheen)"
                            initial={{ y: 86 }}
                            animate={{ y: isCrying ? 76.5 : 79.5 }}
                            transition={{ duration: 0.75, ease: 'easeOut' }}
                          />
                          <motion.path
                            d="M50 78 Q56 76 62 78 T74 78"
                            fill="none"
                            stroke="#f0f9ff"
                            strokeWidth="1.2"
                            animate={isCrying ? { y: [0, -1, 0.5, 0] } : { y: 0 }}
                            transition={{ duration: 0.7, repeat: Infinity }}
                          />
                        </g>
                      )}

                      {/* Overflow rim droplet on Left Lower Lid */}
                      {isWelling && (
                        <motion.ellipse
                          cx="62"
                          cy="84"
                          rx={isCrying ? 9.5 : 5.5}
                          ry={isCrying ? 3.2 : 2.1}
                          fill="#bae6fd"
                          opacity={isCrying ? 0.88 : 0.72}
                          animate={isCrying ? { scaleX: [1, 1.08, 0.96, 1] } : {}}
                          transition={{ duration: 0.55, repeat: Infinity }}
                        />
                      )}
                    </g>

                    {/* Right Eye */}
                    <g>
                      <ellipse
                        cx="114"
                        cy="76"
                        rx="10.5"
                        ry={isCrying ? 8.5 : 10.5}
                        fill="#09090b"
                        stroke="#3f3f46"
                        strokeWidth="1"
                      />
                      {/* Eye Catchlights */}
                      <circle cx="110.5" cy="72.5" r="2.6" fill="#f4f4f5" opacity={isWelling ? 0.95 : 0.78} />
                      <circle cx="117.5" cy="79" r="1.2" fill="#e4e4e7" opacity="0.55" />

                      {/* Rising Tear Meniscus inside Right Eye */}
                      {isWelling && (
                        <g clipPath="url(#rightEyeClip)">
                          <motion.rect
                            x="102"
                            width="24"
                            height="14"
                            fill="url(#tearSheen)"
                            initial={{ y: 86 }}
                            animate={{ y: isCrying ? 76.5 : 79.5 }}
                            transition={{ duration: 0.75, ease: 'easeOut' }}
                          />
                          <motion.path
                            d="M102 78 Q108 76 114 78 T126 78"
                            fill="none"
                            stroke="#f0f9ff"
                            strokeWidth="1.2"
                            animate={isCrying ? { y: [0, 0.8, -0.8, 0] } : { y: 0 }}
                            transition={{ duration: 0.7, repeat: Infinity }}
                          />
                        </g>
                      )}

                      {/* Overflow rim droplet on Right Lower Lid */}
                      {isWelling && (
                        <motion.ellipse
                          cx="114"
                          cy="84"
                          rx={isCrying ? 9.5 : 5.5}
                          ry={isCrying ? 3.2 : 2.1}
                          fill="#bae6fd"
                          opacity={isCrying ? 0.88 : 0.72}
                          animate={isCrying ? { scaleX: [1, 0.96, 1.08, 1] } : {}}
                          transition={{ duration: 0.55, repeat: Infinity }}
                        />
                      )}
                    </g>

                    {/* First Heavy Swelling Tear Drops during Welling transition */}
                    {phase === 'welling' && (
                      <g>
                        <motion.path
                          d="M62 84 C65 89, 66 93, 62 95 C58 93, 59 89, 62 84 Z"
                          fill="#bae6fd"
                          initial={{ opacity: 0, y: 0, scale: 0.6 }}
                          animate={{ opacity: [0, 0.95, 0.95], y: [0, 6, 14], scale: [0.6, 1.05, 1] }}
                          transition={{ duration: 0.85, ease: 'easeIn' }}
                        />
                        <motion.path
                          d="M114 84 C117 89, 118 93, 114 95 C110 93, 111 89, 114 84 Z"
                          fill="#bae6fd"
                          initial={{ opacity: 0, y: 0, scale: 0.6 }}
                          animate={{ opacity: [0, 0.95, 0.95], y: [0, 5, 13], scale: [0.6, 1.05, 1] }}
                          transition={{ duration: 0.85, delay: 0.08, ease: 'easeIn' }}
                        />
                      </g>
                    )}

                    {/* Mouth - clean downturned frown, trembling & deepening when crying */}
                    <motion.path
                      d={
                        isCrying
                          ? 'M63 128 Q88 106 113 128'
                          : isWelling
                            ? 'M65 126 Q88 110 111 126'
                            : 'M66 125 Q88 111 110 125'
                      }
                      fill="none"
                      stroke="#d4d4d8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      animate={
                        isCrying
                          ? { y: [0, 1.2, -0.6, 1, 0], scaleX: [1, 0.97, 1.02, 1] }
                          : isWelling
                            ? { y: [0, 0.6, 0] }
                            : { y: 0 }
                      }
                      transition={
                        isCrying
                          ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
                          : isWelling
                            ? { duration: 0.35, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.5 }
                      }
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
