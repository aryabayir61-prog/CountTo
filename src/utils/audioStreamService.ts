import { SpotifyTrack } from '../types/music';

// Public distributed Piped & Invidious instances for watermark-free, ad-free raw audio streaming
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
  'https://pipedapi.leptons.xyz',
  'https://pipedapi.tokhmi.xyz',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.nadeko.net',
  'https://invidious.jing.rocks',
];

// In-memory cache for resolved audio stream URLs to minimize latency
const streamCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Extracts YouTube video ID from various URL formats or returns the raw ID if already 11 chars.
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, music.youtube.com/watch?v=ID
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

/**
 * Resolves a direct .mp3 / .m4a / .webm audio stream URL for a YouTube video
 * using Piped and Invidious API instances without ads or watermarks.
 */
export async function resolveAudioStream(youtubeId: string): Promise<string | null> {
  const cached = streamCache.get(youtubeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.url;
  }

  // 1. Try Piped Instances
  for (const instance of PIPED_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${instance}/streams/${youtubeId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data.audioStreams) && data.audioStreams.length > 0) {
        // Prefer m4a/mp4 audio for highest universal browser compatibility, fallback to webm
        const audioStream =
          data.audioStreams.find((s: { mimeType?: string; url?: string }) =>
            s.mimeType?.includes('audio/mp4') || s.mimeType?.includes('audio/m4a')
          ) ||
          data.audioStreams.find((s: { mimeType?: string; url?: string }) =>
            s.mimeType?.includes('audio/webm')
          ) ||
          data.audioStreams[0];

        if (audioStream?.url) {
          streamCache.set(youtubeId, { url: audioStream.url, timestamp: Date.now() });
          return audioStream.url;
        }
      }
    } catch {
      // Instance failed or timed out, gracefully continue to next
    }
  }

  // 2. Fallback to Invidious Instances
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${instance}/api/v1/videos/${youtubeId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data.adaptiveFormats)) {
        const audioStream = data.adaptiveFormats.find(
          (f: { type?: string; url?: string }) => f.type?.includes('audio') && f.url
        );
        if (audioStream?.url) {
          streamCache.set(youtubeId, { url: audioStream.url, timestamp: Date.now() });
          return audioStream.url;
        }
      }
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Live search on YouTube / Piped API for any song query.
 */
export async function searchYouTubeMusic(query: string): Promise<SpotifyTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // If user pasted a direct YouTube link, create a track immediately
  const directId = extractYouTubeId(trimmed);
  if (directId) {
    return [
      {
        id: `yt-${directId}`,
        name: 'YouTube Müzik Akışı',
        artist: 'Özel Akış',
        album: 'YouTube Audio',
        albumCover: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
        durationMs: 180000,
        youtubeId: directId,
        spotifyUri: `youtube:${directId}`,
        spotifyUrl: `https://youtube.com/watch?v=${directId}`,
        genre: 'lofi',
        energy: 'focus',
        popularity: 90,
      },
    ];
  }

  for (const instance of PIPED_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${instance}/search?q=${encodeURIComponent(trimmed)}&filter=music_songs`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data.items)) {
        const tracks: SpotifyTrack[] = data.items
          .filter((item: { url?: string; title?: string }) => item.url && item.title)
          .slice(0, 15)
          .map((item: { url: string; title: string; uploaderName?: string; thumbnail?: string; duration?: number }) => {
            const videoId = item.url.replace('/watch?v=', '').split('&')[0];
            return {
              id: `yt-${videoId}`,
              name: item.title,
              artist: item.uploaderName || 'Sanatçı',
              album: 'Single',
              albumCover: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              durationMs: (item.duration || 180) * 1000,
              youtubeId: videoId,
              spotifyUri: `youtube:${videoId}`,
              spotifyUrl: `https://youtube.com/watch?v=${videoId}`,
              genre: 'lofi',
              energy: 'focus',
              popularity: 85,
            };
          });

        if (tracks.length > 0) {
          return tracks;
        }
      }
    } catch {
      // Continue to next instance
    }
  }

  return [];
}
