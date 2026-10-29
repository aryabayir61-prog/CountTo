// Real-time Dynamic Album Cover Color Extractor with Caching & Samping
const colorCache = new Map<string, [string, string]>();

// Predefined verified color palettes for fast instant fallback
const KNOWN_ALBUM_PALETTES: Record<string, [string, string]> = {
  'hileli': ['#dc2626', '#991b1b'], // Vivid red dice
  'manifest & ajda pekkan': ['#dc2626', '#991b1b'],
  'ajda pekkan & manifest': ['#dc2626', '#991b1b'],
  'tralala': ['#6b21a8', '#c026d3'],
  'toz pembe': ['#9f1239', '#f43f5e'],
  'birds of a feather': ['#0c2a5e', '#1d4ed8'],
  'runaway': ['#064e3b', '#10b981'],
  'as it was': ['#7c2d12', '#ea580c'],
  'askin olayim': ['#881337', '#e11d48'],
  'antidepresan': ['#4c1d95', '#a855f7'],
  'fascist': ['#9a3412', '#ea580c'],
  'arada sirada': ['#9d174d', '#f43f5e'],
  'yakar gecerim': ['#991b1b', '#f43f5e'],
  'cruel summer': ['#ec4899', '#f43f5e'],
  'blinding lights': ['#c2410c', '#e11d48'],
};

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Extracts 2 vibrant dominant ambient colors from any album artwork image url.
 * Uses an offscreen 24x24 canvas to sample hue & saturation, with CORS fallback.
 */
export async function extractAlbumColors(
  imageUrl: string,
  trackName: string = ''
): Promise<[string, string]> {
  const cleanTitle = (trackName || '').toLowerCase().trim();

  // 1. Check known album titles for instant 0ms matching
  for (const [k, colors] of Object.entries(KNOWN_ALBUM_PALETTES)) {
    if (cleanTitle.includes(k) || k.includes(cleanTitle)) {
      return colors;
    }
  }

  if (!imageUrl) return ['#4a0e4e', '#c026d3'];

  const cacheKey = imageUrl;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return ['#4a0e4e', '#c026d3'];
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = (): [string, string] => {
      // Color fallback based on title hash for rich consistent vibrant aura
      let hash = 0;
      for (let i = 0; i < cleanTitle.length; i++) {
        hash = cleanTitle.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue1 = Math.abs(hash % 360);
      const hue2 = (hue1 + 35) % 360;
      return [
        `hsl(${hue1}, 80%, 30%)`,
        `hsl(${hue2}, 90%, 45%)`
      ];
    };

    const timer = setTimeout(() => {
      const fb = fallback();
      colorCache.set(cacheKey, fb);
      resolve(fb);
    }, 1200);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          const fb = fallback();
          colorCache.set(cacheKey, fb);
          resolve(fb);
          return;
        }

        ctx.drawImage(img, 0, 0, 24, 24);
        const imgData = ctx.getImageData(0, 0, 24, 24).data;

        let primaryR = 0, primaryG = 0, primaryB = 0;
        let secondaryR = 0, secondaryG = 0, secondaryB = 0;
        let maxSaturation = -1;
        let secondSaturation = -1;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const brightness = (r + g + b) / 3;

          // Ignore extreme blacks and extreme whites
          if (brightness < 25 || brightness > 240) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          if (sat > maxSaturation) {
            secondSaturation = maxSaturation;
            secondaryR = primaryR;
            secondaryG = primaryG;
            secondaryB = primaryB;

            maxSaturation = sat;
            primaryR = r;
            primaryG = g;
            primaryB = b;
          } else if (sat > secondSaturation) {
            secondSaturation = sat;
            secondaryR = r;
            secondaryG = g;
            secondaryB = b;
          }
        }

        if (maxSaturation > 0.15) {
          const color1 = rgbToHex(primaryR, primaryG, primaryB);
          const color2 = secondSaturation > 0.1
            ? rgbToHex(secondaryR, secondaryG, secondaryB)
            : rgbToHex(primaryR * 0.7, primaryG * 0.7, primaryB * 0.7);

          const result: [string, string] = [color1, color2];
          colorCache.set(cacheKey, result);
          resolve(result);
          return;
        }

        const fb = fallback();
        colorCache.set(cacheKey, fb);
        resolve(fb);
      } catch {
        const fb = fallback();
        colorCache.set(cacheKey, fb);
        resolve(fb);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      const fb = fallback();
      colorCache.set(cacheKey, fb);
      resolve(fb);
    };

    img.src = imageUrl;
  });
}
