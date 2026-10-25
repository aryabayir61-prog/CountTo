import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Play, 
  Pause, 
  Heart, 
  Music as MusicIcon, 
  Flame,
  Coffee,
  Moon,
  Zap,
  Radio,
  Loader2,
  Globe
} from 'lucide-react';
import { SpotifyTrack } from '../types/music';
import { SPOTIFY_TRACKS } from '../utils/spotifyCatalog';
import { 
  getPersonalizedRecommendations, 
  recordTrackListen, 
  toggleFavoriteTrack, 
  isFavoriteTrack 
} from '../utils/musicRecommendationEngine';
import { searchYouTubeMusic, extractYouTubeId } from '../utils/audioStreamService';
import { RecommendedMusicSlider } from './RecommendedMusicSlider';

interface MusicViewProps {
  activeTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: SpotifyTrack) => void;
  onTogglePlay: () => void;
}

type FilterCategory = 'all' | 'lofi' | 'acoustic' | 'popular' | 'electronic' | 'favorites';

export const MusicView: React.FC<MusicViewProps> = ({
  activeTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [favRefresh, setFavRefresh] = useState<number>(0);
  const [onlineResults, setOnlineResults] = useState<SpotifyTrack[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);

  // Personalized recommendations for top carousel slider (like ThemesView)
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

  // Online Piped/Invidious Search
  const handlePerformOnlineSearch = async () => {
    if (!searchQuery.trim() || isSearchingOnline) return;
    setIsSearchingOnline(true);
    try {
      const results = await searchYouTubeMusic(searchQuery);
      setOnlineResults(results);
    } catch {
      // Ignore
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const categories: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tümü', icon: <MusicIcon className="w-3.5 h-3.5" /> },
    { id: 'lofi', label: '🎧 Odaklanma & Lo-Fi', icon: <Coffee className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'acoustic', label: '🌙 Gece & Akustik', icon: <Moon className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'popular', label: '🔥 Popüler Hit', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'electronic', label: '⚡ Synthwave & Enerji', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'favorites', label: '❤️ Favorilerim', icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> },
  ];

  // Combined track list (local catalog + any searched online results)
  const allTracks = useMemo(() => {
    if (onlineResults.length > 0) {
      const existingIds = new Set(SPOTIFY_TRACKS.map((t) => t.id));
      const newItems = onlineResults.filter((t) => !existingIds.has(t.id));
      return [...newItems, ...SPOTIFY_TRACKS];
    }
    return SPOTIFY_TRACKS;
  }, [onlineResults]);

  // Filtering logic
  const filteredTracks = useMemo(() => {
    return allTracks.filter((track) => {
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
        return track.isPopularInTurkey || track.popularity >= 95;
      }
      if (activeCategory === 'lofi') {
        return track.genre === 'lofi';
      }
      if (activeCategory === 'acoustic') {
        return track.genre === 'acoustic';
      }
      if (activeCategory === 'electronic') {
        return track.genre === 'electronic';
      }

      return true;
    });
  }, [allTracks, searchQuery, activeCategory, favRefresh]);

  const formatDuration = (ms: number) => {
    if (!ms) return '3:00';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const isYouTubeUrl = Boolean(extractYouTubeId(searchQuery));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 z-10 select-none pb-32">
      {/* 3D Stepped Recommended Music Carousel (Identical concept to ThemesView) */}
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

      {/* Clean Section Header */}
      <div className="mb-6 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Müzik & Odaklanma</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Geri sayımına ve çalışma seanslarına eşlik edecek ses akışları
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {filteredTracks.length} Parça
          </span>
        </div>
      </div>

      {/* Search Bar & YouTube Link Handler */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-6 w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePerformOnlineSearch();
              }
            }}
            placeholder="Şarkı, sanatçı ara veya YouTube linki yapıştır..."
            className="w-full pl-11 pr-24 py-3 rounded-2xl bg-neutral-900/80 border border-white/10 focus:border-cyan-400/60 text-white placeholder-neutral-500 text-sm focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setOnlineResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-neutral-400 hover:text-white px-2 py-0.5 rounded-full bg-white/5 cursor-pointer"
            >
              Temizle
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handlePerformOnlineSearch}
          disabled={!searchQuery.trim() || isSearchingOnline}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
        >
          {isSearchingOnline ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : isYouTubeUrl ? (
            <Globe className="w-4 h-4 text-cyan-400" />
          ) : (
            <Search className="w-4 h-4 text-cyan-400" />
          )}
          <span>{isYouTubeUrl ? 'Linki Başlat' : 'Çevrimiçi Ara'}</span>
        </button>
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
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-lg shadow-cyan-400/25 scale-[1.02]'
                  : 'bg-neutral-900/80 border border-white/10 text-neutral-300 hover:bg-neutral-800 hover:border-white/20'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Track Cards: 3 Columns matching ThemesView layout */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/30 rounded-3xl border border-white/5">
          <MusicIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-neutral-300">Aradığınız kriterlere uygun parça bulunamadı</p>
          <p className="text-xs text-neutral-500 mt-1">Farklı bir arama yapabilir veya çevrimiçi arama yapabilirsiniz</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setOnlineResults([]);
            }}
            className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-xs text-white hover:bg-white/20 transition-colors cursor-pointer"
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
                    ? 'border-cyan-400/70 bg-neutral-900/90 ring-2 ring-cyan-400/30 shadow-2xl scale-[1.01]'
                    : 'border-white/10 bg-neutral-900/40 hover:border-cyan-400/40 hover:bg-neutral-900/60'
                }`}
                style={{
                  boxShadow: isThisPlaying
                    ? '0 15px 35px -10px rgba(6, 182, 212, 0.35)'
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
                          ? 'bg-cyan-400 text-neutral-950 scale-100 shadow-cyan-400/40'
                          : 'bg-black/60 text-white backdrop-blur-md opacity-90 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-neutral-950'
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
                      <span className="w-1 bg-cyan-400 h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                      <span className="w-1 bg-cyan-400 h-2/3 animate-[pulse_0.4s_ease-in-out_infinite]" />
                      <span className="w-1 bg-cyan-400 h-4/5 animate-[pulse_0.7s_ease-in-out_infinite]" />
                      <span className="w-1 bg-cyan-400 h-1/2 animate-[pulse_0.5s_ease-in-out_infinite]" />
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
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-rose-400 transition-colors cursor-pointer"
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
                    <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
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
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <span>Reklamsız Akış</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(track);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      {isThisPlaying ? 'Durdur' : 'Dinle'}
                    </button>
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
