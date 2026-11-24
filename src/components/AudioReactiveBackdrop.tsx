import React, { useEffect, useRef, useState } from 'react';
import { musicAudioEngine, PRESET_SONGS, SongTrack } from '../utils/musicAudioEngine';
import { extractAlbumColors } from '../utils/colorExtractor';
import {
  AudioTelemetry,
  SpatialAudioState,
  spatialAudioProcessor,
} from '../utils/spatialAudioProcessor';

interface LightMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  colorIdx: 0 | 1;
  phase: number;
}

interface BokehOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export const AudioReactiveBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<SongTrack | null>(null);
  const [albumColors, setAlbumColors] = useState<[string, string]>(['#22d3ee', '#8b5cf6']);
  const [spatialState, setSpatialState] = useState<SpatialAudioState>(() =>
    spatialAudioProcessor.getState()
  );

  const telemetryRef = useRef<AudioTelemetry>(spatialAudioProcessor.getTelemetry());
  const colorsRef = useRef<[string, string]>(albumColors);
  const spatialRef = useRef<SpatialAudioState>(spatialState);
  const isPlayingRef = useRef<boolean>(false);

  colorsRef.current = albumColors;
  spatialRef.current = spatialState;
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const unsubAudio = musicAudioEngine.subscribe((s) => {
      setIsPlaying(s.isPlaying);
      if (s.track && s.track.id !== activeTrack?.id) {
        setActiveTrack(s.track);
      } else if (!s.track && !activeTrack) {
        setActiveTrack(PRESET_SONGS[0]);
      }
    });
    const unsubSpatial = spatialAudioProcessor.subscribeState(setSpatialState);
    const unsubTel = spatialAudioProcessor.subscribeTelemetry((tel) => {
      telemetryRef.current = tel;
      // Direct DOM transform updates for zero-React-render 60fps liquid glass pulse
      if (auraRef.current && isPlayingRef.current) {
        const s = 1 + tel.bass * 0.14;
        const azShiftX = spatialRef.current.spatialEnabled
          ? Math.sin((tel.azimuthDeg * Math.PI) / 180) * 68
          : 0;
        const azShiftY = spatialRef.current.spatialEnabled
          ? -Math.cos((tel.azimuthDeg * Math.PI) / 180) * 28
          : 0;
        auraRef.current.style.transform = `translate3d(calc(-50% + ${azShiftX.toFixed(1)}px), calc(-50% + ${azShiftY.toFixed(1)}px), 0) scale(${s.toFixed(3)})`;
        auraRef.current.style.opacity = `${(0.24 + tel.energy * 0.28).toFixed(3)}`;
      }
      if (ringRef.current && isPlayingRef.current) {
        const ringScale = 0.94 + tel.bass * 0.22;
        ringRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${ringScale.toFixed(3)})`;
        ringRef.current.style.opacity = `${(0.14 + tel.bass * 0.36).toFixed(3)}`;
      }
    });

    return () => {
      unsubAudio();
      unsubSpatial();
      unsubTel();
    };
  }, [activeTrack]);

  useEffect(() => {
    const cover = activeTrack?.albumCover;
    if (!cover) return;
    extractAlbumColors(cover).then((cols) => {
      setAlbumColors(cols);
    });
  }, [activeTrack?.albumCover]);

  // Cover-to-Light Particle Field + Acoustic Space Canvas
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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

    const moteCount = Math.min(130, Math.max(60, Math.floor((width * height) / 14000)));
    const motes: LightMote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1.2 + Math.random() * 2.6,
      alpha: 0.25 + Math.random() * 0.55,
      colorIdx: Math.random() < 0.55 ? 0 : 1,
      phase: Math.random() * Math.PI * 2,
    }));

    const carBokehColors = ['#f59e0b', '#fb7185', '#38bdf8', '#fde68a', '#f97316'];
    const bokehOrbs: BokehOrb[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: height * (0.45 + Math.random() * 0.55),
      vx: -(0.35 + Math.random() * 0.9),
      vy: (Math.random() - 0.5) * 0.12,
      radius: 18 + Math.random() * 44,
      color: carBokehColors[Math.floor(Math.random() * carBokehColors.length)],
      alpha: 0.06 + Math.random() * 0.1,
    }));

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      const tel = telemetryRef.current;
      const [c0, c1] = colorsRef.current;
      const sp = spatialRef.current;
      const azRad = (tel.azimuthDeg * Math.PI) / 180;

      // 1. Acoustic Space Atmosphere: Concert Stage Spotlights
      if (sp.acousticSpace === 'concert') {
        ctx.save();
        const beamIntensity = 0.08 + tel.mid * 0.14;
        const leftSweep = Math.sin(tick * 0.012) * 0.22;
        const rightSweep = Math.cos(tick * 0.01) * 0.22;

        const drawBeam = (originX: number, sweepAngle: number, color: string) => {
          const beamLen = Math.hypot(width, height) * 0.95;
          const endX = originX + Math.sin(sweepAngle) * beamLen;
          const endY = Math.cos(sweepAngle) * beamLen;
          const grad = ctx.createLinearGradient(originX, -40, endX, endY);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'transparent');

          ctx.globalAlpha = beamIntensity;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(originX - 24, -40);
          ctx.lineTo(originX + 24, -40);
          ctx.lineTo(endX + 210, endY);
          ctx.lineTo(endX - 210, endY);
          ctx.closePath();
          ctx.fill();
        };

        drawBeam(width * 0.2, 0.22 + leftSweep, c0);
        drawBeam(width * 0.8, -0.22 + rightSweep, c1);
        ctx.restore();
      }

      // 2. Acoustic Space Atmosphere: Gece Arabası Passing Streetlight Bokeh
      if (sp.acousticSpace === 'car') {
        ctx.save();
        for (const b of bokehOrbs) {
          b.x += b.vx * (1 + tel.bass * 1.4);
          b.y += b.vy;
          if (b.x < -b.radius * 2) b.x = width + b.radius * 2;
          const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
          glow.addColorStop(0, b.color);
          glow.addColorStop(0.55, b.color);
          glow.addColorStop(1, 'transparent');
          ctx.globalAlpha = b.alpha * (0.75 + tel.energy * 0.55);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Cover-to-Light Fluid Particle Field (reacts to Bass + 8D Azimuth)
      const cx = width * 0.5;
      const cy = height * 0.5;
      const swirlBias = sp.spatialEnabled ? Math.sin(azRad) * 0.65 : 0;

      ctx.save();
      for (const m of motes) {
        m.phase += 0.015 + tel.high * 0.03;
        const dx = m.x - cx;
        const dy = m.y - cy;
        const dist = Math.max(60, Math.hypot(dx, dy));

        // Gentle orbital + curl flow
        const tangentX = -dy / dist;
        const tangentY = dx / dist;
        const speedBoost = 0.55 + tel.energy * 1.85;

        m.x += (m.vx + tangentX * (0.25 + swirlBias) + Math.cos(m.phase) * 0.25) * speedBoost;
        m.y += (m.vy + tangentY * (0.25 + swirlBias) + Math.sin(m.phase) * 0.25) * speedBoost;

        if (m.x < -30) m.x = width + 30;
        if (m.x > width + 30) m.x = -30;
        if (m.y < -30) m.y = height + 30;
        if (m.y > height + 30) m.y = -30;

        const r = m.radius * (1 + tel.bass * 0.85);
        ctx.globalAlpha = m.alpha * (0.45 + tel.energy * 0.55);
        ctx.fillStyle = m.colorIdx === 0 ? c0 : c1;
        ctx.shadowColor = m.colorIdx === 0 ? c0 : c1;
        ctx.shadowBlur = 10 + tel.bass * 14;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[1] overflow-hidden transition-opacity duration-700 ${
        isPlaying ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dynamic Album Liquid Refraction Glow Behind Countdown */}
      <div
        ref={auraRef}
        className="absolute left-1/2 top-1/2 w-[56vw] h-[56vw] max-w-[680px] max-h-[680px] rounded-full blur-[120px] transition-colors duration-1000 will-change-transform"
        style={{
          transform: 'translate3d(-50%, -50%, 0)',
          background: `radial-gradient(circle, ${albumColors[0]} 0%, ${albumColors[1]} 55%, transparent 75%)`,
          opacity: 0.24,
        }}
      />

      {/* Specular Chromatic Refraction Ring Pulsing with Sub-Bass */}
      <div
        ref={ringRef}
        className="absolute left-1/2 top-1/2 w-[38vw] h-[38vw] max-w-[480px] max-h-[480px] rounded-full will-change-transform"
        style={{
          transform: 'translate3d(-50%, -50%, 0)',
          border: `1px solid ${albumColors[0]}55`,
          boxShadow: `0 0 80px -12px ${albumColors[0]}66, inset 0 0 60px -16px ${albumColors[1]}55`,
          opacity: 0.16,
        }}
      />

      {/* 8D Orbital Spatial Indicator Ring when 8D Audio is active */}
      {isPlaying && spatialState.spatialEnabled && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78vw] h-[44vh] max-w-[920px] rounded-full border border-white/[0.04] pointer-events-none"
        />
      )}

      {/* Cover-to-Light Particle & Acoustic Space Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
