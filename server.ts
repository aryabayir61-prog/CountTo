import express from 'express';
import path from 'path';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const cache = new Map<string, string>();

const seedTracks: Record<string, { videoId: string | null; audioUrl?: string | null }> = {
  // Hileli - Manifest & Ajda Pekkan
  'hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli manifest': { videoId: 'kXKhNI4DLHM' },
  'manifest hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli ajda pekkan': { videoId: 'kXKhNI4DLHM' },
  'ajda pekkan hileli': { videoId: 'kXKhNI4DLHM' },
  'hileli manifest ajda pekkan': { videoId: 'kXKhNI4DLHM' },
  'manifest ajda pekkan hileli': { videoId: 'kXKhNI4DLHM' },

  // Ajda Pekkan
  'ajda pekkan arada sirada': { videoId: '5Vc6tvr9aRg' },
  'arada sirada ajda pekkan': { videoId: '5Vc6tvr9aRg' },
  'arada sirada': { videoId: '5Vc6tvr9aRg' },
  'ajda pekkan yakar gecerim': { videoId: 'Xpp_y2Os5Co' },
  'yakar gecerim ajda pekkan': { videoId: 'Xpp_y2Os5Co' },
  'yakar gecerim': { videoId: 'Xpp_y2Os5Co' },
  'ajda pekkan o benim dunyam': { videoId: 'aAPuhE7G58E' },
  'o benim dunyam ajda pekkan': { videoId: 'aAPuhE7G58E' },
  'ajda pekkan resim': { videoId: '6uCsExNeu88' },
  'resim ajda pekkan': { videoId: '6uCsExNeu88' },

  // Manifest
  'manifest tralala': { videoId: '0rW7Fbm4S7g' },
  'tralala manifest': { videoId: '0rW7Fbm4S7g' },
  'toz pembe manifest': { videoId: '0pg0raFMNIU' },
  'manifest toz pembe': { videoId: '0pg0raFMNIU' },

  // Popular Turkish & Global hits
  'askin olayim simge': { videoId: 'VREnTCTeS4k' },
  'simge askin olayim': { videoId: 'VREnTCTeS4k' },
  'antidepresan mert demir': { videoId: 'i6CSvLvSNZ4' },
  'mert demir antidepresan': { videoId: 'i6CSvLvSNZ4' },
  'antidepresan mert demir mabel matiz': { videoId: 'i6CSvLvSNZ4' },
  'atese dustum mert demir': { videoId: 'RQmXet6kZ-Y' },
  'mert demir atese dustum': { videoId: 'RQmXet6kZ-Y' },
  'sezen aksu vazgectim': { videoId: '83PXWOoucDU' },
  'vazgectim sezen aksu': { videoId: '83PXWOoucDU' },
  'tarkan kuzu kuzu': { videoId: 'NAHRpEqgcL4' },
  'kuzu kuzu tarkan': { videoId: 'NAHRpEqgcL4' },
  'tarkan simarik': { videoId: 'cpp69ghR1IM' },
  'simarik tarkan': { videoId: 'cpp69ghR1IM' },
  'ezhel geceler': { videoId: 'XokJGO8ALVs' },
  'geceler ezhel': { videoId: 'XokJGO8ALVs' },
  'birds of a feather billie eilish': { videoId: 'V9PVRfjEBTI' },
  'billie eilish birds of a feather': { videoId: 'V9PVRfjEBTI' },
  'runaway aurora': { videoId: 'd_HlPboLRL8' },
  'aurora runaway': { videoId: 'd_HlPboLRL8' },
  'as it was harry styles': { videoId: 'H5v3kku4y6Q' },
  'harry styles as it was': { videoId: 'H5v3kku4y6Q' },
  'taylor swift cruel summer': { videoId: 'ic8j13piAhQ' },
  'cruel summer taylor swift': { videoId: 'ic8j13piAhQ' },
  'the weeknd blinding lights': { videoId: 'fHI8X4OXluQ' },
  'blinding lights the weeknd': { videoId: 'fHI8X4OXluQ' },
  'starboy the weeknd': { videoId: '34Na4j8AVgA' },
  'the weeknd starboy': { videoId: '34Na4j8AVgA' },
  'fascist cerpow': { videoId: 'KR7QDK4saas' },
  'cerpow fascist': { videoId: 'KR7QDK4saas' },
};

function foldTurkish(str: string): string {
  return str
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&/\\#,+()$~%.'":*?<>{}\[\]|\-_!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTrackNoise(str: string): string {
  return str
    .replace(/\((?:feat|ft|with|featuring)[^)]*\)/gi, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s*-\s*(?:single|album|ep|remastered|radio edit|version).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSignificant(str: string): string[] {
  const folded = foldTurkish(stripTrackNoise(str));
  if (!folded) return [];
  const raw = folded.split(' ').filter(Boolean);
  const filtered = raw.filter(
    (w) => w.length >= 2 && !['feat', 'ft', 'the', 'and', 've', 'ile', 'official', 'audio', 'video'].includes(w)
  );
  return filtered.length > 0 ? filtered : raw;
}

function parseLengthToSeconds(lengthText?: string): number {
  if (!lengthText) return 0;
  const parts = lengthText.trim().split(':').map((n) => parseInt(n, 10));
  if (parts.some((n) => isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function extractYtInitialData(html: string): any | null {
  const markers = ['var ytInitialData = ', 'window["ytInitialData"] = '];
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx === -1) continue;
    const startBrace = html.indexOf('{', idx + marker.length);
    if (startBrace === -1) continue;

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startBrace; i < html.length; i++) {
      const ch = html[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(startBrace, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}

interface YouTubeCandidate {
  videoId: string;
  title: string;
  channel: string;
  lengthSec: number;
}

function collectYouTubeCandidates(root: any): YouTubeCandidate[] {
  const candidates: YouTubeCandidate[] = [];
  const seen = new Set<string>();

  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    if (node.adSlotRenderer || node.promotedSparklesWebRenderer || node.searchPyvRenderer) {
      return;
    }
    if (node.videoRenderer && typeof node.videoRenderer.videoId === 'string') {
      const vr = node.videoRenderer;
      const vid = vr.videoId;
      if (/^[a-zA-Z0-9_-]{11}$/.test(vid) && !seen.has(vid)) {
        seen.add(vid);
        const title =
          vr.title?.runs?.map((r: any) => r.text).join('') ||
          vr.title?.simpleText ||
          '';
        const channel =
          vr.ownerText?.runs?.map((r: any) => r.text).join('') ||
          vr.longBylineText?.runs?.map((r: any) => r.text).join('') ||
          '';
        const lengthText = vr.lengthText?.simpleText || '';
        const lengthSec = parseLengthToSeconds(lengthText);
        if (title) {
          candidates.push({ videoId: vid, title, channel, lengthSec });
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
    } else {
      for (const key of Object.keys(node)) walk(node[key]);
    }
  }

  walk(root);
  return candidates;
}

function scoreYouTubeCandidate(
  candidate: YouTubeCandidate,
  targetTitle: string,
  targetArtist: string,
  rawQuery: string
): number {
  const candTitle = foldTurkish(candidate.title);
  const candChannel = foldTurkish(candidate.channel);
  const candCombined = `${candTitle} ${candChannel}`;
  const reqCombined = foldTurkish(`${targetTitle} ${targetArtist} ${rawQuery}`);

  // Filter Shorts / livestreams / ultra-long mixes unless requested
  if (candidate.lengthSec === 0) return -100; // Live stream or non-standard
  if (candidate.lengthSec < 45) return -100; // Shorts / snippets
  if (candidate.lengthSec > 720 && !reqCombined.includes('mix') && !reqCombined.includes('konser')) {
    return -60;
  }

  let score = 0;

  const titleTokens = tokenizeSignificant(targetTitle || rawQuery);
  const artistTokens = tokenizeSignificant(targetArtist);

  if (titleTokens.length > 0) {
    const matchedTitle = titleTokens.filter((t) => candTitle.includes(t)).length;
    const titleRatio = matchedTitle / titleTokens.length;
    if (titleRatio === 0) return -100;
    if (titleRatio < 0.5) score -= 30;
    else score += titleRatio * 45;

    const cleanTitleFolded = foldTurkish(stripTrackNoise(targetTitle || rawQuery));
    if (cleanTitleFolded && candTitle.includes(cleanTitleFolded)) {
      score += 20;
    }
  }

  if (artistTokens.length > 0) {
    const matchedArtist = artistTokens.filter((a) => candCombined.includes(a)).length;
    const artistRatio = matchedArtist / artistTokens.length;
    if (artistRatio === 0) {
      // Wrong artist for a song name -> strongly reject!
      return -80;
    }
    score += artistRatio * 35;

    // Extra boost if channel itself is the artist / Topic / VEVO
    const channelArtistMatch = artistTokens.some((a) => candChannel.includes(a));
    if (channelArtistMatch) score += 16;
  }

  // Official / audio indicators
  if (
    candTitle.includes('official music video') ||
    candTitle.includes('official video') ||
    candTitle.includes('official audio') ||
    candChannel.includes('topic') ||
    candChannel.includes('vevo') ||
    candChannel.includes('netd muzik') ||
    candChannel.includes('dmc')
  ) {
    score += 12;
  }

  // Penalize covers, karaoke, remixes, slowed/reverb, reactions, live unless user asked for them
  const unwantedTags = [
    'cover',
    'karaoke',
    'reaction',
    'tepki',
    'slowed',
    'reverb',
    '8d',
    'nightcore',
    'instrumental',
    'enstrumantal',
    'remix',
    'parody',
    'parodi',
    'tutorial',
    'piano',
    'teaser',
    'fragman',
    'live',
    'canli',
    'akustik',
    'acoustic',
  ];
  for (const tag of unwantedTags) {
    if (candTitle.includes(tag) && !reqCombined.includes(tag)) {
      score -= 28;
    }
  }

  return score;
}

function searchYouTubeQuery(
  query: string,
  targetTitle: string,
  targetArtist: string
): Promise<string | null> {
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
          const initialData = extractYtInitialData(html);
          if (!initialData) {
            resolve(null);
            return;
          }
          const candidates = collectYouTubeCandidates(initialData);
          if (candidates.length === 0) {
            resolve(null);
            return;
          }

          let bestId: string | null = null;
          let bestScore = -Infinity;
          for (const cand of candidates.slice(0, 14)) {
            const sc = scoreYouTubeCandidate(cand, targetTitle, targetArtist, query);
            if (sc > bestScore) {
              bestScore = sc;
              bestId = cand.videoId;
            }
          }

          // Require confident match (>= 25) so unrelated tracks are never returned
          resolve(bestScore >= 25 ? bestId : null);
        });
      }
    );

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function fetchItunesFromCountry(query: string, country: string): Promise<any[]> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6&country=${country}`,
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(Array.isArray(data.results) ? data.results : []);
          } catch {
            resolve([]);
          }
        });
      }
    );
    req.on('error', () => resolve([]));
    req.setTimeout(3500, () => {
      req.destroy();
      resolve([]);
    });
  });
}

async function fetchItunesAudio(
  query: string,
  targetTitle: string,
  targetArtist: string
): Promise<string | null> {
  let results = await fetchItunesFromCountry(query, 'tr');
  if (results.length === 0) {
    results = await fetchItunesFromCountry(query, 'us');
  }
  if (results.length === 0) return null;

  const titleTokens = tokenizeSignificant(targetTitle || query);
  const artistTokens = tokenizeSignificant(targetArtist);

  let bestUrl: string | null = null;
  let bestScore = -Infinity;

  for (const r of results) {
    if (!r?.previewUrl) continue;
    const tName = foldTurkish(r.trackName || '');
    const aName = foldTurkish(r.artistName || '');
    let score = 0;

    if (titleTokens.length > 0) {
      const matched = titleTokens.filter((t) => tName.includes(t)).length;
      const ratio = matched / titleTokens.length;
      if (ratio < 0.5) continue;
      score += ratio * 50;
    }

    if (artistTokens.length > 0) {
      const matchedA = artistTokens.filter((a) => aName.includes(a)).length;
      if (matchedA === 0) continue;
      score += (matchedA / artistTokens.length) * 40;
    }

    if (score > bestScore) {
      bestScore = score;
      bestUrl = r.previewUrl;
    }
  }

  return bestUrl;
}

const memoryCache = new Map<string, { videoId: string | null; audioUrl?: string | null }>();

function normalizeQuery(q: string): string {
  return foldTurkish(q);
}

async function resolveYouTubeId(
  query: string,
  title: string = '',
  artist: string = ''
): Promise<{ videoId: string | null; audioUrl?: string | null }> {
  const cleanTitle = stripTrackNoise(title);
  const cleanArtist = artist.trim();
  const primaryQuery = cleanTitle && cleanArtist ? `${cleanTitle} ${cleanArtist}` : query;
  const cacheKey = normalizeQuery(`${primaryQuery}::${cleanTitle}::${cleanArtist}`);
  const seedKey = normalizeQuery(primaryQuery);
  const rawSeedKey = normalizeQuery(query);

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  if (seedTracks[seedKey]) {
    return seedTracks[seedKey];
  }
  if (seedTracks[rawSeedKey]) {
    return seedTracks[rawSeedKey];
  }

  // 1. Search YouTube with strict title + artist verification
  let videoId = await searchYouTubeQuery(primaryQuery, cleanTitle || query, cleanArtist);
  if (!videoId) {
    videoId = await searchYouTubeQuery(`${primaryQuery} official audio`, cleanTitle || query, cleanArtist);
  }
  if (!videoId && cleanTitle && cleanArtist && primaryQuery !== query) {
    videoId = await searchYouTubeQuery(query, cleanTitle, cleanArtist);
  }

  // 2. Fetch verified iTunes audio fallback
  let audioUrl: string | null = null;
  try {
    audioUrl = await fetchItunesAudio(primaryQuery, cleanTitle || query, cleanArtist);
  } catch {}

  const result = { videoId: videoId || null, audioUrl: audioUrl || null };
  if (videoId || audioUrl) {
    memoryCache.set(cacheKey, result);
  }

  return result;
}

// API to resolve any song to a YouTube videoId and audio stream
app.get('/api/resolve-track', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
  const artist = typeof req.query.artist === 'string' ? req.query.artist.trim() : '';
  if (!q && !title) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const result = await resolveYouTubeId(q || `${title} ${artist}`.trim(), title, artist);
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
