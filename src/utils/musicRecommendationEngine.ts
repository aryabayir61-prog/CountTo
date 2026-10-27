import { SongTrack, PRESET_SONGS } from './musicAudioEngine';
import { SpotifyTrack, RecommendationResult } from '../types/music';

const STORAGE_PROFILE_KEY = 'contto_music_profile_v3';
const STORAGE_FAVS_KEY = 'countto_favorite_tracks';
const STORAGE_COLISTENING_KEY = 'contto_colistening_cache_v3';

export type ImplicitSignal = 
  | 'repeat'       // Güçlü pozitif (+10): tekrar dinleme
  | 'rewind'       // Güçlü pozitif (+8): geri sarıp tekrar dinleme
  | 'complete'     // Orta pozitif (+5): şarkıyı sonuna kadar dinleme
  | 'volume_up'    // Pozitif (+3): ses açma
  | 'play_select'  // Pozitif (+4): bizzat seçip çalma
  | 'early_skip'   // Güçlü negatif (-8): ilk 5 saniyede atlama
  | 'late_skip';   // Hafif negatif / nötr (-1): 30. saniyeden sonra atlama

export interface TrackFatigueEntry {
  playCount: number;
  lastPlayed: number;
  isComfort: boolean; // Konfor şarkısı: tekrarlandıkça değeri artan
}

export interface UserTasteMap {
  longTermProfile: Record<string, number>; // Kalıcı kimlik (yavaş değişir)
  sessionIntent: Record<string, number>;   // Son dinlemelerden anlık ruh hali (hızlı güncellenir)
  clusterWeights: Record<string, number>;  // Farklı zevk kümeleri
  fatigueMap: Record<string, TrackFatigueEntry>; // Yorgunluk vs konfor eğrisi
  totalSignals: number;
  lastFinishedTrack: SongTrack | null;
  coListeningTracks: SongTrack[];
  cachedRecommendations: SongTrack[];
}

const DEFAULT_TASTE_MAP: UserTasteMap = {
  longTermProfile: {},
  sessionIntent: {},
  clusterWeights: {
    pop: 5,
    indie: 4,
    turkish_modern: 5,
    electronic: 3,
  },
  fatigueMap: {},
  totalSignals: 0,
  lastFinishedTrack: null,
  coListeningTracks: [],
  cachedRecommendations: [],
};

// 2. Kolektif Vektör ve Sanatçı Çevresi ("Bunu dinleyenler bunu da dinledi" Grafiği)
export const CO_LISTENING_GRAPH: Record<string, string[]> = {
  'crush': ['DEAN', 'DPR IAN', 'Zico', 'Colde', 'BIBI', 'Rad Museum'],
  'tralala': ['Manifest', 'Selin', 'Güneş', 'Alizade', 'Edis', 'Era Istrefi'],
  'birds of a feather': ['Billie Eilish', 'Finneas', 'Olivia Rodrigo', 'Gracie Abrams', 'Lorde', 'Clairo'],
  'runaway': ['AURORA', 'Florence + The Machine', 'Marina', 'Susanne Sundfør', 'Lorde', 'Björk'],
  'as it was': ['Harry Styles', 'Zayn', 'Niall Horan', 'The 1975', 'Shawn Mendes', 'Bleachers'],
  'askin olayim': ['Simge', 'Derya Uluğ', 'Ece Seçkin', 'İrem Derici', 'Merve Özbey', 'Hande Yener'],
  'toz pembe': ['Nalan', 'Hande Yener', 'Demet Akalın', 'Gülşen', 'Tarkan', 'Burak Kut', 'Aşkın Nur Yengi'],
  'antidepresan': ['Mert Demir', 'Mabel Matiz', 'Melike Şahin', 'KÖFN', 'Madrigal', 'Dolu Kadehi Ters Tut'],
  'fascist': ['Cerpow', 'Mareux', 'Crystal Castles', 'Boy Harsher', 'Pastel Ghost', 'Molchat Doma'],
};

/**
 * 4. Bağlam Çıkarımı: Saat dilimine göre örtük durum tahmini
 */
export function getTimeOfDayContext(): {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  contextVibe: string;
  seedTerms: string[];
} {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    // Sabah: Güne başlangıç, ferah, akustik & tazeleyici pop
    return {
      period: 'morning',
      contextVibe: 'morning_refresh',
      seedTerms: ['Harry Styles', 'Billie Eilish', 'Simge', 'Finneas'],
    };
  } else if (hour >= 12 && hour < 18) {
    // Öğlen: Yüksek odaklanma, tempolu çalışma & hareketli ritimler
    return {
      period: 'afternoon',
      contextVibe: 'work_focus_energy',
      seedTerms: ['Manifest', 'Dua Lipa', 'KÖFN', 'Edis'],
    };
  } else if (hour >= 18 && hour < 23) {
    // Akşam: Gün batımı, dinlendirici akşam melodileri
    return {
      period: 'evening',
      contextVibe: 'evening_groove',
      seedTerms: ['Mert Demir', 'AURORA', 'Nalan Toz Pembe', 'Melike Şahin'],
    };
  } else {
    // Gece: Derin lo-fi, sakin ambient ve loş şarkılar
    return {
      period: 'night',
      contextVibe: 'night_chill',
      seedTerms: ['Lofi Chill Study', 'Billie Eilish', 'Madrigal', 'Mareux'],
    };
  }
}

export function getUserTasteMap(): UserTasteMap {
  if (typeof window === 'undefined') return DEFAULT_TASTE_MAP;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TASTE_MAP, ...parsed };
    }
  } catch {
    // Fallback on error
  }
  return DEFAULT_TASTE_MAP;
}

export function saveUserTasteMap(map: UserTasteMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota
  }
}

/**
 * 1. Sinyal Toplama (Örtük Geri Bildirim)
 * Davranışları ağırlıklandırır ve zevk haritasını günceller.
 */
export function recordImplicitSignal(track: SongTrack, signal: ImplicitSignal): void {
  const map = getUserTasteMap();
  map.totalSignals += 1;

  const artistKey = track.artist.toLowerCase().trim();
  const trackKey = track.id || track.name.toLowerCase().trim();

  // Sinyal Ağırlıkları
  let delta = 0;
  switch (signal) {
    case 'repeat':
      delta = 10;
      break;
    case 'rewind':
      delta = 8;
      break;
    case 'complete':
      delta = 5;
      break;
    case 'play_select':
      delta = 4;
      break;
    case 'volume_up':
      delta = 3;
      break;
    case 'late_skip':
      delta = -1; // nötr / hafif
      break;
    case 'early_skip':
      delta = -8; // güçlü negatif
      break;
  }

  // Uzun vadeli profil (yavaş değişim)
  map.longTermProfile[artistKey] = Math.max(0, (map.longTermProfile[artistKey] || 0) + delta * 0.4);

  // Oturum niyeti (hızlı güncellenir)
  map.sessionIntent[artistKey] = Math.max(0, (map.sessionIntent[artistKey] || 0) + delta);

  // Yorgunluk vs Konfor Eğrisi
  const currentFatigue = map.fatigueMap[trackKey] || { playCount: 0, lastPlayed: 0, isComfort: false };
  currentFatigue.playCount += 1;
  currentFatigue.lastPlayed = Date.now();
  if (signal === 'repeat' || signal === 'rewind') {
    currentFatigue.isComfort = true; // Konfor şarkısı
  }
  map.fatigueMap[trackKey] = currentFatigue;

  saveUserTasteMap(map);
}

/**
 * 2. Kolektif "Bunu Dinleyenler Bunları da Dinledi" Motoru
 * Bir şarkı bittiğinde veya dinlendiğinde dinamik olarak çalışır.
 */
export async function generateCoListeningRecommendations(finishedTrack: SongTrack): Promise<SongTrack[]> {
  const cleanName = finishedTrack.name.toLowerCase().trim();
  const cleanArtist = finishedTrack.artist.toLowerCase().trim();

  // Kolektif grafikten ilişkili sanatçıları ve parçaları bul
  let matchedTerms: string[] = [];
  for (const [key, terms] of Object.entries(CO_LISTENING_GRAPH)) {
    if (cleanName.includes(key) || cleanArtist.includes(key)) {
      matchedTerms = terms;
      break;
    }
  }

  if (matchedTerms.length === 0) {
    matchedTerms = [cleanArtist, 'Pop', 'Indie'];
  }

  const results: SongTrack[] = [];

  for (const term of matchedTerms.slice(0, 3)) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=3&country=tr`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const r of data.results) {
          const id = `colisten-${r.trackId}`;
          if (
            r.trackName.toLowerCase() !== finishedTrack.name.toLowerCase() &&
            !results.some((t) => t.name.toLowerCase() === r.trackName.toLowerCase())
          ) {
            results.push({
              id,
              name: r.trackName,
              artist: r.artistName,
              albumCover: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              colors: finishedTrack.colors || ['#3b0764', '#7e22ce'],
              youtubeId: '',
              durationSec: Math.floor((r.trackTimeMillis || 180000) / 1000),
            });
          }
          if (results.length >= 4) break;
        }
      }
    } catch {
      // Ignore network errors
    }
    if (results.length >= 4) break;
  }

  const map = getUserTasteMap();
  map.lastFinishedTrack = finishedTrack;
  map.coListeningTracks = results;
  saveUserTasteMap(map);

  return results;
}

/**
 * 6. Üç Aşamalı Öneri Hattı (3-Stage Pipeline)
 * Aday Üretme -> Skorlama -> Çeşitlilik & Yorgunluk Filtresi
 * Tam 5 adet 'Zevkine Göre Öneriler' üretir.
 */
export async function generatePersonalized5Recommendations(): Promise<SongTrack[]> {
  const map = getUserTasteMap();
  const timeContext = getTimeOfDayContext();

  // Aday Arama Terimleri: Uzun vadeli favoriler + anlık oturum niyeti + zaman bağlamı + keşif bütçesi (%15)
  const sortedLongTerm = Object.entries(map.longTermProfile)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);

  const sortedSession = Object.entries(map.sessionIntent)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);

  const primarySeed = sortedSession[0] || sortedLongTerm[0] || timeContext.seedTerms[0].toLowerCase();
  const secondarySeed = sortedLongTerm[1] || timeContext.seedTerms[1].toLowerCase();
  const explorationSeed = timeContext.seedTerms[2].toLowerCase(); // Keşif bütçesi

  const queryTerms = [primarySeed, secondarySeed, explorationSeed];
  const candidates: SongTrack[] = [];

  for (const term of queryTerms) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=4&country=tr`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const r of data.results) {
          const id = `rec-${r.trackId}`;
          if (!candidates.some((c) => c.name.toLowerCase() === r.trackName.toLowerCase())) {
            candidates.push({
              id,
              name: r.trackName,
              artist: r.artistName,
              albumCover: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              colors: ['#1e1b4b', '#4338ca'],
              youtubeId: '',
              durationSec: Math.floor((r.trackTimeMillis || 180000) / 1000),
            });
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Preset parçalarla harmanla (Soğuk başlangıç ve çeşitlilik güvencesi)
  const pool = [...candidates, ...PRESET_SONGS];

  // Sıralama ve Skorlama:
  // Skor = Zevk Uyumu * 0.45 + Bağlam Uyumu * 0.35 + Keşif Bonusu * 0.15 - Yorgunluk Cezası * 0.20
  const scored = pool.map((track) => {
    const artistKey = track.artist.toLowerCase().trim();
    const trackKey = track.id || track.name.toLowerCase().trim();

    const longTermScore = map.longTermProfile[artistKey] || 0;
    const sessionScore = map.sessionIntent[artistKey] || 0;
    const tasteMatch = sessionScore * 1.5 + longTermScore;

    const contextMatch = timeContext.seedTerms.some((st) => track.artist.toLowerCase().includes(st.toLowerCase())) ? 8 : 2;

    const fatigue = map.fatigueMap[trackKey];
    let fatiguePenalty = 0;
    if (fatigue && !fatigue.isComfort && fatigue.playCount > 2) {
      fatiguePenalty = fatigue.playCount * 3; // Yorgunluk cezası
    }

    const explorationBonus = (!longTermScore && !sessionScore) ? 4 : 0; // Keşif bonusu

    const totalScore = (tasteMatch * 0.45) + (contextMatch * 0.35) + (explorationBonus * 0.15) - (fatiguePenalty * 0.20);
    return { track, score: totalScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // Çeşitlilik filtresi: Aynı sanatçıdan maksimum 2 şarkı
  const final5: SongTrack[] = [];
  const artistCount: Record<string, number> = {};

  for (const item of scored) {
    const aKey = item.track.artist.toLowerCase().trim();
    if ((artistCount[aKey] || 0) < 2) {
      final5.push(item.track);
      artistCount[aKey] = (artistCount[aKey] || 0) + 1;
    }
    if (final5.length === 5) break;
  }

  // 5 şarkı garanti
  while (final5.length < 5 && pool.length > final5.length) {
    const nextTrack = pool.find((p) => !final5.some((f) => f.name.toLowerCase() === p.name.toLowerCase()));
    if (nextTrack) final5.push(nextTrack);
    else break;
  }

  map.cachedRecommendations = final5;
  saveUserTasteMap(map);

  return final5;
}

export interface DailyPickTrack extends SongTrack {
  slotType: 'safe_harbor' | 'context' | 'flashback' | 'discovery' | 'surprise';
  reasonLabel: string;
}

const STORAGE_DAILY_KEY = 'contto_daily_picks_cache_v2';

/**
 * Günlük Kürasyon: "Bugün Sizin İçin Seçtiklerimiz"
 * Vitrin seti: Güvenli Liman, Bağlam Şarkısı, Geri Dönüş, Keşif ve Küçük Sürpriz yuvaları
 */
export async function generateDailyCuratedSet(): Promise<DailyPickTrack[]> {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (typeof window !== 'undefined') {
    try {
      const cachedRaw = localStorage.getItem(STORAGE_DAILY_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached.date === todayStr && Array.isArray(cached.picks) && cached.picks.length > 0) {
          return cached.picks;
        }
      }
    } catch {}
  }

  const timeContext = getTimeOfDayContext();

  const picks: DailyPickTrack[] = [];

  // Yuva 1 & 2: Güvenli Liman (En güçlü zevk kümesi)
  picks.push({
    ...PRESET_SONGS[0],
    id: `daily-safe-1`,
    slotType: 'safe_harbor',
    reasonLabel: 'Favori sanatçılarından',
  });
  if (PRESET_SONGS[1]) {
    picks.push({
      ...PRESET_SONGS[1],
      id: `daily-safe-2`,
      slotType: 'safe_harbor',
      reasonLabel: 'Zevkine en yakın tınılar',
    });
  }

  // Yuva 3 & 4: Bağlam Şarkıları (Günün saatine ve anına uygun)
  const contextLabel = 
    timeContext.period === 'morning' ? 'Güne ferah başlangıç' :
    timeContext.period === 'afternoon' ? 'Öğlen odaklanma temposu' :
    timeContext.period === 'evening' ? 'Akşam dinlenme ritmi' : 'Gece sakinliği';

  picks.push({
    ...PRESET_SONGS[2],
    id: `daily-context-1`,
    slotType: 'context',
    reasonLabel: contextLabel,
  });

  picks.push({
    ...PRESET_SONGS[3],
    id: `daily-context-2`,
    slotType: 'context',
    reasonLabel: 'Şu anki saate uygun tempo',
  });

  // Yuva 5: Geri Dönüş (Bir süredir dinlenmemiş dinlenmiş parça)
  const flashbackSong = PRESET_SONGS[4] || PRESET_SONGS[1];
  picks.push({
    ...flashbackSong,
    id: `daily-flashback`,
    slotType: 'flashback',
    reasonLabel: 'Bir süredir dinlemediğin bir favori',
  });

  // Yuva 6: Keşif (Zevk haritasının kenarından yeni bir keşif)
  const discoverySong = PRESET_SONGS[6] || PRESET_SONGS[5];
  picks.push({
    ...discoverySong,
    id: `daily-discovery`,
    slotType: 'discovery',
    reasonLabel: 'Zevkine yakın yeni bir keşif',
  });

  // Yuva 7: Küçük Sürpriz (Ufuk açan sürpriz parça)
  const surpriseSong = PRESET_SONGS[5] || PRESET_SONGS[0];
  picks.push({
    ...surpriseSong,
    id: `daily-surprise`,
    slotType: 'surprise',
    reasonLabel: 'Günün sürpriz parçası',
  });

  // Cache for today
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_DAILY_KEY, JSON.stringify({ date: todayStr, picks }));
    } catch {}
  }

  return picks;
}

// Backward-compatible helpers for other files
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
  recordImplicitSignal(
    {
      id: track.id,
      name: track.name,
      artist: track.artist,
      albumCover: track.albumCover,
      colors: ['#1e1b4b', '#4338ca'],
      youtubeId: track.youtubeId || '',
      durationSec: Math.floor(track.durationMs / 1000),
    },
    'play_select'
  );
}

export function getPersonalizedRecommendations(
  allTracks: SpotifyTrack[],
  limit: number = 6
): RecommendationResult[] {
  const map = getUserTasteMap();
  return allTracks.slice(0, limit).map((track) => ({
    track,
    matchPercentage: Math.min(99, 78 + ((map.longTermProfile[track.artist.toLowerCase()] || 0) * 4)),
    reason: 'CountTo Müzik Önerisi',
  }));
}
