import React, { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  thickness: number;
  speed: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  alpha: number;
  decay: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
}

interface SurfaceRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const RainEffectCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateSurfaces();
    };

    window.addEventListener('resize', handleResize);

    // Surfaces that rain can hit and splash/bounce off
    let surfaces: SurfaceRect[] = [];

    const updateSurfaces = () => {
      const elements = document.querySelectorAll(
        '[data-rain-surface="true"], .sticky-note-window, .rain-bounce-target, h1'
      );
      const newSurfaces: SurfaceRect[] = [];

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Only consider elements that are visible and have meaningful dimensions
        if (rect.width > 30 && rect.height > 20 && rect.top < height && rect.bottom > 0) {
          newSurfaces.push({
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          });
        }
      });

      surfaces = newSurfaces;
    };

    // Initial query and periodic update for dynamic layouts
    updateSurfaces();
    const surfaceInterval = setInterval(updateSurfaces, 400);

    // Raindrop physics configuration
    const dropCount = Math.min(220, Math.floor((width * height) / 8000));
    const raindrops: RainDrop[] = [];
    const splashParticles: SplashParticle[] = [];
    const ripples: Ripple[] = [];

    // Wind angle: gentle natural tilt (~4-7 degrees)
    const windAngle = -0.09;
    const sinAngle = Math.sin(windAngle);
    const cosAngle = Math.cos(windAngle);

    const createDrop = (randomY = false): RainDrop => {
      const speed = Math.random() * 12 + 18; // 18 - 30 px per frame
      return {
        x: Math.random() * (width + 300) - 150,
        y: randomY ? Math.random() * height : -Math.random() * 80 - 20,
        vx: sinAngle * speed,
        vy: cosAngle * speed,
        length: Math.random() * 18 + 16,
        alpha: Math.random() * 0.45 + 0.35,
        thickness: Math.random() * 0.8 + 1.1,
        speed,
      };
    };

    // Initialize raindrops scattered across viewport
    for (let i = 0; i < dropCount; i++) {
      raindrops.push(createDrop(true));
    }

    const spawnSplash = (x: number, y: number, surfaceVx = 0) => {
      // 1. Splash micro-droplets bouncing upward and outward
      const particleCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 micro droplets
      for (let p = 0; p < particleCount; p++) {
        if (splashParticles.length > 200) break; // Limit pool
        splashParticles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4.2 + surfaceVx,
          vy: -(Math.random() * 3.6 + 1.4), // upward bounce!
          gravity: 0.22,
          size: Math.random() * 1.5 + 0.9,
          alpha: 0.75,
          decay: Math.random() * 0.035 + 0.035,
        });
      }

      // 2. Surface impact micro-ripple
      if (ripples.length < 80) {
        ripples.push({
          x,
          y,
          radius: 1,
          maxRadius: Math.random() * 5 + 4,
          alpha: 0.55,
          decay: 0.05,
        });
      }
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Surface Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.18 + 0.4;
        r.alpha -= r.decay;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        // Flattened ellipse for horizontal perspective
        ctx.ellipse(r.x, r.y, r.radius * 1.7, r.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(215, 235, 255, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw Falling Raindrops with Trajectory Collision
      ctx.lineCap = 'round';

      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        const prevX = drop.x;
        const prevY = drop.y;

        drop.x += drop.vx;
        drop.y += drop.vy;

        let collided = false;

        // Check collision against UI element surfaces (top edges)
        for (let s = 0; s < surfaces.length; s++) {
          const surface = surfaces[s];
          if (drop.x >= surface.left && drop.x <= surface.right) {
            // Did raindrop cross the top edge during this frame?
            if (prevY <= surface.top && drop.y >= surface.top) {
              collided = true;
              spawnSplash(drop.x, surface.top);
              // Reset drop to top of screen
              Object.assign(drop, createDrop(false));
              break;
            }
          }
        }

        // Check collision against bottom of viewport
        if (!collided && drop.y >= height - 2) {
          spawnSplash(drop.x, height - 2);
          Object.assign(drop, createDrop(false));
          continue;
        }

        // Off-screen horizontally or far below
        if (!collided && (drop.x < -100 || drop.x > width + 100 || drop.y > height + 60)) {
          Object.assign(drop, createDrop(false));
          continue;
        }

        // Draw raindrop streak
        if (!collided) {
          const tailX = drop.x - sinAngle * drop.length;
          const tailY = drop.y - cosAngle * drop.length;

          const gradient = ctx.createLinearGradient(tailX, tailY, drop.x, drop.y);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.65, `rgba(220, 240, 255, ${drop.alpha * 0.7})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${drop.alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(drop.x, drop.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = drop.thickness;
          ctx.stroke();
        }
      }

      // 3. Draw Bouncing Splash Droplets
      for (let i = splashParticles.length - 1; i >= 0; i--) {
        const p = splashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          splashParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 245, 255, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      clearInterval(surfaceInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full overflow-hidden"
    />
  );
};
