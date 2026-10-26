import express from 'express';
import path from 'path';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const cache = new Map<string, string>();

// Preload known tracks for instantaneous resolution
cache.set('manifest tralala', '0rW7Fbm4S7g');
cache.set('tralala manifest', '0rW7Fbm4S7g');
cache.set('toz pembe', '0pg0raFMNIU');
cache.set('toz pembe nalan', 'dNnA4SdJ_5U');
cache.set('birds of a feather billie eilish', 'V9PVRfjEBTI');
cache.set('runaway aurora', 'd_HlPboLRL8');
cache.set('as it was harry styles', 'H5v3kku4y6Q');
cache.set('askin olayim simge', 'VREnTCTeS4k');
cache.set('antidepresan mert demir', 'i6CSvLvSNZ4');

function resolveYouTubeId(query: string): Promise<string | null> {
  const cleanQ = query.trim().toLowerCase();
  if (cache.has(cleanQ)) {
    return Promise.resolve(cache.get(cleanQ)!);
  }

  return new Promise((resolve) => {
    https
      .get(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        },
        (res) => {
          let html = '';
          res.on('data', (c) => (html += c));
          res.on('end', () => {
            const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
            if (match && match[1]) {
              cache.set(cleanQ, match[1]);
              resolve(match[1]);
            } else {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => resolve(null));
  });
}

// API to resolve any song to a YouTube videoId
app.get('/api/resolve-track', async (req, res) => {
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const videoId = await resolveYouTubeId(q);
    return res.json({ videoId: videoId || '0rW7Fbm4S7g' });
  } catch {
    return res.json({ videoId: '0rW7Fbm4S7g' });
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
