import express from 'express';
import path from 'path';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const cache = new Map<string, string>();

// Preload known tracks for instantaneous 0ms resolution
cache.set('manifest tralala', '0rW7Fbm4S7g');
cache.set('tralala manifest', '0rW7Fbm4S7g');
cache.set('toz pembe nalan', '0pg0raFMNIU');
cache.set('toz pembe manifest', '0pg0raFMNIU');
cache.set('toz pembe', '0pg0raFMNIU');
cache.set('birds of a feather billie eilish', 'V9PVRfjEBTI');
cache.set('billie eilish birds of a feather', 'V9PVRfjEBTI');
cache.set('runaway aurora', 'd_HlPboLRL8');
cache.set('aurora runaway', 'd_HlPboLRL8');
cache.set('as it was harry styles', 'H5v3kku4y6Q');
cache.set('harry styles as it was', 'H5v3kku4y6Q');
cache.set('askin olayim simge', 'VREnTCTeS4k');
cache.set('simge askin olayim', 'VREnTCTeS4k');
cache.set('antidepresan mert demir', 'i6CSvLvSNZ4');
cache.set('mert demir antidepresan', 'i6CSvLvSNZ4');
cache.set('fascist cerpow', 'KR7QDK4saas');
cache.set('cerpow fascist', 'KR7QDK4saas');
cache.set('taylor swift cruel summer', 'ic8j13piAhQ');
cache.set('the weeknd blinding lights', 'fHI8X4OXluQ');

function searchYouTubeQuery(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        let html = '';
        res.on('data', (c) => (html += c));
        res.on('end', () => {
          // Robust modern YouTube patterns
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

async function resolveYouTubeId(query: string): Promise<string | null> {
  const cleanQ = query.trim().toLowerCase();
  if (cache.has(cleanQ)) {
    return cache.get(cleanQ)!;
  }

  // 1. First attempt: exact query
  let videoId = await searchYouTubeQuery(query);

  // 2. Second attempt if needed: query + " audio"
  if (!videoId) {
    videoId = await searchYouTubeQuery(`${query} audio`);
  }

  if (videoId) {
    cache.set(cleanQ, videoId);
    return videoId;
  }

  return null;
}

// API to resolve any song to a YouTube videoId
app.get('/api/resolve-track', async (req, res) => {
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const videoId = await resolveYouTubeId(q);
    return res.json({ videoId: videoId || null });
  } catch {
    return res.json({ videoId: null });
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
