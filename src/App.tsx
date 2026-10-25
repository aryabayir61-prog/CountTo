import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountdownEvent, CountdownStyle, ThemeId, TimeRemaining } from './types/countdown';
import { THEMES } from './utils/themes';
import { calculateTimeRemaining, getDefaultPresets, getTurkeyTime } from './utils/time';
import { 
  playTickSound, 
  playCelebrationChime, 
  playThemeSound,
  playHoverClickSound,
  startAmbientMusic,
  stopAmbientMusic,
  playWeatherNotificationSound,
  playWeatherExitSound,
  playHourlyChimeSound 
} from './utils/audio';
import { fireCelebrationConfetti } from './utils/confetti';
import { AmbientBackground } from './components/AmbientBackground';
import { TopNav } from './components/TopNav';
import { CountdownDisplay } from './components/CountdownDisplay';
import { CountdownList } from './components/CountdownList';
import { ThemesView } from './components/ThemesView';
import { CountdownModal } from './components/CountdownModal';
import { ShareModal } from './components/ShareModal';
import { TheBestExperienceView } from './components/TheBestExperienceView';
import { WeatherDevBlogView } from './components/WeatherDevBlogView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FullscreenWeatherToast } from './components/FullscreenWeatherToast';
import { StickyNotesLayer } from './components/StickyNotesLayer';
import { RainEffectCanvas } from './components/RainEffectCanvas';
import { MusicView } from './components/MusicView';
import { SpotifyPlayerBar } from './components/SpotifyPlayerBar';
import { SpotifyTrack } from './types/music';
import { SPOTIFY_TRACKS } from './utils/spotifyCatalog';
import { isFavoriteTrack, toggleFavoriteTrack } from './utils/musicRecommendationEngine';
import { getRealUserCoordinates, fetchRealWeather, RealWeatherNotification } from './utils/weatherService';
import { audioPlayer } from './utils/audioPlayerManager';

const STORAGE_KEY = 'contto_saved_events_v1';
const SOUND_KEY = 'contto_sound_enabled';

const isBestExperiencePage = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/thebestexperience' ||
    path === '/thebestexperience/' ||
    path.endsWith('/thebestexperience') ||
    path.endsWith('/thebestexperience/') ||
    search.includes('thebestexperience') ||
    hash.includes('thebestexperience')
  );
};

const isWeatherDevBlogPage = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/weathernotifications' ||
    path === '/weathernotifications/' ||
    path.endsWith('/weathernotifications') ||
    path.endsWith('/weathernotifications/') ||
    path.includes('weathernotifications') ||
    search.includes('weathernotifications') ||
    hash.includes('weathernotifications')
  );
};

export default function App() {
  // Check if user is navigating to special routes
  const [isBestExperience, setIsBestExperience] = useState<boolean>(isBestExperiencePage);
  const [isWeatherDevBlog, setIsWeatherDevBlog] = useState<boolean>(isWeatherDevBlogPage);

  useEffect(() => {
    const handlePopState = () => {
      setIsBestExperience(isBestExperiencePage());
      setIsWeatherDevBlog(isWeatherDevBlogPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isWeatherDevBlog) {
    return <WeatherDevBlogView />;
  }

  if (isBestExperience) {
    return <TheBestExperienceView />;
  }
  // Load events from LocalStorage or URL parameters or default presets
  const [events, setEvents] = useState<CountdownEvent[]>(() => {
    // 1. Check if URL contains shared parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTitle = params.get('title');
      const urlTarget = params.get('target');
      if (urlTitle && urlTarget) {
        const sharedEvent: CountdownEvent = {
          id: `shared-${Date.now()}`,
          title: urlTitle,
          targetDate: urlTarget,
          createdAt: new Date().toISOString(),
          style: (params.get('style') as CountdownStyle) || 'countTo',
          theme: (params.get('theme') as ThemeId) || 'aurora',
          notes: params.get('notes') || undefined,
          category: 'genel',
          showMilliseconds: false,
        };
        return [sharedEvent, ...getDefaultPresets()];
      }

      // 2. Check localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CountdownEvent[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            let loaded: CountdownEvent[] = parsed.map((e) => 
              e.id === 'preset-new-year' && e.style === 'flip' ? { ...e, style: 'countTo' as const } : e
            );
            if (!loaded.some((e) => e.id === 'preset-current-time')) {
              const currentTimePreset = getDefaultPresets().find((p) => p.id === 'preset-current-time');
              if (currentTimePreset) {
                loaded = [currentTimePreset, ...loaded];
              }
            }
            return loaded;
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // 3. Fallback to rich starter presets
    return getDefaultPresets();
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    const newYear = events.find((e) => e.id === 'preset-new-year');
    return newYear ? newYear.id : (events[0]?.id || 'preset-current-time');
  });

  const [activeView, setActiveView] = useState<'display' | 'list' | 'themes' | 'music'>('display');
  const [activeSpotifyTrack, setActiveSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState<boolean>(false);
  const [favMusicVersion, setFavMusicVersion] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SOUND_KEY) === 'true';
    }
    return false;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CountdownEvent | null>(null);
  const [sharingEvent, setSharingEvent] = useState<CountdownEvent | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [weatherNotification, setWeatherNotification] = useState<RealWeatherNotification | null>(null);
  const lastWeatherShowRef = useRef<number>(0);
  const [isVertical, setIsVertical] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('countto_orientation_vertical') === 'true';
    }
    return false;
  });
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isRainThemeActive, setIsRainThemeActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('contto_rain_theme_enabled') === 'true';
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('contto_rain_theme_enabled', String(isRainThemeActive));
    } catch {
      // Ignore
    }
  }, [isRainThemeActive]);

  // Request real location permission on application startup
  useEffect(() => {
    getRealUserCoordinates();
  }, []);

  const handleToggleVertical = useCallback(() => {
    setIsVertical((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('countto_orientation_vertical', String(next));
      }
      return next;
    });
    playHoverClickSound(0.09);
  }, []);

  // Active event object
  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0] || getDefaultPresets()[0];
  }, [events, activeEventId]);

  const currentTheme = THEMES[activeEvent.theme] || THEMES.aurora;

  // Real-time time remaining state
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(activeEvent.targetDate, activeEvent.createdAt)
  );

  const prevSecondsRef = useRef<number>(timeRemaining.seconds);
  const prevHourRef = useRef<number>(-1);
  const hasCelebratedRef = useRef<boolean>(timeRemaining.isPast);

  // Persistent storage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage quota or private browsing
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Ambient infinite music state (persisted)
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('contto_ambient_music_enabled') === 'true';
  });

  useEffect(() => {
    try {
      localStorage.setItem('contto_ambient_music_enabled', String(ambientEnabled));
    } catch {
      // Ignore
    }
  }, [ambientEnabled]);

  // Infinite ambient sound lifecycle
  useEffect(() => {
    if (ambientEnabled) {
      startAmbientMusic(activeEvent.theme);
    } else {
      stopAmbientMusic();
    }
  }, [ambientEnabled, activeEvent.theme]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const lastNotifiedMessageRef = useRef<string>('');

  // Continuous real-time weather monitoring & proactive forecast alerts in fullscreen
  useEffect(() => {
    let isCancelled = false;

    const checkWeatherAlerts = async (isInitial = false) => {
      if (isCancelled || !isFullscreen) return;

      const weather = await fetchRealWeather(isInitial);
      if (!weather || isCancelled) return;

      const now = Date.now();
      const isNewCondition = weather.message !== lastNotifiedMessageRef.current;
      const cooldownPassed = now - lastWeatherShowRef.current > 4 * 60 * 1000;
      const spacingPassed = now - lastWeatherShowRef.current > 2 * 60 * 1000;

      // Proactive alert on initial entry or when genuine condition transition is predicted
      if ((isInitial && cooldownPassed) || (isNewCondition && spacingPassed)) {
        lastWeatherShowRef.current = now;
        lastNotifiedMessageRef.current = weather.message;
        setWeatherNotification(weather);
        playWeatherNotificationSound(activeEvent.theme);

        setTimeout(() => {
          if (!isCancelled) {
            playWeatherExitSound(activeEvent.theme);
            setWeatherNotification(null);
          }
        }, 7500);
      }
    };

    if (isFullscreen) {
      // 1.8s delay upon entering fullscreen for smooth graceful arrival
      const initialTimer = setTimeout(() => {
        checkWeatherAlerts(true);
      }, 1800);

      // Periodically check every 2.5 minutes in real-time
      const monitorInterval = setInterval(() => {
        checkWeatherAlerts(false);
      }, 2.5 * 60 * 1000);

      return () => {
        isCancelled = true;
        clearTimeout(initialTimer);
        clearInterval(monitorInterval);
      };
    } else {
      setWeatherNotification(null);
    }
  }, [isFullscreen, activeEvent.theme, soundEnabled]);

  // Real-time ticker effect
  useEffect(() => {
    // Reset celebration state if target date changed
    hasCelebratedRef.current = calculateTimeRemaining(activeEvent.targetDate, activeEvent.createdAt).isPast;

    const intervalTime = activeEvent.showMilliseconds ? 40 : 250;

    const timer = setInterval(() => {
      const updated = calculateTimeRemaining(activeEvent.targetDate, activeEvent.createdAt);
      setTimeRemaining(updated);

      if (updated.isPast) {
        // Turkey Time (Europe/Istanbul UTC+3) is actively displayed
        const tr = getTurkeyTime();

        // 1. Clock tick sound on every second
        if (soundEnabled && tr.seconds !== prevSecondsRef.current) {
          playTickSound(0.06);

          // 2. Majestic hourly chime at top of the hour (00:00)
          if (tr.minutes === 0 && tr.seconds === 0 && tr.hours !== prevHourRef.current) {
            playHourlyChimeSound(tr.hours, activeEvent.theme, 0.24);
            prevHourRef.current = tr.hours;
          }
        }

        if (tr.minutes !== 0) {
          prevHourRef.current = -1;
        }

        prevSecondsRef.current = tr.seconds;
      } else {
        // Active countdown is ticking
        if (soundEnabled && updated.seconds !== prevSecondsRef.current) {
          playTickSound(0.06);
        }
        prevSecondsRef.current = updated.seconds;

        // Celebrate arrival
        if (updated.isPast && !hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          fireCelebrationConfetti();
          if (soundEnabled) {
            playCelebrationChime(0.2);
          }
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeEvent, soundEnabled]);

  // Handlers
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        playTickSound(0.08);
      }
      return next;
    });
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  };

  const handleChangeStyle = (newStyle: CountdownStyle) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === activeEvent.id ? { ...e, style: newStyle } : e))
    );
  };

  const handleToggleMilliseconds = () => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === activeEvent.id ? { ...e, showMilliseconds: !e.showMilliseconds } : e
      )
    );
  };

  const handleSelectTheme = (newTheme: ThemeId) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === activeEvent.id ? { ...e, theme: newTheme } : e))
    );
    playThemeSound(newTheme);
  };

  const handleSaveEvent = (data: Partial<CountdownEvent>) => {
    if (data.id) {
      // Update existing
      setEvents((prev) =>
        prev.map((e) => (e.id === data.id ? ({ ...e, ...data } as CountdownEvent) : e))
      );
    } else {
      // Create new
      const newEvent: CountdownEvent = {
        id: `ev-${Date.now()}`,
        title: data.title || 'Yeni Geri Sayım',
        targetDate: data.targetDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        style: data.style || 'countTo',
        theme: data.theme || 'aurora',
        notes: data.notes,
        category: data.category || 'genel',
        showMilliseconds: data.showMilliseconds || false,
      };
      setEvents((prev) => [newEvent, ...prev]);
      setActiveEventId(newEvent.id);
      setActiveView('display');
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => {
      const remaining = prev.filter((e) => e.id !== id);
      if (remaining.length === 0) {
        const fallback = getDefaultPresets();
        setActiveEventId(fallback[0].id);
        return fallback;
      }
      if (activeEventId === id) {
        setActiveEventId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleCelebrateAgain = () => {
    fireCelebrationConfetti();
    playCelebrationChime(0.25);
  };

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setIsSpotifyPlaying(state.isPlaying);
      if (state.track) {
        setActiveSpotifyTrack(state.track);
      }
    });

    audioPlayer.setOnTrackEnded(() => {
      handleNextSpotifyTrack();
    });

    return unsubscribe;
  }, [activeSpotifyTrack]);

  const handlePlaySpotifyTrack = (track: SpotifyTrack) => {
    setActiveSpotifyTrack(track);
    setIsSpotifyPlaying(true);
    audioPlayer.playTrack(track);
    if (ambientEnabled) {
      setAmbientEnabled(false);
    }
  };

  const handleToggleSpotifyPlay = () => {
    audioPlayer.togglePlay();
  };

  const handleNextSpotifyTrack = () => {
    if (!activeSpotifyTrack) {
      handlePlaySpotifyTrack(SPOTIFY_TRACKS[0]);
      return;
    }
    const idx = SPOTIFY_TRACKS.findIndex((t) => t.id === activeSpotifyTrack.id);
    const nextIdx = (idx + 1) % SPOTIFY_TRACKS.length;
    handlePlaySpotifyTrack(SPOTIFY_TRACKS[nextIdx]);
  };

  const handlePreviousSpotifyTrack = () => {
    if (!activeSpotifyTrack) {
      handlePlaySpotifyTrack(SPOTIFY_TRACKS[0]);
      return;
    }
    const idx = SPOTIFY_TRACKS.findIndex((t) => t.id === activeSpotifyTrack.id);
    const prevIdx = (idx - 1 + SPOTIFY_TRACKS.length) % SPOTIFY_TRACKS.length;
    handlePlaySpotifyTrack(SPOTIFY_TRACKS[prevIdx]);
  };

  const handleToggleSpotifyFavorite = (track: SpotifyTrack) => {
    toggleFavoriteTrack(track);
    setFavMusicVersion((prev) => prev + 1);
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore default system shortcuts with Ctrl / Meta / Alt
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // 1. Modal close / escape priority
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          return;
        }
        if (isModalOpen) {
          setIsModalOpen(false);
          setEditingEvent(null);
          return;
        }
        if (sharingEvent) {
          setSharingEvent(null);
          return;
        }
        if (activeView !== 'display') {
          setActiveView('display');
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          return;
        }
        return;
      }

      // Do not trigger other actions if a modal is open
      if (isModalOpen || Boolean(sharingEvent)) {
        return;
      }

      // 2. Fullscreen shortcut ('f')
      if (key === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      // 3. Themes page shortcut ('t')
      if (key === 't') {
        e.preventDefault();
        setActiveView((v) => (v === 'themes' ? 'display' : 'themes'));
        return;
      }

      // 4. New countdown shortcut ('n')
      if (key === 'n') {
        e.preventDefault();
        setEditingEvent(null);
        setIsModalOpen(true);
        return;
      }

      // 5. Sound toggle ('s')
      if (key === 's') {
        e.preventDefault();
        handleToggleSound();
        return;
      }

      // 6. Milliseconds toggle ('m')
      if (key === 'm') {
        e.preventDefault();
        handleToggleMilliseconds();
        return;
      }

      // 7. Orientation toggle ('v' for vertical/horizontal)
      if (key === 'v') {
        e.preventDefault();
        handleToggleVertical();
        return;
      }

      // 8. Edit active countdown ('e')
      if (key === 'e') {
        e.preventDefault();
        setEditingEvent(activeEvent);
        setIsModalOpen(true);
        return;
      }

      // 8. Events list shortcut ('l')
      if (key === 'l') {
        e.preventDefault();
        setActiveView((v) => (v === 'list' ? 'display' : 'list'));
        return;
      }

      // 9. Music page shortcut ('u')
      if (key === 'u') {
        e.preventDefault();
        setActiveView((v) => (v === 'music' ? 'display' : 'music'));
        return;
      }

      // 9. Quick animation style change ('1' - '5')
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const styleMap: Record<string, CountdownStyle> = {
          '1': 'countTo',
          '2': 'flip',
          '3': 'orbital',
          '4': 'kinetic',
          '5': 'monolith',
        };
        const chosen = styleMap[e.key];
        if (chosen) {
          handleChangeStyle(chosen);
        }
        return;
      }

      // 10. Help modal ('?' or '/')
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isShortcutsOpen,
    isModalOpen,
    sharingEvent,
    activeView,
    activeEvent,
    handleToggleVertical,
  ]);

  const handleDismissWeather = () => {
    playWeatherExitSound(activeEvent.theme);
    setWeatherNotification(null);
  };

  return (
    <div className={`min-h-screen relative flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300 ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
      {/* Dynamic Animated Ambient Canvas & Mesh */}
      <AmbientBackground theme={currentTheme} />

      {/* Realistic Physical Rain Theme Canvas with Collision & Splashing */}
      {isRainThemeActive && <RainEffectCanvas />}

      {/* Top Bar Contract (hidden in fullscreen cinema mode for ultimate immersion) */}
      {!isFullscreen && (
        <TopNav
          currentTheme={activeEvent.theme}
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          onOpenCreateModal={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Main Content Area with Smooth Horizontal Slide Transition */}
      <main className={`flex-1 flex flex-col justify-center relative z-10 w-full ${
        isFullscreen 
          ? 'h-full max-w-none px-2 sm:px-4 py-0' 
          : isVertical 
            ? 'max-w-none px-2 sm:px-6 overflow-hidden' 
            : 'max-w-7xl px-4 mx-auto items-center overflow-hidden'
      }`}>
        <AnimatePresence mode="wait">
          {activeView === 'display' && (
            <motion.div
              key="display"
              initial={{ opacity: 0, x: -32, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 32, filter: 'blur(3px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full flex ${isVertical ? 'justify-start items-start' : 'justify-center items-center'}`}
            >
              <CountdownDisplay
                event={activeEvent}
                time={timeRemaining}
                theme={currentTheme}
                soundEnabled={soundEnabled}
                isFullscreen={isFullscreen}
                onToggleSound={handleToggleSound}
                onToggleFullscreen={handleToggleFullscreen}
                onChangeStyle={handleChangeStyle}
                onEdit={() => {
                  setEditingEvent(activeEvent);
                  setIsModalOpen(true);
                }}
                onShare={() => setSharingEvent(activeEvent)}
                onToggleMilliseconds={handleToggleMilliseconds}
                onCelebrateAgain={handleCelebrateAgain}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
                isVertical={isVertical}
                onToggleVertical={handleToggleVertical}
                onTestChime={() => playHourlyChimeSound(getTurkeyTime().hours, activeEvent.theme, 0.24)}
                onFocusModeChange={setIsFocusMode}
              />
            </motion.div>
          )}

          {activeView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 32, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -32, filter: 'blur(3px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
            >
              <CountdownList
                events={events}
                activeEventId={activeEventId}
                theme={currentTheme}
                onSelectEvent={(id) => {
                  setActiveEventId(id);
                  setActiveView('display');
                }}
                onEditEvent={(event) => {
                  setEditingEvent(event);
                  setIsModalOpen(true);
                }}
                onDeleteEvent={handleDeleteEvent}
                onOpenCreateModal={() => {
                  setEditingEvent(null);
                  setIsModalOpen(true);
                }}
                onShareEvent={(event) => setSharingEvent(event)}
              />
            </motion.div>
          )}

          {activeView === 'themes' && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, x: 32, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -32, filter: 'blur(3px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
            >
              <ThemesView
                currentTheme={activeEvent.theme}
                onSelectTheme={handleSelectTheme}
                onBackToDisplay={() => setActiveView('display')}
                ambientEnabled={ambientEnabled}
                onToggleAmbient={() => setAmbientEnabled((prev) => !prev)}
                isRainThemeActive={isRainThemeActive}
                onToggleRainTheme={() => setIsRainThemeActive((prev) => !prev)}
              />
            </motion.div>
          )}

          {activeView === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, x: 32, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -32, filter: 'blur(3px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
            >
              <MusicView
                activeTrack={activeSpotifyTrack}
                isPlaying={isSpotifyPlaying}
                onPlayTrack={handlePlaySpotifyTrack}
                onTogglePlay={handleToggleSpotifyPlay}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Clean, Quiet Footer */}
      {!isFullscreen && (
        <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-xs text-neutral-500 relative z-10 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-neutral-400">CountTo</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Dinamik & Minimalist Zaman Sayacı</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500">
              <a
                href="/weathernotifications"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/weathernotifications');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Hava Durumu DevBlog →
              </a>
              <span aria-hidden="true">·</span>
              <span>{events.length} Kayıtlı Geri Sayım</span>
              <span aria-hidden="true">·</span>
              <span>Yerel Depolama & Çevrimdışı Uyumlu</span>
            </div>
          </div>
        </footer>
      )}

      {/* Create / Edit Modal */}
      <CountdownModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={Boolean(sharingEvent)}
        onClose={() => setSharingEvent(null)}
        event={sharingEvent}
      />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={currentTheme}
      />

      {/* Real Weather Fullscreen Notification Toast */}
      {/* Real Weather Fullscreen Notification Toast (Always mounted for smooth exit animation) */}
      <FullscreenWeatherToast
        notification={isFullscreen ? weatherNotification : null}
        onDismiss={handleDismissWeather}
      />

      {/* Sticky Notes Layer */}
      <StickyNotesLayer
        theme={currentTheme}
        isFullscreen={isFullscreen}
        isFocusMode={isFocusMode}
      />

      {/* Rectangular Mini Player Bar */}
      <SpotifyPlayerBar
        track={activeSpotifyTrack}
        isPlaying={isSpotifyPlaying}
        onTogglePlay={handleToggleSpotifyPlay}
        onNext={handleNextSpotifyTrack}
        onPrevious={handlePreviousSpotifyTrack}
        onToggleFavorite={handleToggleSpotifyFavorite}
        isFavorite={Boolean(activeSpotifyTrack && isFavoriteTrack(activeSpotifyTrack.id))}
        isFullscreen={isFullscreen}
        isFocusMode={isFocusMode}
        onClose={() => {
          audioPlayer.stop();
          setIsSpotifyPlaying(false);
          setActiveSpotifyTrack(null);
        }}
      />
    </div>
  );
}
