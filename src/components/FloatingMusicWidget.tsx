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
  X,
  VolumeX,
  ShieldAlert,
  GraduationCap,
  MapPin,
  RotateCw
} from 'lucide-react';
import { musicAudioEngine, PRESET_SONGS, SongTrack } from '../utils/musicAudioEngine';
import { extractAlbumColors } from '../utils/colorExtractor';
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

export function checkSchoolLocationDetected(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('countto_school_detected');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    const host = window.location.hostname.toLowerCase();
    if (host.includes('meb') || host.includes('k12') || host.includes('edu') || host.includes('okul')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const FloatingMusicWidget: React.FC<FloatingMusicWidgetProps> = ({
  themePrimary,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSchoolBlocked, setIsSchoolBlocked] = useState<boolean>(() => {
    return checkSchoolLocationDetected();
  });
  const [detectedLocationName, setDetectedLocationName] = useState<string>('Okul / Kampüs Alanı');
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

  // Global 'G' Key Listener: Instantly pauses audio and shows the black school restriction pop-up inside widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        // Instantly kill/pause music so not a single decibel leaks!
        musicAudioEngine.pause();
        setIsSchoolBlocked(true);
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRecheckLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          localStorage.setItem('countto_school_detected', 'false');
          setIsSchoolBlocked(false);
          setDetectedLocationName('Serbest Konum (Okul Dışı)');
        },
        () => {
          localStorage.setItem('countto_school_detected', 'false');
          setIsSchoolBlocked(false);
        },
        { timeout: 4000 }
      );
    } else {
      localStorage.setItem('countto_school_detected', 'false');
      setIsSchoolBlocked(false);
    }
  };
  
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
    if (isOpen && viewMode === 'player' && !isHovered && !isSchoolBlocked) {
      autoHideTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (isOpen && viewMode === 'player' && !isHovered && !isSchoolBlocked) {
      startAutoHideTimer();
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [isOpen, viewMode, isHovered, isSchoolBlocked]);

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
          const liveTracks: SongTrack[] = await Promise.all(
            data.results.map(async (r: any) => {
              const cover = (r.artworkUrl100 || '').replace('100x100bb', '600x600bb');
              const extracted = await extractAlbumColors(cover, r.trackName);
              return {
                id: `online-${r.trackId}`,
                name: r.trackName,
                artist: r.artistName,
                albumCover: cover,
                colors: extracted,
                youtubeId: '',
                audioUrl: r.previewUrl || '',
                durationSec: Math.floor((r.trackTimeMillis || 180000) / 1000),
              };
            })
          );
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

  const handleSelectTrack = async (track: SongTrack, pool?: SongTrack[]) => {
    if (pool && pool.length > 0) {
      musicAudioEngine.setActivePool(pool);
    }
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
  const [extractedColors, setExtractedColors] = useState<[string, string] | null>(null);

  useEffect(() => {
    if (activeTrack) {
      extractAlbumColors(activeTrack.albumCover, activeTrack.name).then((colors) => {
        setExtractedColors(colors);
        if (musicAudioEngine.currentTrack && musicAudioEngine.currentTrack.id === activeTrack.id) {
          musicAudioEngine.currentTrack.colors = colors;
        }
      });
    }
  }, [activeTrack?.id, activeTrack?.name, activeTrack?.albumCover]);

  const activeColors = hoveredTrack?.colors || extractedColors || activeTrack.colors || ['#dc2626', '#e11d48'];
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  // Reusable track row renderer preserving the exact clean UI design
  const renderSongRow = (song: SongTrack | DailyPickTrack, pool?: SongTrack[]) => {
    const isThisActive = currentTrack?.id === song.id;

    return (
      <div
        key={song.id}
        onMouseEnter={() => setHoveredTrack(song)}
        onMouseLeave={() => setHoveredTrack(null)}
        onClick={() => handleSelectTrack(song, pool)}
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
            handleSelectTrack(song, pool);
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
          if (checkSchoolLocationDetected()) {
            setIsSchoolBlocked(true);
            setIsOpen((prev) => !prev);
            return;
          }
          if (isSchoolBlocked) {
            setIsSchoolBlocked(false);
          }
          setIsOpen((prev) => !prev);
          if (!isOpen && !currentTrack) {
            setViewMode('search');
          }
        }}
        title={isSchoolBlocked ? 'Konumunuz Okulda Gözüküyor (Kısayol: G)' : isPlaying ? 'Müzik Çalıyor' : 'Müzik (Kısayol: G)'}
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
      </button>

      {/* 2. Frosted Glass Music Pop-up */}
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
            {isSchoolBlocked ? (
              /* ================= PURE BLACK LOCATION SCHOOL RESTRICTION VIEW ================= */
              <motion.div
                layout
                transition={{
                  layout: { type: 'spring', stiffness: 360, damping: 32 },
                }}
                className="relative w-[335px] sm:w-[355px] rounded-3xl p-5 bg-black text-white border border-neutral-800 shadow-[0_25px_60px_rgba(0,0,0,0.98)] overflow-hidden flex flex-col justify-between select-none"
              >
                {/* Header: Title + Close */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Konum Koruması
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    title="Kapat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Core Warning Content */}
                <div className="my-5 flex flex-col items-center text-center px-2">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3.5 shadow-inner">
                    <MapPin className="w-7 h-7 text-rose-500 stroke-[2.2]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Konumunuz Okulda Gözüküyor
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-[280px]">
                    Cihazınızın GPS ve ağ konumu bir eğitim kurumunda (okul/kampüs) bulunduğunuzu tespit etti. Okul kuralları ve ders disiplini gereğince bu alanda müzik çalma özelliği devre dışı bırakılmıştır.
                  </p>

                  <div className="mt-4 w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-300">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tespit Edilen Alan</span>
                    </span>
                    <span className="font-semibold text-neutral-200">{detectedLocationName}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-neutral-500 font-mono">
                    Kısayol: 'G' tuşu ile hızlı gizleme
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Tamam, Derse Dön</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRecheckLocation}
                    className="w-full py-1.5 px-3 rounded-lg text-neutral-500 hover:text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="Okul dışındaysanız konumu yeniden doğrular"
                  >
                    <RotateCw className="w-3 h-3 text-neutral-500" />
                    <span>Okul Dışındayım (Konumu Doğrula)</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Frosted Glass Slab: Animated layout transition smoothly resizes card between Search and Player modes */
              <motion.div
                layout
                transition={{
                  layout: { type: 'spring', stiffness: 360, damping: 32 },
                }}
                className="relative w-[335px] sm:w-[355px] rounded-3xl p-4 sm:p-5 backdrop-blur-3xl bg-[#131318]/92 text-white border border-white/15 overflow-hidden transition-all duration-1000 ease-out"
                style={{
                  boxShadow: `0 24px 60px -10px rgba(0,0,0,0.85), 0 0 40px -6px ${activeColors[0]}55, inset 0 1px 1px rgba(255,255,255,0.2)`
                }}
              >
              
              {/* Dynamic Color Mixing Ambient Glow Canvas */}
              <div 
                className="absolute -top-14 -left-14 w-56 h-56 rounded-full blur-3xl opacity-35 transition-all duration-1000 ease-out pointer-events-none"
                style={{ backgroundColor: activeColors[0] }}
              />
              <div 
                className="absolute -bottom-14 -right-14 w-56 h-56 rounded-full blur-3xl opacity-45 transition-all duration-1000 ease-out pointer-events-none"
                style={{ backgroundColor: activeColors[1] }}
              />

              {/* Dynamic Album Ambient Radial Aura */}
              <div 
                className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-1000 ease-out"
                style={{
                  background: `radial-gradient(circle at 85% 85%, ${activeColors[1]} 0%, transparent 65%)`
                }}
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
                          renderSongRow(song, searchResults.length > 0 ? searchResults : PRESET_SONGS)
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

                          {personalized5.map((song) => renderSongRow(song, personalized5))}

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
                              {coListeningTracks.map((song) => renderSongRow(song, coListeningTracks))}
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
                              {dailyPicks.map((song) => renderSongRow(song, dailyPicks))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};
