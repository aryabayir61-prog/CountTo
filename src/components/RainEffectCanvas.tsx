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
  isForeground: boolean;
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

interface GroundRipple {
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
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Surfaces that foreground rain can hit (strictly physical floating windows like sticky notes)
    let surfaces: SurfaceRect[] = [];

    const updateSurfaces = () => {
      // Query ONLY real physical floating cards (sticky notes, weather widgets)
      // Absolutely NEVER full-width containers, headers, or text elements!
      const elements = document.querySelectorAll(
        '.sticky-note-window, .weather-widget-window, .rain-bounce-target'
      );
      const newSurfaces: SurfaceRect[] = [];

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Strict physical validity: must be a compact floating card, not a wide layout box
        if (
          rect.width > 40 &&
          rect.height > 35 &&
          rect.width < width * 0.65 && // Cannot span more than 65% of screen width
          rect.top > 10 &&
          rect.top < height - 50 &&
          rect.bottom > 0
        ) {
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateSurfaces();
    };

    window.addEventListener('resize', handleResize);
    updateSurfaces();
    const surfaceInterval = setInterval(updateSurfaces, 800);

    // Raindrop physics configuration
    // Natural density: ~160-240 drops depending on viewport
    const dropCount = Math.min(240, Math.max(130, Math.floor((width * height) / 7500)));
    const raindrops: RainDrop[] = [];
    const splashParticles: SplashParticle[] = [];
    const groundRipples: GroundRipple[] = [];

    // Wind angle: gentle natural tilt (~4.5 degrees leftward)
    const windAngle = -0.08;
    const sinAngle = Math.sin(windAngle);
    const cosAngle = Math.cos(windAngle);

    const createDrop = (randomY = false): RainDrop => {
      const isForeground = Math.random() < 0.35; // 35% crisp foreground, 65% ambient background
      const baseSpeed = isForeground ? Math.random() * 8 + 24 : Math.random() * 8 + 18;

      return {
        x: Math.random() * (width + 350) - 175,
        y: randomY ? Math.random() * height : -Math.random() * 100 - 20,
        vx: sinAngle * baseSpeed,
        vy: cosAngle * baseSpeed,
        length: isForeground ? Math.random() * 16 + 22 : Math.random() * 12 + 15,
        alpha: isForeground ? Math.random() * 0.4 + 0.45 : Math.random() * 0.25 + 0.18,
        thickness: isForeground ? Math.random() * 0.6 + 1.2 : Math.random() * 0.4 + 0.8,
        speed: baseSpeed,
        isForeground,
      };
    };

    // Initialize raindrops scattered naturally across viewport
    for (let i = 0; i < dropCount; i++) {
      raindrops.push(createDrop(true));
    }

    // 1. Physical card impact: only 1-2 subtle micro mist droplets bouncing upward, NO ripples!
    const spawnCardSplash = (x: number, y: number) => {
      const particleCount = Math.floor(Math.random() * 2) + 1;
      for (let p = 0; p < particleCount; p++) {
        if (splashParticles.length > 120) break;
        splashParticles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3 - 0.3,
          vy: -(Math.random() * 2 + 1.2),
          gravity: 0.25,
          size: Math.random() * 1.0 + 0.6,
          alpha: 0.65,
          decay: Math.random() * 0.045 + 0.045,
        });
      }
    };

    // 2. Ground impact (bottom of screen only): water splash and expanding puddle ripple!
    const spawnGroundSplash = (x: number) => {
      const groundY = height - 2;

      // Ground bounce droplets
      const particleCount = Math.floor(Math.random() * 3) + 2;
      for (let p = 0; p < particleCount; p++) {
        if (splashParticles.length > 200) break;
        splashParticles.push({
          x,
          y: groundY,
          vx: (Math.random() - 0.5) * 4.2 - 0.4,
          vy: -(Math.random() * 3.2 + 1.4),
          gravity: 0.22,
          size: Math.random() * 1.4 + 0.8,
          alpha: 0.75,
          decay: Math.random() * 0.035 + 0.035,
        });
      }

      // Ground puddle ripple: STRICTLY on the floor (height - 2), NEVER in mid-air!
      if (groundRipples.length < 60) {
        groundRipples.push({
          x,
          y: groundY,
          radius: 1,
          maxRadius: Math.random() * 7 + 5,
          alpha: 0.45,
          decay: 0.035,
        });
      }
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Ground Puddle Ripples (Exclusively at viewport bottom!)
      for (let i = groundRipples.length - 1; i >= 0; i--) {
        const r = groundRipples[i];
        r.radius += (r.maxRadius - r.radius) * 0.16 + 0.35;
        r.alpha -= r.decay;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          groundRipples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        // Flattened horizontal perspective ellipse at bottom of screen
        ctx.ellipse(r.x, r.y, r.radius * 2.2, r.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(195, 230, 255, ${r.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw Falling Raindrops
      ctx.lineCap = 'round';

      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        const prevY = drop.y;

        drop.x += drop.vx;
        drop.y += drop.vy;

        let collided = false;

        // Foreground raindrops check collisions against real floating cards (sticky notes)
        if (drop.isForeground && surfaces.length > 0) {
          for (let s = 0; s < surfaces.length; s++) {
            const surface = surfaces[s];
            if (drop.x >= surface.left && drop.x <= surface.right) {
              if (prevY <= surface.top && drop.y >= surface.top) {
                collided = true;
                spawnCardSplash(drop.x, surface.top);
                Object.assign(drop, createDrop(false));
                break;
              }
            }
          }
        }

        // Collision with bottom of viewport (ground)
        if (!collided && drop.y >= height - 2) {
          spawnGroundSplash(drop.x);
          Object.assign(drop, createDrop(false));
          continue;
        }

        // Reset if drifted too far off-screen
        if (!collided && (drop.x < -120 || drop.x > width + 120 || drop.y > height + 50)) {
          Object.assign(drop, createDrop(false));
          continue;
        }

        // Draw raindrop streak with smooth gradient
        if (!collided) {
          const tailX = drop.x - sinAngle * drop.length;
          const tailY = drop.y - cosAngle * drop.length;

          const gradient = ctx.createLinearGradient(tailX, tailY, drop.x, drop.y);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.65, `rgba(215, 240, 255, ${drop.alpha * 0.6})`);
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
        ctx.fillStyle = `rgba(225, 242, 255, ${p.alpha})`;
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
