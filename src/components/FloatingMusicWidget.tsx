import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Music, 
  ListMusic, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { musicAudioEngine, PRESET_SONGS, SongTrack } from '../utils/musicAudioEngine';

interface FloatingMusicWidgetProps {
  themePrimary: string;
}

function formatMinutes(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const FloatingMusicWidget: React.FC<FloatingMusicWidgetProps> = ({
  themePrimary,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'player' | 'search'>('player');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SongTrack[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<SongTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [hoveredTrack, setHoveredTrack] = useState<SongTrack | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to audio engine
  useEffect(() => {
    const unsubscribe = musicAudioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setIsShuffle(state.isShuffle);
      setIsRepeat(state.isRepeat);
      if (state.track) {
        setCurrentTrack(state.track);
      }
    });
    return () => unsubscribe();
  }, []);

  // Smart Auto-Hide Rule:
  // - NEVER auto-hide in 'search' mode (user is searching or browsing tracks)
  // - NEVER auto-hide while mouse is hovering or interacting with the card/controls
  // - ONLY auto-hide in 'player' mode after the user moves the mouse away from the card
  const clearTimer = () => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  };

  const startAutoHideTimer = () => {
    clearTimer();
    // Only auto-hide if player mode and not hovered
    if (isOpen && viewMode === 'player' && !isHovered) {
      autoHideTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 2000); // Comfortable delay after user leaves the player
    }
  };

  useEffect(() => {
    if (isOpen && viewMode === 'player' && !isHovered) {
      startAutoHideTimer();
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [isOpen, viewMode, isHovered]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        const toggleBtn = document.getElementById('music-widget-toggle-btn');
        if (toggleBtn && toggleBtn.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  // Live real-time search for official songs & covers from Apple Music CDN
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery.trim())}&entity=song&limit=6`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const liveTracks: SongTrack[] = data.results.map((r: any) => ({
            id: `online-${r.trackId}`,
            name: r.trackName,
            artist: r.artistName,
            albumCover: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
            colors: ['#1e1b4b', '#4338ca'],
            youtubeId: 'V9PVRfjEBTI',
            durationSec: Math.floor((r.trackTimeMillis || 180000) / 1000),
          }));
          setSearchResults(liveTracks);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectTrack = (track: SongTrack) => {
    musicAudioEngine.play(track);
    setViewMode('player');
    clearTimer();
  };

  const handleTogglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    musicAudioEngine.togglePlayPause();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    musicAudioEngine.next();
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    musicAudioEngine.previous();
  };

  const handleToggleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    musicAudioEngine.toggleShuffle();
  };

  const handleToggleRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();
    musicAudioEngine.toggleRepeat();
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    clearTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    musicAudioEngine.seek(pct * duration);
  };

  // Local filtered tracks or online search results
  const localFilteredTracks = PRESET_SONGS.filter((s) =>
    `${s.name} ${s.artist}`.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const displayTracks = searchQuery.trim().length > 1 && searchResults.length > 0 
    ? searchResults 
    : localFilteredTracks.length > 0 
      ? localFilteredTracks 
      : PRESET_SONGS;

  const activeTrack = currentTrack || PRESET_SONGS[0];
  const activeColors = hoveredTrack?.colors || activeTrack.colors || ['#4a0e4e', '#c026d3'];
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  return (
    <div className="relative inline-flex items-center">
      {/* 1. Action Toolbar Trigger Button */}
      <button
        id="music-widget-toggle-btn"
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && !currentTrack) {
            setViewMode('search');
          }
        }}
        title={isPlaying ? 'Müzik Çalıyor' : 'Müzik Ekle'}
        className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none cursor-pointer ${
          isPlaying
            ? 'bg-white/15 text-white shadow-sm border border-white/20'
            : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-neutral-400'}`} />
        <span>{isPlaying || currentTrack ? 'Müzik' : 'Müzik Ekle'}</span>
        {isPlaying && (
          <span className="flex items-center gap-0.5 ml-0.5">
            <span className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </button>

      {/* 2. Frosted Glass Music Pop-up (Dense, Frosted, No Distracting See-Through) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => {
              setIsHovered(true);
              clearTimer();
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              startAutoHideTimer();
            }}
            className="absolute bottom-11 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 select-none"
          >
            {/* Frosted Glass Slab: High optical density (88% dark frosted glass) blocks distracting background clock numbers while providing luxurious frosted texture */}
            <div className="relative w-[335px] sm:w-[355px] rounded-3xl p-4 sm:p-5 backdrop-blur-3xl bg-[#131318]/92 text-white border border-white/15 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden">
              
              {/* Dynamic Color Mixing Ambient Glow Canvas (Softly blended at low opacity so it never harms contrast) */}
              <div 
                className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: activeColors[0] }}
              />
              <div 
                className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: activeColors[1] }}
              />

              {/* Specular Liquid Top Rim Light */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

              {viewMode === 'player' ? (
                /* ================= PLAYER MODE ================= */
                <div className="relative z-10 flex flex-col gap-3.5">
                  {/* Top: Album Art + Song Title & Artist + Quick Switch Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Real Official Album Artwork */}
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-white/20 shrink-0 bg-neutral-900">
                        <img
                          src={activeTrack.albumCover}
                          alt={activeTrack.name}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      </div>

                      {/* Title & Artist */}
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-white text-[15px] font-bold tracking-tight truncate leading-tight drop-shadow-sm">
                          {activeTrack.name}
                        </h4>
                        <p className="text-white/70 text-xs font-medium truncate mt-0.5">
                          {activeTrack.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Switch to Search / Track List */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('search');
                        clearTimer();
                      }}
                      title="Şarkı Listesi / Arama"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                    >
                      <ListMusic className="w-3.5 h-3.5 text-white/90" />
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 fill-lime-400/20" />
                    </button>
                  </div>

                  {/* Middle: Timeline Slider with Timestamps */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/70 select-none">
                      <span>{formatMinutes(currentTime)}</span>
                      <span>-{formatMinutes(remainingSeconds)}</span>
                    </div>

                    {/* Frosted Liquid Glass Seekbar Track */}
                    <div
                      onClick={handleSeekClick}
                      className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer flex items-center group overflow-hidden border border-white/10"
                      title="İlerlet"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-100 relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Modern Liquid Glass Controls */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    {/* Shuffle */}
                    <button
                      type="button"
                      onClick={handleToggleShuffle}
                      title={isShuffle ? 'Karışık Çalma Açık' : 'Karışık Çal'}
                      className={`p-2 rounded-xl transition-all active:scale-90 cursor-pointer ${
                        isShuffle ? 'text-lime-400 scale-110 drop-shadow-[0_0_8px_rgba(163,230,53,0.7)]' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Shuffle className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    {/* Previous Track */}
                    <button
                      type="button"
                      onClick={handlePrevious}
                      title="Önceki Şarkı"
                      className="p-2 rounded-xl text-white hover:text-white/80 active:scale-90 transition-all cursor-pointer"
                    >
                      <SkipBack className="w-5 h-5 fill-white stroke-white" />
                    </button>

                    {/* Play / Pause Glass Squircle Button */}
                    <button
                      type="button"
                      onClick={handleTogglePlayPause}
                      title={isPlaying ? 'Durdur' : 'Oynat'}
                      className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 backdrop-blur-xl flex items-center justify-center text-white transition-all cursor-pointer shadow-lg group"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-white group-hover:scale-105 transition-transform" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ml-0.5 group-hover:scale-105 transition-transform" />
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      type="button"
                      onClick={handleNext}
                      title="Sonraki Şarkı"
                      className="p-2 rounded-xl text-white hover:text-white/80 active:scale-90 transition-all cursor-pointer"
                    >
                      <SkipForward className="w-5 h-5 fill-white stroke-white" />
                    </button>

                    {/* Repeat Track */}
                    <button
                      type="button"
                      onClick={handleToggleRepeat}
                      title={isRepeat ? 'Tekrar Modu Açık' : 'Tekrar Çal'}
                      className={`p-2 rounded-xl transition-all active:scale-90 cursor-pointer ${
                        isRepeat ? 'text-lime-400 scale-110 drop-shadow-[0_0_8px_rgba(163,230,53,0.7)]' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Repeat className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              ) : (
                /* ================= SELECTION & LIVE SEARCH MODE ================= */
                <div className="relative z-10 flex flex-col gap-3">
                  {/* Top Search Input + Back to Player button */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="flex items-center px-3.5 py-2 rounded-2xl bg-black/50 border border-white/20 text-white shadow-inner backdrop-blur-md">
                        {isSearchingOnline ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mr-2 shrink-0" />
                        ) : (
                          <Search className="w-4 h-4 text-white/50 mr-2 shrink-0 stroke-[2.2]" />
                        )}
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={clearTimer}
                          placeholder="Şarkı veya sanatçı arayın..."
                          className="bg-transparent text-white placeholder-white/45 focus:outline-none w-full text-xs font-medium"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('player');
                        clearTimer();
                      }}
                      title="Çalara Dön"
                      className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      Çalar
                    </button>
                  </div>

                  {/* Real Song List with Authentic Official Covers */}
                  <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-0.5 custom-sticky-scrollbar">
                    {displayTracks.map((song) => {
                      const isThisActive = currentTrack?.id === song.id;

                      return (
                        <div
                          key={song.id}
                          onMouseEnter={() => setHoveredTrack(song)}
                          onMouseLeave={() => setHoveredTrack(null)}
                          onClick={() => handleSelectTrack(song)}
                          className={`flex items-center justify-between p-2 rounded-2xl transition-all cursor-pointer group ${
                            isThisActive
                              ? 'bg-white/20 border border-white/25 shadow-md backdrop-blur-md'
                              : 'hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Real Album Artwork */}
                            <img
                              src={song.albumCover}
                              alt={song.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-white/15"
                              loading="lazy"
                            />

                            {/* Track Details */}
                            <div className="flex flex-col min-w-0">
                              <span className="text-white text-xs font-bold truncate group-hover:text-lime-300 transition-colors">
                                {song.name}
                              </span>
                              <span className="text-white/70 text-[11px] truncate">
                                Song · {song.artist} · {formatMinutes(song.durationSec)}
                              </span>
                            </div>
                          </div>

                          {/* Play Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTrack(song);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                              isThisActive && isPlaying
                                ? 'bg-lime-400 text-neutral-950 shadow-md'
                                : 'bg-white text-neutral-950 hover:bg-white/90 active:scale-95'
                            }`}
                          >
                            {isThisActive && isPlaying ? (
                              <Pause className="w-3 h-3 fill-neutral-950" />
                            ) : (
                              <Play className="w-3 h-3 fill-neutral-950" />
                            )}
                            <span>{isThisActive && isPlaying ? 'Çalıyor' : 'Play'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
