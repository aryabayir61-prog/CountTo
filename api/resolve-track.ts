import https from 'https';

interface ResolvedTrack {
  videoId: string | null;
  audioUrl?: string | null;
}

const cache = new Map<string, ResolvedTrack>();

// Curated verified full-song IDs (artist + song title specific only, never bare artist names)
const seedTracks: Record<string, ResolvedTrack> = {
  // Hileli - Manifest & Ajda Pekkan
  'hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli manifest': { videoId: 'kXKhNI4DLHM' },
  'manifest hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli ajda pekkan': { videoId: 'kXKhNI4DLHM' },
  'ajda pekkan hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli manifest ajda pekkan': { videoId: 'kXKhNI4DLHM' },
  'manifest ajda pekkan hileli': { videoId: 'kXKhNI4DLHM' },

  // Gece Vardiyası
  'gece vardiyasi': { videoId: 'OcwZmh_6ORU' },
  'gece vardiyasi rashness': { videoId: 'OcwZmh_6ORU' },
  'rashness gece vardiyasi': { videoId: 'OcwZmh_6ORU' },
  'gece vardiyasi mavra': { videoId: '0DK7TRoauLU' },
  'mavra gece vardiyasi': { videoId: '0DK7TRoauLU' },
  'gece vardiyasi gelmedin': { videoId: 'J4h4jJ07jPQ' },

  // Ajda Pekkan Hits
  'ajda pekkan arada sirada': { videoId: 'g2cT_Kz43m4' },
  'arada sirada ajda pekkan': { videoId: 'g2cT_Kz43m4' },
  'arada sirada': { videoId: 'g2cT_Kz43m4' },
  'ajda pekkan yakar gecerim': { videoId: '9vU6B9qE1fA' },
  'yakar gecerim ajda pekkan': { videoId: '9vU6B9qE1fA' },
  'yakar gecerim': { videoId: '9vU6B9qE1fA' },
  'ajda pekkan o benim dunyam': { videoId: 'c1oH1tHn8fI' },
  'ajda pekkan resim': { videoId: '2bI3C5L8M5k' },

  // Turkish Hits
  'manifest tralala': { videoId: '0rW7Fbm4S7g' },
  'tralala manifest': { videoId: '0rW7Fbm4S7g' },
  'tralala': { videoId: '0rW7Fbm4S7g' },
  'toz pembe nalan': { videoId: '0pg0raFMNIU' },
  'toz pembe manifest': { videoId: '0pg0raFMNIU' },
  'toz pembe': { videoId: '0pg0raFMNIU' },
  'askin olayim simge': { videoId: 'VREnTCTeS4k' },
  'simge askin olayim': { videoId: 'VREnTCTeS4k' },
  'askin olayim': { videoId: 'VREnTCTeS4k' },
  'antidepresan mert demir': { videoId: 'i6CSvLvSNZ4' },
  'mert demir antidepresan': { videoId: 'i6CSvLvSNZ4' },
  'antidepresan': { videoId: 'i6CSvLvSNZ4' },
  'atese dustum mert demir': { videoId: 'xP89mCq741U' },
  'mert demir atese dustum': { videoId: 'xP89mCq741U' },
  'sezen aksu vazgectim': { videoId: 'a_4_O-823qE' },
  'vazgectim sezen aksu': { videoId: 'a_4_O-823qE' },
  'tarkan kuzu kuzu': { videoId: '1f32qfJgqQY' },
  'tarkan simarik': { videoId: 'yDq1nB5y2G4' },
  'ezhel geceler': { videoId: 'U2hF6y1V0nE' },
  'blok3 aklimi tutamam': { videoId: 'Jg7R6h-Q9i0' },

  // Global Hits
  'birds of a feather billie eilish': { videoId: 'V9PVRfjEBTI' },
  'billie eilish birds of a feather': { videoId: 'V9PVRfjEBTI' },
  'birds of a feather': { videoId: 'V9PVRfjEBTI' },
  'runaway aurora': { videoId: 'd_HlPboLRL8' },
  'aurora runaway': { videoId: 'd_HlPboLRL8' },
  'runaway': { videoId: 'd_HlPboLRL8' },
  'as it was harry styles': { videoId: 'H5v3kku4y6Q' },
  'harry styles as it was': { videoId: 'H5v3kku4y6Q' },
  'as it was': { videoId: 'H5v3kku4y6Q' },
  'taylor swift cruel summer': { videoId: 'ic8j13piAhQ' },
  'cruel summer taylor swift': { videoId: 'ic8j13piAhQ' },
  'cruel summer': { videoId: 'ic8j13piAhQ' },
  'the weeknd blinding lights': { videoId: 'fHI8X4OXluQ' },
  'blinding lights the weeknd': { videoId: 'fHI8X4OXluQ' },
  'blinding lights': { videoId: 'fHI8X4OXluQ' },
  'starboy the weeknd': { videoId: '34Na4j8AVgA' },
  'fascist cerpow': { videoId: 'KR7QDK4saas' },
  'cerpow fascist': { videoId: 'KR7QDK4saas' },
  'fascist': { videoId: 'KR7QDK4saas' },
};

for (const [key, val] of Object.entries(seedTracks)) {
  cache.set(key.toLowerCase().trim(), val);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchYouTube(query: string): Promise<string | null> {
  const cleanQ = normalizeText(query);
  return new Promise((resolve) => {
    const req = https.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}`,
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

async function resolveTrack(query: string): Promise<ResolvedTrack> {
  const cleanQ = normalizeText(query);

  // 1. Direct memory seed match (exact key)
  if (cache.has(cleanQ)) {
    return cache.get(cleanQ)!;
  }

  // 2. Real-time YouTube search for full video
  let videoId = await searchYouTube(query);
  if (!videoId) {
    videoId = await searchYouTube(`${query} official audio`);
  }
  if (!videoId) {
    videoId = await searchYouTube(`${query} music video`);
  }

  // 3. Fallback audio
  let audioUrl: string | null = null;
  try {
    audioUrl = await fetchItunesAudio(query);
  } catch {}

  const result: ResolvedTrack = { videoId: videoId || null, audioUrl: audioUrl || null };
  if (videoId) {
    cache.set(cleanQ, result);
  }

  return result;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const query = (req.query?.q || '') as string;
  if (!query) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const result = await resolveTrack(query);
    return res.status(200).json(result);
  } catch {
    return res.status(200).json({ videoId: null, audioUrl: null });
  }
}
