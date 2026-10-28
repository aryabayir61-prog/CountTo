import express from 'express';
import path from 'path';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const cache = new Map<string, string>();

// Instant 0ms cache for popular Turkish & Global tracks
const seedTracks: Record<string, { videoId: string | null; audioUrl?: string | null }> = {
  'ajda pekkan arada sirada': { videoId: 'g2cT_Kz43m4' },
  'arada sirada ajda pekkan': { videoId: 'g2cT_Kz43m4' },
  'arada sirada': { videoId: 'g2cT_Kz43m4' },
  'ajda pekkan yakar gecerim': { videoId: '9vU6B9qE1fA' },
  'yakar gecerim ajda pekkan': { videoId: '9vU6B9qE1fA' },
  'yakar gecerim': { videoId: '9vU6B9qE1fA' },
  'ajda pekkan': { videoId: 'g2cT_Kz43m4' },
  'ajda pekkan o benim dunyam': { videoId: 'c1oH1tHn8fI' },
  'manifest tralala': { videoId: '0rW7Fbm4S7g' },
  'tralala manifest': { videoId: '0rW7Fbm4S7g' },
  'toz pembe nalan': { videoId: '0pg0raFMNIU' },
  'toz pembe manifest': { videoId: '0pg0raFMNIU' },
  'toz pembe': { videoId: '0pg0raFMNIU' },
  'askin olayim simge': { videoId: 'VREnTCTeS4k' },
  'simge askin olayim': { videoId: 'VREnTCTeS4k' },
  'antidepresan mert demir': { videoId: 'i6CSvLvSNZ4' },
  'mert demir antidepresan': { videoId: 'i6CSvLvSNZ4' },
  'atese dustum mert demir': { videoId: 'xP89mCq741U' },
  'mert demir atese dustum': { videoId: 'xP89mCq741U' },
  'sezen aksu vazgectim': { videoId: 'a_4_O-823qE' },
  'tarkan kuzu kuzu': { videoId: '1f32qfJgqQY' },
  'tarkan simarik': { videoId: 'yDq1nB5y2G4' },
  'birds of a feather billie eilish': { videoId: 'V9PVRfjEBTI' },
  'billie eilish birds of a feather': { videoId: 'V9PVRfjEBTI' },
  'runaway aurora': { videoId: 'd_HlPboLRL8' },
  'aurora runaway': { videoId: 'd_HlPboLRL8' },
  'as it was harry styles': { videoId: 'H5v3kku4y6Q' },
  'harry styles as it was': { videoId: 'H5v3kku4y6Q' },
  'taylor swift cruel summer': { videoId: 'ic8j13piAhQ' },
  'the weeknd blinding lights': { videoId: 'fHI8X4OXluQ' },
  'fascist cerpow': { videoId: 'KR7QDK4saas' },
  'cerpow fascist': { videoId: 'KR7QDK4saas' },
};

function searchYouTubeQuery(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        let html = '';
        res.on('data', (c) => (html += c));
        res.on('end', () => {
          const patterns = [
            /"videoId":"([a-zA-Z0-9_-]{11})"/,
            /watchEndpoint":\{"videoId":"([a-zA-Z0-9_-]{11})"/,
            /\/watch\?v=([a-zA-Z0-9_-]{11})/,
          ];

          for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
              resolve(match[1]);
              return;
            }
          }
          resolve(null);
        });
      }
    );

    req.on('error', () => resolve(null));
    req.setTimeout(4500, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function fetchItunesAudio(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`,
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.results && data.results[0] && data.results[0].previewUrl) {
              resolve(data.results[0].previewUrl);
              return;
            }
          } catch {}
          resolve(null);
        });
      }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(3500, () => {
      req.destroy();
      resolve(null);
    });
  });
}

const memoryCache = new Map<string, { videoId: string | null; audioUrl?: string | null }>();

async function resolveYouTubeId(query: string): Promise<{ videoId: string | null; audioUrl?: string | null }> {
  const cleanQ = query.trim().toLowerCase();
  if (memoryCache.has(cleanQ)) {
    return memoryCache.get(cleanQ)!;
  }

  if (seedTracks[cleanQ]) {
    return seedTracks[cleanQ];
  }

  for (const [k, v] of Object.entries(seedTracks)) {
    if (cleanQ.includes(k) || k.includes(cleanQ)) {
      memoryCache.set(cleanQ, v);
      return v;
    }
  }

  // 1. Search YouTube
  let videoId = await searchYouTubeQuery(query);
  if (!videoId) {
    videoId = await searchYouTubeQuery(`${query} audio`);
  }

  // 2. Fetch iTunes audio fallback
  let audioUrl: string | null = null;
  try {
    audioUrl = await fetchItunesAudio(query);
  } catch {}

  const result = { videoId: videoId || null, audioUrl: audioUrl || null };
  if (videoId || audioUrl) {
    memoryCache.set(cleanQ, result);
  }

  return result;
}

// API to resolve any song to a YouTube videoId and audio stream
app.get('/api/resolve-track', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const result = await resolveYouTubeId(q);
    return res.json(result);
  } catch {
    return res.json({ videoId: null, audioUrl: null });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
