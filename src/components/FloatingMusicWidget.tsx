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
  Loader2,
  Sparkles,
  Users,
  Compass,
  X
} from 'lucide-react';
import { musicAudioEngine, PRESET_SONGS, SongTrack } from '../utils/musicAudioEngine';
import { 
  generatePersonalized5Recommendations, 
  generateCoListeningRecommendations, 
  generateDailyCuratedSet,
  DailyPickTrack,
  recordImplicitSignal,
  getUserTasteMap 
} from '../utils/musicRecommendationEngine';

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
  
  // Algorithmic State: Exactly 5 personalized recommendations + Co-listening section
  const [personalized5, setPersonalized5] = useState<SongTrack[]>(() => {
    const map = getUserTasteMap();
    return map.cachedRecommendations.length === 5 
      ? map.cachedRecommendations 
      : PRESET_SONGS.slice(0, 5);
  });
  const [coListeningTracks, setCoListeningTracks] = useState<SongTrack[]>(() => {
    const map = getUserTasteMap();
    return map.coListeningTracks || [];
  });
  const [lastFinishedTrack, setLastFinishedTrack] = useState<SongTrack | null>(() => {
    const map = getUserTasteMap();
    return map.lastFinishedTrack || PRESET_SONGS[0];
  });
  const [dailyPicks, setDailyPicks] = useState<DailyPickTrack[]>([]);

  // Animated intro pop-up on first arrival
  const [showIntroTooltip, setShowIntroTooltip] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem('contto_music_intro_seen_v2');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setShowIntroTooltip(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismissIntroTooltip = () => {
    setShowIntroTooltip(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contto_music_intro_seen_v2', 'true');
    }
  };

  const cardRef = useRef<HTMLDivElement | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load of recommendations, co-listening tracks, and daily curated set
  useEffect(() => {
    generatePersonalized5Recommendations().then((tracks) => {
      if (tracks && tracks.length === 5) {
        setPersonalized5(tracks);
      }
    });

    generateDailyCuratedSet().then((set) => {
      if (set && set.length > 0) {
        setDailyPicks(set);
      }
    });

    const initialFinished = getUserTasteMap().lastFinishedTrack || PRESET_SONGS[0];
    if (initialFinished) {
      setLastFinishedTrack(initialFinished);
      generateCoListeningRecommendations(initialFinished).then((colist) => {
        if (colist && colist.length > 0) {
          setCoListeningTracks(colist);
        }
      });
    }
  }, []);

  // Subscribe to audio engine state
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

  // Update co-listening recommendations every time a song finishes playing!
  useEffect(() => {
    const unsub = musicAudioEngine.onTrackCompleted(async (finishedTrack) => {
      setLastFinishedTrack(finishedTrack);
      const newCoList = await generateCoListeningRecommendations(finishedTrack);
      if (newCoList && newCoList.length > 0) {
        setCoListeningTracks(newCoList);
      }
      const new5 = await generatePersonalized5Recommendations();
      if (new5 && new5.length === 5) {
        setPersonalized5(new5);
      }
    });
    return () => unsub();
  }, []);

  // Smart Auto-Hide Rule
  const clearTimer = () => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  };

  const startAutoHideTimer = () => {
    clearTimer();
    if (isOpen && viewMode === 'player' && !isHovered) {
      autoHideTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
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
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery.trim())}&entity=song&limit=6&country=tr`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const liveTracks: SongTrack[] = data.results.map((r: any) => ({
            id: `online-${r.trackId}`,
            name: r.trackName,
            artist: r.artistName,
            albumCover: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
            colors: ['#1e1b4b', '#4338ca'],
            youtubeId: '',
            audioUrl: r.previewUrl || '',
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
    }, 320);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectTrack = async (track: SongTrack) => {
    recordImplicitSignal(track, 'play_select');
    musicAudioEngine.play(track);
    setViewMode('player');
    clearTimer();

    // Trigger background taste learning
    generatePersonalized5Recommendations().then((new5) => {
      if (new5 && new5.length === 5) setPersonalized5(new5);
    });
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

  const activeTrack = currentTrack || PRESET_SONGS[0];
  const activeColors = hoveredTrack?.colors || activeTrack.colors || ['#4a0e4e', '#c026d3'];
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  // Reusable track row renderer preserving the exact clean UI design
  const renderSongRow = (song: SongTrack | DailyPickTrack) => {
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
          <img
            src={song.albumCover}
            alt={song.name}
            className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-white/15"
            loading="lazy"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-white text-xs font-bold truncate group-hover:text-lime-300 transition-colors">
              {song.name}
            </span>
            <span className="text-white/70 text-[11px] truncate">
              Song · {song.artist} · {formatMinutes(song.durationSec)}
            </span>
          </div>
        </div>

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
  };

  return (
    <div className="relative inline-flex items-center">
      {/* 1. Action Toolbar Trigger Button: Icon only, blue when playing, no text */}
      <button
        id="music-widget-toggle-btn"
        type="button"
        onClick={() => {
          dismissIntroTooltip();
          setIsOpen((prev) => !prev);
          if (!isOpen && !currentTrack) {
            setViewMode('search');
          }
        }}
        title={isPlaying ? 'Müzik Çalıyor' : 'Müzik'}
        className={`relative p-1.5 px-2.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center select-none cursor-pointer border ${
          isPlaying
            ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.35)]'
            : 'text-neutral-400 hover:text-white border-transparent hover:bg-white/5'
        }`}
      >
        <Music
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isPlaying
              ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.9)] scale-105'
              : 'text-neutral-400 hover:text-white'
          }`}
        />

        {showIntroTooltip && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
        )}
      </button>

      {/* 2. Mini Animated Intro Pop-up Spotlight */}
      <AnimatePresence>
        {showIntroTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="absolute bottom-11 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 select-none w-64"
          >
            <div className="relative p-3.5 rounded-2xl backdrop-blur-3xl bg-[#131318]/95 border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.8)] text-white flex flex-col gap-2 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40 bg-cyan-500 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Yeni: Müzik Özelliği</span>
                </div>
                <button
                  type="button"
                  onClick={dismissIntroTooltip}
                  className="p-1 text-white/50 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-white/70 leading-relaxed relative z-10">
                Geri sayımına eşlik eden müzikler burada! Nota simgesine tıklayarak dilediğin şarkıyı açabilirsin.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1 relative z-10">
                <button
                  type="button"
                  onClick={dismissIntroTooltip}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium text-white/60 hover:text-white cursor-pointer"
                >
                  Tamam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissIntroTooltip();
                    setIsOpen(true);
                    setViewMode('search');
                  }}
                  className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  Keşfet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Frosted Glass Music Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 320,
              mass: 0.75,
            }}
            onMouseEnter={() => {
              setIsHovered(true);
              clearTimer();
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              startAutoHideTimer();
            }}
            className="absolute bottom-11 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 select-none origin-bottom"
          >
            {/* Frosted Glass Slab: Animated layout transition smoothly resizes card between Search and Player modes */}
            <motion.div
              layout
              transition={{
                layout: { type: 'spring', stiffness: 360, damping: 32 },
              }}
              className="relative w-[335px] sm:w-[355px] rounded-3xl p-4 sm:p-5 backdrop-blur-3xl bg-[#131318]/92 text-white border border-white/15 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden"
            >
              
              {/* Dynamic Color Mixing Ambient Glow Canvas */}
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

              <AnimatePresence mode="wait" initial={false}>
                {viewMode === 'player' ? (
                  /* ================= PLAYER MODE ================= */
                  <motion.div
                    key="player-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="relative z-10 flex flex-col gap-3.5"
                  >
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

                        {/* Title & Artist with smooth transition */}
                        <div className="flex flex-col min-w-0">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeTrack.id + activeTrack.name}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="flex flex-col min-w-0"
                            >
                              <h4 className="text-white text-[15px] font-bold tracking-tight truncate leading-tight drop-shadow-sm">
                                {activeTrack.name}
                              </h4>
                              <p className="text-white/70 text-xs font-medium truncate mt-0.5">
                                {activeTrack.artist}
                              </p>
                            </motion.div>
                          </AnimatePresence>
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

                    {/* Middle: Timeline Slider with Timestamps (image_ee5a9565.png) */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/70 select-none">
                        <span>{formatMinutes(currentTime)}</span>
                        <span>-{formatMinutes(remainingSeconds)}</span>
                      </div>

                      {/* Frosted Liquid Glass Seekbar Track matching image_ee5a9565.png */}
                      <div
                        onClick={handleSeekClick}
                        className="relative h-2.5 w-full bg-white/15 hover:bg-white/20 rounded-full cursor-pointer flex items-center group overflow-hidden border border-white/10 transition-all duration-200 hover:h-3"
                        title="İlerlet"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-white/75 via-white/90 to-white rounded-full transition-all duration-100 relative"
                          style={{ width: `${progressPercent}%` }}
                        >
                          {/* Glowing capsule head at the front (exact match to image_ee5a9565.png) */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Modern Liquid Glass Controls Pod (Calm, Elegant Micro-animations) */}
                    <div className="mt-1 rounded-full bg-black/45 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2 flex items-center justify-between shadow-inner">
                      {/* Shuffle */}
                      <motion.button
                        type="button"
                        onClick={handleToggleShuffle}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        title={isShuffle ? 'Karışık Çalma Açık' : 'Karışık Çal'}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          isShuffle
                            ? 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Shuffle className="w-4 h-4 stroke-[2.2]" />
                      </motion.button>

                      {/* Previous Track */}
                      <motion.button
                        type="button"
                        onClick={handlePrevious}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        title="Önceki Şarkı"
                        className="p-1.5 rounded-xl text-white hover:text-white/80 transition-colors cursor-pointer"
                      >
                        <SkipBack className="w-5 h-5 fill-white stroke-white" />
                      </motion.button>

                      {/* Play / Pause Glass Squircle Button with Subtle Spring Morph */}
                      <motion.button
                        type="button"
                        onClick={handleTogglePlayPause}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        title={isPlaying ? 'Durdur' : 'Oynat'}
                        className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/35 backdrop-blur-xl flex items-center justify-center text-white transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.5)] group overflow-hidden"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isPlaying ? 'pause' : 'play'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="flex items-center justify-center"
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6 fill-white" />
                            ) : (
                              <Play className="w-6 h-6 fill-white ml-0.5" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </motion.button>

                      {/* Next Track */}
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        title="Sonraki Şarkı"
                        className="p-1.5 rounded-xl text-white hover:text-white/80 transition-colors cursor-pointer"
                      >
                        <SkipForward className="w-5 h-5 fill-white stroke-white" />
                      </motion.button>

                      {/* Repeat Track */}
                      <motion.button
                        type="button"
                        onClick={handleToggleRepeat}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        title={isRepeat ? 'Tekrar Modu Açık' : 'Tekrar Çal'}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          isRepeat
                            ? 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Repeat className="w-4 h-4 stroke-[2.2]" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* ================= SELECTION & LIVE SEARCH MODE ================= */
                  <motion.div
                    key="search-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="relative z-10 flex flex-col gap-3"
                  >
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
                      {searchQuery.trim().length > 0 ? (
                        /* Live Search Mode Results */
                        (searchResults.length > 0 ? searchResults : PRESET_SONGS).map((song) =>
                          renderSongRow(song)
                        )
                      ) : (
                        /* Algorithmic Mode: Top 5 Personalized + Divider + Co-Listening */
                        <>
                          {/* 1. Header: Zevkine Göre Öneriler (Tam 5 Şarkı) */}
                          <div className="flex items-center justify-between px-1 py-0.5">
                            <span className="text-[11px] font-semibold text-white/75 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              Zevkine Göre Öneriler
                            </span>
                          </div>

                          {personalized5.map((song) => renderSongRow(song))}

                          {/* 2. Çizgi ve "[Şarkı] Dinleyenler Bunları da Dinledi" Bölümü */}
                          {coListeningTracks.length > 0 && lastFinishedTrack && (
                            <>
                              <div className="my-2 border-t border-white/10 mx-1" />
                              <div className="flex items-center justify-between px-1 py-0.5">
                                <span className="text-[11px] font-semibold text-white/75 flex items-center gap-1.5">
                                  <Users className="w-3 h-3 text-cyan-400" />
                                  {lastFinishedTrack.name} Dinleyenler Bunları da Dinledi
                                </span>
                              </div>
                              {coListeningTracks.map((song) => renderSongRow(song))}
                            </>
                          )}

                          {/* 3. Çizgi ve "Bugün Sizin İçin Seçtiklerimiz" Bölümü (Günlük Vitrin Seti) */}
                          {dailyPicks.length > 0 && (
                            <>
                              <div className="my-2 border-t border-white/10 mx-1" />
                              <div className="flex items-center justify-between px-1 py-0.5">
                                <span className="text-[11px] font-semibold text-white/75 flex items-center gap-1.5">
                                  <Compass className="w-3 h-3 text-cyan-400" />
                                  Bugün Sizin İçin Seçtiklerimiz
                                </span>
                              </div>
                              {dailyPicks.map((song) => renderSongRow(song))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
