export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover: string;
  durationMs: number;
  previewUrl?: string;
  spotifyUri: string;
  spotifyUrl: string;
  genre: 'pop' | 'lofi' | 'rap' | 'acoustic' | 'rock' | 'electronic';
  energy: 'calm' | 'focus' | 'upbeat' | 'chill';
  popularity: number;
  releaseYear?: string;
  isPopularInTurkey?: boolean;
}

export interface UserMusicPreference {
  listenedTrackIds: Record<string, number>;
  favoriteTrackIds: string[];
  genreScores: Record<string, number>;
  artistScores: Record<string, number>;
  lastPlayedAt?: number;
}

export interface RecommendationResult {
  track: SpotifyTrack;
  matchPercentage: number;
  reason: string;
}
