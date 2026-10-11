import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountdownEvent, CountdownStyle, ThemeId, TimeRemaining } from './types/countdown';
import { THEMES } from './utils/themes';
import { calculateTimeRemaining, getDefaultPresets } from './utils/time';
import { 
  playTickSound, 
  playCelebrationChime, 
  playThemeSound,
  startAmbientMusic,
  stopAmbientMusic 
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
import { DesignedForEverywhereView } from './components/DesignedForEverywhereView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

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

const isDesignedForEverywherePage = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/designedforeverywhere' ||
    path === '/designedforeverywhere/' ||
    path.endsWith('/designedforeverywhere') ||
    path.endsWith('/designedforeverywhere/') ||
    search.includes('designedforeverywhere') ||
    hash.includes('designedforeverywhere')
  );
};

export default function App() {
  // Check if user is navigating to special showcase routes
  const [isBestExperience, setIsBestExperience] = useState<boolean>(isBestExperiencePage);
  const [isDesignedForEverywhere, setIsDesignedForEverywhere] = useState<boolean>(isDesignedForEverywherePage);

  useEffect(() => {
    const handlePopState = () => {
      setIsBestExperience(isBestExperiencePage());
      setIsDesignedForEverywhere(isDesignedForEverywherePage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isBestExperience) {
    return <TheBestExperienceView />;
  }

  if (isDesignedForEverywhere) {
    return <DesignedForEverywhereView />;
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
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((e: CountdownEvent) => 
              e.id === 'preset-new-year' && e.style === 'flip' ? { ...e, style: 'countTo' } : e
            );
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
    return events[0]?.id || 'preset-new-year';
  });

  const [activeView, setActiveView] = useState<'display' | 'list' | 'themes'>('display');
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

  // Real-time ticker effect
  useEffect(() => {
    // Reset celebration state if target date changed
    hasCelebratedRef.current = calculateTimeRemaining(activeEvent.targetDate, activeEvent.createdAt).isPast;

    const intervalTime = activeEvent.showMilliseconds ? 40 : 250;

    const timer = setInterval(() => {
      const updated = calculateTimeRemaining(activeEvent.targetDate, activeEvent.createdAt);
      setTimeRemaining(updated);

      // Play tick sound when seconds change
      if (soundEnabled && updated.seconds !== prevSecondsRef.current && !updated.isPast) {
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

      // 5b. Ambient acoustic guitar music toggle ('a')
      if (key === 'a') {
        e.preventDefault();
        setAmbientEnabled((prev) => !prev);
        return;
      }

      // 6. Milliseconds toggle ('m')
      if (key === 'm') {
        e.preventDefault();
        handleToggleMilliseconds();
        return;
      }

      // 7. Edit active countdown ('e')
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
  ]);

  return (
    <div className={`min-h-screen relative flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300 ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
      {/* Dynamic Animated Ambient Canvas & Mesh */}
      <AmbientBackground theme={currentTheme} />

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
      <main className={`flex-1 flex flex-col justify-center items-center relative z-10 w-full mx-auto ${isFullscreen ? 'h-full max-w-none px-4 py-0' : 'max-w-7xl px-4 overflow-hidden'}`}>
        <AnimatePresence mode="wait">
          {activeView === 'display' && (
            <motion.div
              key="display"
              initial={{ opacity: 0, x: -32, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 32, filter: 'blur(3px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
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
                ambientEnabled={ambientEnabled}
                onToggleAmbient={() => setAmbientEnabled((prev) => !prev)}
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
              <span className="font-semibold text-neutral-400">ContTo</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Dinamik & Minimalist Zaman Sayacı</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500">
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
    </div>
  );
}
