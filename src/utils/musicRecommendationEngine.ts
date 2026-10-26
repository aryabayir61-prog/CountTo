import { SongTrack, PRESET_SONGS } from './musicAudioEngine';
import { SpotifyTrack, RecommendationResult } from '../types/music';

const STORAGE_PROFILE_KEY = 'contto_music_profile_v2';
const STORAGE_FAVS_KEY = 'countto_favorite_tracks';

export interface UserMusicProfile {
  totalListens: number;
  artistScores: Record<string, number>;
  albumScores: Record<string, number>;
  recentTrackIds: string[];
  dynamicRecommendations: SongTrack[];
  lastUpdated: number;
}

const DEFAULT_PROFILE: UserMusicProfile = {
  totalListens: 0,
  artistScores: {},
  albumScores: {},
  recentTrackIds: [],
  dynamicRecommendations: [],
  lastUpdated: 0,
};

// Curated artist discovery graph for intelligent algorithmic expansion
const ARTIST_DISCOVERY_GRAPH: Record<string, string[]> = {
  manifest: ['Selin', 'Güneş', 'Alizade', 'Edis'],
  'billie eilish': ['Olivia Rodrigo', 'Lorde', 'Finneas', 'Gracie Abrams'],
  aurora: ['Florence + The Machine', 'Lorde', 'Marina', 'Susanne Sundfør'],
  'harry styles': ['Zayn', 'Niall Horan', 'Shawn Mendes', 'The 1975'],
  simge: ['Derya Uluğ', 'Ece Seçkin', 'İrem Derici', 'Hande Yener'],
  'mert demir': ['Mabel Matiz', 'Melike Şahin', 'KÖFN', 'Madrigal'],
  nalan: ['Hande Yener', 'Demet Akalın', 'Gülşen', 'Tarkan'],
  cerpow: ['Deftones', 'Crystal Castles', 'Mareux', 'Boy Harsher'],
};

/**
 * Determines current time of day context (Sabah, Öğlen, Akşam, Gece)
 */
export function getTimeOfDayContext(): {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  vibeQueries: string[];
} {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    // Sabah: Ferah, tazeleyici, yumuşak akustik & pop
    return {
      period: 'morning',
      vibeQueries: ['Harry Styles', 'Billie Eilish', 'Simge'],
    };
  } else if (hour >= 12 && hour < 18) {
    // Öğlen: Yüksek odaklanma, hareketli çalışma ritimleri, dinamik pop
    return {
      period: 'afternoon',
      vibeQueries: ['Manifest', 'Dua Lipa', 'KÖFN', 'Edis'],
    };
  } else if (hour >= 18 && hour < 23) {
    // Akşam: Duygusal, dinlendirici akşam melodileri
    return {
      period: 'evening',
      vibeQueries: ['Mert Demir', 'AURORA', 'Nalan Toz Pembe', 'Melike Şahin'],
    };
  } else {
    // Gece: Derin lo-fi, sakin ambient melodiler
    return {
      period: 'night',
      vibeQueries: ['Lofi Chill Study', 'Billie Eilish', 'Madrigal'],
    };
  }
}

export function getUserProfile(): UserMusicProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore parse error
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserMusicProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage limit
  }
}

/**
 * Record a listen event and trigger the algorithmic recommendation refresh
 */
export async function recordSongListen(track: SongTrack): Promise<SongTrack[]> {
  const profile = getUserProfile();

  profile.totalListens += 1;
  const artistKey = track.artist.toLowerCase().trim();
  profile.artistScores[artistKey] = (profile.artistScores[artistKey] || 0) + 5;

  const trackKey = track.name.toLowerCase().trim();
  profile.albumScores[trackKey] = (profile.albumScores[trackKey] || 0) + 3;

  // Keep last 15 tracks
  profile.recentTrackIds = [track.id, ...profile.recentTrackIds.filter((id) => id !== track.id)].slice(0, 15);

  // Compute new recommendations factoring in artist, track history, and current time-of-day
  const newRecs = await generateAlgorithmicRecommendations(profile, track);
  profile.dynamicRecommendations = newRecs;
  profile.lastUpdated = Date.now();

  saveUserProfile(profile);
  return newRecs;
}

/**
 * Generates intelligent recommendations based on:
 * 1. User listening history & artist affinity
 * 2. Time-of-day context (morning, afternoon, evening, night)
 * 3. Related discovery graph
 */
export async function generateAlgorithmicRecommendations(
  profile: UserMusicProfile,
  currentTrack?: SongTrack
): Promise<SongTrack[]> {
  const timeContext = getTimeOfDayContext();

  const topArtists = Object.entries(profile.artistScores)
    .sort(([, a], [, b]) => b - a)
    .map(([artist]) => artist);

  const primaryArtist = currentTrack
    ? currentTrack.artist.toLowerCase()
    : topArtists[0] || timeContext.vibeQueries[0].toLowerCase();

  const relatedArtists = ARTIST_DISCOVERY_GRAPH[primaryArtist] || [];
  
  // Blend primary artist with related artists and time-of-day vibe queries
  const searchTerms = [
    primaryArtist,
    ...(relatedArtists.slice(0, 1)),
    ...(timeContext.vibeQueries.slice(0, 1)),
  ];

  const fetchedTracks: SongTrack[] = [];

  for (const term of searchTerms) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=4&country=tr`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const item of data.results) {
          const id = `online-${item.trackId}`;
          if (profile.recentTrackIds.includes(id) || fetchedTracks.some((t) => t.id === id)) {
            continue;
          }

          fetchedTracks.push({
            id,
            name: item.trackName,
            artist: item.artistName,
            albumCover: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
            colors: currentTrack?.colors || ['#1e1b4b', '#4338ca'],
            youtubeId: '',
            durationSec: Math.floor((item.trackTimeMillis || 180000) / 1000),
          });

          if (fetchedTracks.length >= 8) break;
        }
      }
    } catch {
      // Ignore network errors
    }
    if (fetchedTracks.length >= 8) break;
  }

  // Combine with presets to guarantee an authentic, rich playlist
  const blended: SongTrack[] = [...fetchedTracks];
  for (const preset of PRESET_SONGS) {
    if (!blended.some((b) => b.name.toLowerCase() === preset.name.toLowerCase())) {
      blended.push(preset);
    }
  }

  return blended.slice(0, 9);
}

// Backward-compatible exports for existing views
export function isFavoriteTrack(trackOrId: SpotifyTrack | string): boolean {
  if (typeof window === 'undefined') return false;
  const trackId = typeof trackOrId === 'string' ? trackOrId : trackOrId.id;
  try {
    const raw = localStorage.getItem(STORAGE_FAVS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.includes(trackId);
    }
  } catch {}
  return false;
}

export function toggleFavoriteTrack(trackOrId: SpotifyTrack | string): boolean {
  if (typeof window === 'undefined') return false;
  const trackId = typeof trackOrId === 'string' ? trackOrId : trackOrId.id;
  try {
    const raw = localStorage.getItem(STORAGE_FAVS_KEY);
    let arr: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) arr = [];
    const exists = arr.includes(trackId);
    if (exists) {
      arr = arr.filter((id) => id !== trackId);
    } else {
      arr.push(trackId);
    }
    localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(arr));
    return !exists;
  } catch {}
  return false;
}

export function recordTrackListen(track: SpotifyTrack): void {
  recordSongListen({
    id: track.id,
    name: track.name,
    artist: track.artist,
    albumCover: track.albumCover,
    colors: ['#1e1b4b', '#4338ca'],
    youtubeId: track.youtubeId || '',
    durationSec: Math.floor(track.durationMs / 1000),
  });
}

export function getPersonalizedRecommendations(
  allTracks: SpotifyTrack[],
  limit: number = 6
): RecommendationResult[] {
  const profile = getUserProfile();
  return allTracks.slice(0, limit).map((track) => ({
    track,
    matchPercentage: Math.min(99, 78 + ((profile.artistScores[track.artist.toLowerCase()] || 0) * 4)),
    reason: 'CountTo Müzik Önerisi',
  }));
}
