import { SpotifyTrack, UserMusicPreference, RecommendationResult } from '../types/music';

const STORAGE_KEY = 'countto_spotify_music_preferences_v1';

export function getUserMusicPreferences(): UserMusicPreference {
  if (typeof window === 'undefined') {
    return {
      listenedTrackIds: {},
      favoriteTrackIds: [],
      genreScores: {},
      artistScores: {},
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore JSON errors
  }

  return {
    listenedTrackIds: {},
    favoriteTrackIds: [],
    genreScores: {
      pop: 4,
      rock: 3,
      lofi: 5,
    },
    artistScores: {},
  };
}

export function saveUserMusicPreferences(prefs: UserMusicPreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Records a listening event and dynamically updates the CountTo Recommendation Model
 */
export function recordTrackListen(track: SpotifyTrack): void {
  const prefs = getUserMusicPreferences();

  // 1. Increment track play count
  prefs.listenedTrackIds[track.id] = (prefs.listenedTrackIds[track.id] || 0) + 1;

  // 2. Boost genre score (+4 points)
  prefs.genreScores[track.genre] = (prefs.genreScores[track.genre] || 0) + 4;

  // 3. Boost artist score (+6 points)
  prefs.artistScores[track.artist] = (prefs.artistScores[track.artist] || 0) + 6;

  prefs.lastPlayedAt = Date.now();
  saveUserMusicPreferences(prefs);
}

/**
 * Toggle favorite track status (+10 points to recommendation model)
 */
export function toggleFavoriteTrack(track: SpotifyTrack): boolean {
  const prefs = getUserMusicPreferences();
  const index = prefs.favoriteTrackIds.indexOf(track.id);
  const isNowFavorite = index === -1;

  if (isNowFavorite) {
    prefs.favoriteTrackIds.push(track.id);
    prefs.genreScores[track.genre] = (prefs.genreScores[track.genre] || 0) + 8;
    prefs.artistScores[track.artist] = (prefs.artistScores[track.artist] || 0) + 10;
  } else {
    prefs.favoriteTrackIds.splice(index, 1);
  }

  saveUserMusicPreferences(prefs);
  return isNowFavorite;
}

export function isFavoriteTrack(trackId: string): boolean {
  const prefs = getUserMusicPreferences();
  return prefs.favoriteTrackIds.includes(trackId);
}

/**
 * CountTo Algoritmik Müzik Öneri Motoru:
 * Dinleme geçmişi, tür ağırlıkları, günün saati (gece/gündüz odaklanma) ve popülerlik
 * verilerini harmanlayarak dinamik % eşleşme puanı ve neden üretir.
 */
export function getPersonalizedRecommendations(
  allTracks: SpotifyTrack[]
): RecommendationResult[] {
  const prefs = getUserMusicPreferences();
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;

  // Find top genre and artist from user profile
  let topGenre = 'pop';
  let maxGenreScore = -1;
  Object.entries(prefs.genreScores).forEach(([genre, score]) => {
    if (score > maxGenreScore) {
      maxGenreScore = score;
      topGenre = genre;
    }
  });

  let topArtist = '';
  let maxArtistScore = -1;
  Object.entries(prefs.artistScores).forEach(([artist, score]) => {
    if (score > maxArtistScore) {
      maxArtistScore = score;
      topArtist = artist;
    }
  });

  const scoredTracks = allTracks.map((track) => {
    let score = 50; // Base score

    // Popularity factor (0-20 points)
    score += (track.popularity / 100) * 20;

    // Genre affinity (up to 25 points)
    const genreScore = prefs.genreScores[track.genre] || 0;
    if (track.genre === topGenre) {
      score += 25;
    } else if (genreScore > 0) {
      score += Math.min(20, genreScore * 2);
    }

    // Artist affinity (up to 20 points)
    if (topArtist && track.artist.toLowerCase().includes(topArtist.toLowerCase())) {
      score += 20;
    } else if (prefs.artistScores[track.artist]) {
      score += Math.min(15, prefs.artistScores[track.artist] * 2);
    }

    // Time-of-day contextual alignment (up to 15 points)
    if (isNight && (track.genre === 'lofi' || track.genre === 'acoustic')) {
      score += 15;
    } else if (!isNight && (track.genre === 'pop' || track.energy === 'upbeat')) {
      score += 10;
    }

    // Favorited bonus
    if (prefs.favoriteTrackIds.includes(track.id)) {
      score += 10;
    }

    // Calculate match percentage between 78% and 99%
    const matchPercentage = Math.min(99, Math.max(78, Math.round(score)));

    // Generate human algorithmic reason
    let reason = 'Türkiye listelerinde trend şarkı';
    if (prefs.favoriteTrackIds.includes(track.id)) {
      reason = 'Favori listenizdeki benzer parçalara göre';
    } else if (topArtist && track.artist.toLowerCase().includes(topArtist.toLowerCase())) {
      reason = `${topArtist} dinleme alışkanlığına göre`;
    } else if (isNight && track.genre === 'lofi') {
      reason = 'Gece çalışma ve odaklanma saatine özel';
    } else if (track.genre === topGenre) {
      const genreNames: Record<string, string> = {
        pop: 'Popüler Türkçe',
        lofi: 'Derin Odaklanma & Lo-Fi',
        rap: 'Türkçe Hip-Hop & Rap',
        rock: 'Alternatif & Rock',
        acoustic: 'Sakin Akustik',
        electronic: 'Elektronik & Ritim',
      };
      reason = `En çok dinlediğin ${genreNames[track.genre] || track.genre} türüne göre`;
    } else if (track.isPopularInTurkey) {
      reason = "Türkiye'de şu an en çok çalınan hit";
    }

    return {
      track,
      matchPercentage,
      reason,
    };
  });

  // Sort descending by match percentage
  scoredTracks.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return scoredTracks;
}
