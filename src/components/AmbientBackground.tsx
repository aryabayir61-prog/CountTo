import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../types/countdown';

interface AmbientBackgroundProps {
  theme: ThemeConfig;
  lightTarget?: 'center' | 'notification';
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ 
  theme,
  lightTarget = 'center',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightTargetRef = useRef<'center' | 'notification'>(lightTarget);

  useEffect(() => {
    lightTargetRef.current = lightTarget;
  }, [lightTarget]);

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

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const isNotification = lightTargetRef.current === 'notification';
      const targetX = isNotification ? width * 0.82 : width * 0.5;
      const targetY = isNotification ? height * 0.78 : height * 0.35;

      // Render floating subtle light orbs with gentle gravity drift towards active light source
      particles.forEach((p) => {
        // Soft gravitational drift towards current light position
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        p.vx += dx * 0.00012;
        p.vy += dy * 0.00012;
        p.vx *= 0.985;
        p.vy *= 0.985;

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
        ctx.fillStyle = theme.primary;
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
  }, [theme.primary]);

  const isNotification = lightTarget === 'notification';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
      {/* Background Radial Tint */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-90"
        style={{
          background: theme.bgGradient,
        }}
      />

      {/* Dynamic CountTo Main Light Orb: Glides to notification on alert, and back to center when done */}
      <div
        className="absolute w-[60vw] h-[60vw] sm:w-[50vw] sm:h-[50vw] rounded-full blur-[140px] opacity-25 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundColor: theme.primary,
          left: isNotification ? '78%' : '50%',
          top: isNotification ? '75%' : '20%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Secondary Supportive Glow: Accentuation light */}
      <div
        className="absolute w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundColor: theme.secondary,
          left: isNotification ? '82%' : '65%',
          top: isNotification ? '80%' : '75%',
          transform: 'translate(-50%, -50%)',
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
