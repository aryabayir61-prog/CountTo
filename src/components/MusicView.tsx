import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Play, 
  Pause, 
  Heart, 
  ExternalLink, 
  Radio, 
  Music as MusicIcon, 
  Flame,
  Coffee,
  Moon,
  Zap,
  Mic2,
  Guitar
} from 'lucide-react';
import { SpotifyTrack } from '../types/music';
import { SPOTIFY_TRACKS } from '../utils/spotifyCatalog';
import { 
  getPersonalizedRecommendations, 
  recordTrackListen, 
  toggleFavoriteTrack, 
  isFavoriteTrack 
} from '../utils/musicRecommendationEngine';
import { RecommendedMusicSlider } from './RecommendedMusicSlider';

interface MusicViewProps {
  activeTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: SpotifyTrack) => void;
  onTogglePlay: () => void;
}

type FilterCategory = 'all' | 'popular' | 'lofi' | 'acoustic' | 'pop' | 'rap' | 'rock' | 'favorites';

export const MusicView: React.FC<MusicViewProps> = ({
  activeTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [favRefresh, setFavRefresh] = useState<number>(0);

  // Recommendations calculated via CountTo Recommendation Algorithm
  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations(SPOTIFY_TRACKS);
  }, [favRefresh, activeTrack]);

  const handleTrackClick = (track: SpotifyTrack) => {
    if (activeTrack?.id === track.id) {
      onTogglePlay();
    } else {
      recordTrackListen(track);
      onPlayTrack(track);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, track: SpotifyTrack) => {
    e.stopPropagation();
    toggleFavoriteTrack(track);
    setFavRefresh((prev) => prev + 1);
  };

  const categories: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tümü', icon: <MusicIcon className="w-3.5 h-3.5" /> },
    { id: 'popular', label: '🔥 Türkiye Popüler', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'lofi', label: '🎧 Odaklanma & Lo-Fi', icon: <Coffee className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'acoustic', label: '🌙 Gece & Akustik', icon: <Moon className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'pop', label: '⚡ Popüler Pop', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'rap', label: '🎤 Türkçe Rap', icon: <Mic2 className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'rock', label: '🎸 Alternatif Rock', icon: <Guitar className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'favorites', label: '❤️ Favorilerim', icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> },
  ];

  // Filtering logic
  const filteredTracks = useMemo(() => {
    return SPOTIFY_TRACKS.filter((track) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = track.name.toLowerCase().includes(q);
        const matchesArtist = track.artist.toLowerCase().includes(q);
        const matchesAlbum = track.album.toLowerCase().includes(q);
        const matchesGenre = track.genre.toLowerCase().includes(q);
        if (!matchesName && !matchesArtist && !matchesAlbum && !matchesGenre) {
          return false;
        }
      }

      // 2. Category Filter
      if (activeCategory === 'favorites') {
        return isFavoriteTrack(track.id);
      }
      if (activeCategory === 'popular') {
        return track.isPopularInTurkey;
      }
      if (activeCategory === 'lofi') {
        return track.genre === 'lofi';
      }
      if (activeCategory === 'acoustic') {
        return track.genre === 'acoustic';
      }
      if (activeCategory === 'pop') {
        return track.genre === 'pop';
      }
      if (activeCategory === 'rap') {
        return track.genre === 'rap';
      }
      if (activeCategory === 'rock') {
        return track.genre === 'rock';
      }

      return true;
    });
  }, [searchQuery, activeCategory, favRefresh]);

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 z-10 select-none pb-28">
      {/* 3D Stepped Recommended Music Carousel (Like ThemesView) */}
      <RecommendedMusicSlider
        recommendations={recommendations}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        onPlayTrack={(track) => {
          recordTrackListen(track);
          onPlayTrack(track);
        }}
        onTogglePlay={onTogglePlay}
        onToggleFavorite={(track) => {
          toggleFavoriteTrack(track);
          setFavRefresh((prev) => prev + 1);
        }}
        isFavorite={(id) => isFavoriteTrack(id)}
      />

      {/* Clean Divider & Section Header */}
      <div className="mb-6 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#1DB954]" />
            <span>Spotify Müzik Kataloğu</span>
            <span className="text-xs font-bold text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/30 px-2.5 py-0.5 rounded-full">
              Spotify API Aktif
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Geri sayım, çalışma seansları ve odaklanma anlarınız için Türkiye hitleri ve Lo-Fi çalma listeleri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {filteredTracks.length} Şarkı
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6 w-full">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şarkı adı, sanatçı veya tarz ara (ör. Simge, Dedublüman, Lvbel C5, Lo-Fi, Rock)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 focus:border-[#1DB954]/60 text-white placeholder-neutral-500 text-sm focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-xs font-semibold text-neutral-400 hover:text-white px-2 py-1 rounded-full bg-white/5 cursor-pointer"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Categories Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1DB954] text-neutral-950 font-bold shadow-lg shadow-[#1DB954]/25 scale-[1.02]'
                  : 'bg-neutral-900/80 border border-white/10 text-neutral-300 hover:bg-neutral-800 hover:border-white/20'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Track Cards: 3 Columns matching ThemesView */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/30 rounded-3xl border border-white/5">
          <MusicIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-neutral-300">Aradığınız kriterlere uygun şarkı bulunamadı</p>
          <p className="text-xs text-neutral-500 mt-1">Farklı bir arama terimi veya filtre kategorisi deneyebilirsiniz</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-xs text-white hover:bg-white/20 transition-colors"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredTracks.map((track) => {
            const isThisPlaying = activeTrack?.id === track.id && isPlaying;
            const isFav = isFavoriteTrack(track.id);

            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                  isThisPlaying
                    ? 'border-[#1DB954]/70 bg-neutral-900/90 ring-2 ring-[#1DB954]/30 shadow-2xl scale-[1.01]'
                    : 'border-white/10 bg-neutral-900/40 hover:border-[#1DB954]/40 hover:bg-neutral-900/60'
                }`}
                style={{
                  boxShadow: isThisPlaying
                    ? '0 15px 35px -10px rgba(29, 185, 84, 0.35)'
                    : undefined,
                }}
              >
                {/* Album Cover & Artwork Container */}
                <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden mb-4 bg-neutral-950 flex items-center justify-center">
                  <img
                    src={track.albumCover}
                    alt={track.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform shadow-2xl ${
                        isThisPlaying
                          ? 'bg-[#1DB954] text-neutral-950 scale-100 shadow-[#1DB954]/40'
                          : 'bg-black/60 text-white backdrop-blur-md opacity-90 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-[#1DB954] group-hover:text-neutral-950'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Equalizer Sound Waves when Playing */}
                  {isThisPlaying && (
                    <div className="absolute bottom-3 right-3 flex items-end gap-1 h-5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md">
                      <span className="w-1 bg-[#1DB954] h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                      <span className="w-1 bg-[#1DB954] h-2/3 animate-[pulse_0.4s_ease-in-out_infinite]" />
                      <span className="w-1 bg-[#1DB954] h-4/5 animate-[pulse_0.7s_ease-in-out_infinite]" />
                      <span className="w-1 bg-[#1DB954] h-1/2 animate-[pulse_0.5s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider">
                      {track.genre}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleFavoriteClick(e, track)}
                      title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                      {track.name}
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 shrink-0">
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 truncate mt-0.5 mb-3 font-medium">
                    {track.artist} · <span className="text-neutral-500">{track.album}</span>
                  </p>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400">
                      Popülerlik: <span className="text-[#1DB954]">%{track.popularity}</span>
                    </span>

                    <a
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Spotify'da Dinle"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1DB954] hover:underline font-semibold"
                    >
                      <span>Spotify'da Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
