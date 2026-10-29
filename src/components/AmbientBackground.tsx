import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '../types/countdown';
import { musicAudioEngine } from '../utils/musicAudioEngine';

interface AmbientBackgroundProps {
  theme: ThemeConfig;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [musicColors, setMusicColors] = useState<[string, string] | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  useEffect(() => {
    return musicAudioEngine.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
      if (state.track && state.track.colors) {
        setMusicColors(state.track.colors);
      }
    });
  }, []);

  const activePrimary = isMusicPlaying && musicColors ? musicColors[0] : theme.primary;
  const activeSecondary = isMusicPlaying && musicColors ? musicColors[1] : theme.secondary;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for ambient constellation / floating embers
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      phase: number;
      speed: number;
    }

    const particleCount = Math.min(50, Math.floor((width * height) / 30000));
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.008,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating subtle light orbs
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const currentAlpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = activePrimary;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activePrimary]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
      {/* Background Radial Tint */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-90"
        style={{
          background: theme.bgGradient,
        }}
      />

      {/* Ambient Large Glow Spots - Seamlessly transition to album colors when music is playing */}
      <div
        className="absolute -top-[25vw] left-1/2 -translate-x-1/2 w-[75vw] h-[75vw] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ease-out"
        style={{ 
          backgroundColor: activePrimary,
          opacity: isMusicPlaying ? 0.35 : 0.20
        }}
      />
      <div
        className="absolute -bottom-[20vw] right-[10vw] w-[55vw] h-[55vw] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ease-out"
        style={{ 
          backgroundColor: activeSecondary,
          opacity: isMusicPlaying ? 0.30 : 0.15
        }}
      />

      {/* Micro-mesh Grid Pattern for subtle depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      {/* Interactive Stardust Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
