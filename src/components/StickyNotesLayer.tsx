import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, CloudSun, X, Sparkles } from 'lucide-react';
import { StickyNote as StickyNoteType } from '../types/stickyNote';
import { WeatherWidgetData } from '../types/weatherWidget';
import { ThemeConfig } from '../types/countdown';
import { StickyNoteItem } from './StickyNoteItem';
import { WeatherWidgetCard } from './WeatherWidgetCard';
import { playPaperPageSound, playLiquidPopSound, playHoverClickSound } from '../utils/audio';

const STORAGE_NOTES_KEY = 'contto_sticky_notes';
const STORAGE_WIDGETS_KEY = 'contto_weather_widgets';

interface StickyNotesLayerProps {
  theme: ThemeConfig;
  isFullscreen: boolean;
  isFocusMode?: boolean;
}

interface SpawnPopupState {
  x: number;
  y: number;
}

export const StickyNotesLayer: React.FC<StickyNotesLayerProps> = ({
  theme,
  isFullscreen,
  isFocusMode = false,
}) => {
  // Load saved notes from LocalStorage
  const [notes, setNotes] = useState<StickyNoteType[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_NOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Load saved weather widgets from LocalStorage
  const [widgets, setWidgets] = useState<WeatherWidgetData[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_WIDGETS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Liquid + Frosted Glass spawn pop-up state
  const [spawnPopup, setSpawnPopup] = useState<SpawnPopupState | null>(null);
  const nextZIndexRef = useRef<number>(60);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch {
      // Ignore
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WIDGETS_KEY, JSON.stringify(widgets));
    } catch {
      // Ignore
    }
  }, [widgets]);

  // Bring note or widget to front
  const handleBringToFront = useCallback((id: string) => {
    nextZIndexRef.current += 1;
    const topZ = nextZIndexRef.current;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, zIndex: topZ } : n))
    );
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: topZ } : w))
    );
  }, []);

  // 1. Create Sticky Note
  const handleCreateNote = useCallback(
    (targetX?: number, targetY?: number) => {
      const noteWidth = 270;
      const noteHeight = 260;
      const pad = 16;

      let x = typeof targetX === 'number' ? targetX : window.innerWidth / 2 - noteWidth / 2;
      let y = typeof targetY === 'number' ? targetY : window.innerHeight / 2 - noteHeight / 2;

      x = Math.max(pad, Math.min(window.innerWidth - noteWidth - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - noteHeight - pad, y));

      nextZIndexRef.current += 1;

      const newNote: StickyNoteType = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x,
        y,
        width: noteWidth,
        height: noteHeight,
        content: '',
        zIndex: nextZIndexRef.current,
        createdAt: Date.now(),
      };

      setNotes((prev) => [...prev, newNote]);
      playPaperPageSound(0.28);
    },
    []
  );

  // 2. Create Square Rounded Weather Widget
  const handleCreateWeatherWidget = useCallback(
    (targetX?: number, targetY?: number) => {
      const size = 215;
      const pad = 16;

      let x = typeof targetX === 'number' ? targetX : window.innerWidth / 2 - size / 2;
      let y = typeof targetY === 'number' ? targetY : window.innerHeight / 2 - size / 2;

      x = Math.max(pad, Math.min(window.innerWidth - size - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - size - pad, y));

      nextZIndexRef.current += 1;

      const newWidget: WeatherWidgetData = {
        id: `weather-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x,
        y,
        size,
        zIndex: nextZIndexRef.current,
        createdAt: Date.now(),
      };

      setWidgets((prev) => [...prev, newWidget]);
      playHoverClickSound(0.12);
    },
    []
  );

  const handleUpdateNote = useCallback((id: string, updates: Partial<StickyNoteType>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleUpdateWidget = useCallback((id: string, updates: Partial<WeatherWidgetData>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const handleDeleteWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Double click listener: opens the liquid + frosted glass pop up at cursor coordinates
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      // Trigger in fullscreen or when interacting with canvas background
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't open if clicked on interactive elements, controls, or inside existing cards
      if (
        target.closest(
          'button, a, input, textarea, select, [role="button"], .sticky-note-window, .weather-widget-window, .no-sticky-create'
        )
      ) {
        return;
      }

      // Clamped coordinates for popup
      const popWidth = 230;
      const popHeight = 150;
      const pad = 16;

      const x = Math.max(pad, Math.min(window.innerWidth - popWidth - pad, e.clientX - 20));
      const y = Math.max(pad, Math.min(window.innerHeight - popHeight - pad, e.clientY - 20));

      setSpawnPopup({ x, y });
      playLiquidPopSound(0.22);
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, []);

  // Close popup with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && spawnPopup) {
        setSpawnPopup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spawnPopup]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Render all Sticky Notes */}
      {notes.map((note) => (
        <div key={note.id} className="pointer-events-auto">
          <StickyNoteItem
            note={note}
            theme={theme}
            isGlobalFocusMode={isFocusMode}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onAddAnother={(sx, sy) => handleCreateNote(sx, sy)}
            onBringToFront={handleBringToFront}
          />
        </div>
      ))}

      {/* 2. Render all Square Rounded Weather Widgets */}
      {widgets.map((widget) => (
        <div key={widget.id} className="pointer-events-auto weather-widget-window">
          <WeatherWidgetCard
            widget={widget}
            theme={theme}
            isGlobalFocusMode={isFocusMode}
            onUpdate={handleUpdateWidget}
            onDelete={handleDeleteWidget}
            onBringToFront={handleBringToFront}
          />
        </div>
      ))}

      {/* 3. Liquid + Frosted Glass Pop-up on Double Click */}
      <AnimatePresence>
        {spawnPopup && (
          <>
            {/* Invisible backdrop to dismiss on click outside */}
            <div
              className="fixed inset-0 z-40 pointer-events-auto cursor-default"
              onClick={() => setSpawnPopup(null)}
            />

            {/* Fluid Frosted Glass Modal Popup */}
            <motion.div
              key="liquid-frosted-popup"
              initial={{ opacity: 0, scale: 0.65, y: 12, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.75, y: 8, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 20, stiffness: 360 }}
              style={{
                left: `${spawnPopup.x}px`,
                top: `${spawnPopup.y}px`,
                boxShadow: `0 24px 50px -10px rgba(0,0,0,0.7), 0 0 25px -4px ${theme.glow}`,
              }}
              className="absolute z-50 pointer-events-auto w-[235px] rounded-3xl p-3 border border-white/25 backdrop-blur-3xl bg-neutral-900/80 text-white select-none shadow-2xl flex flex-col gap-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Liquid specular highlight on upper rim */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
              <div 
                className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundColor: theme.primary }}
              />

              {/* Header Title */}
              <div className="flex items-center justify-between px-1 pt-0.5">
                <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
                  Widget Ekle
                </span>
                <button
                  type="button"
                  onClick={() => setSpawnPopup(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Kapat (Esc)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Action Buttons: Morph into Sticky Note or Weather Widget */}
              <div className="flex flex-col gap-1.5 pt-0.5">
                {/* 1. Yapışkan Not (Morphs into Sticky Note) */}
                <button
                  type="button"
                  onClick={() => {
                    const coords = { x: spawnPopup.x, y: spawnPopup.y };
                    setSpawnPopup(null);
                    handleCreateNote(coords.x, coords.y);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all text-left cursor-pointer group active:scale-97"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: theme.primary,
                      color: '#0a0a0c',
                    }}
                  >
                    <StickyNote className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                      Not Oluştur
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      Yapışkan Not (Taşınabilir)
                    </span>
                  </div>
                </button>

                {/* 2. Hava Durumu Widget'ı (Morphs into Square Rounded Weather Widget) */}
                <button
                  type="button"
                  onClick={() => {
                    const coords = { x: spawnPopup.x, y: spawnPopup.y };
                    setSpawnPopup(null);
                    handleCreateWeatherWidget(coords.x, coords.y);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all text-left cursor-pointer group active:scale-97"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <CloudSun className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                      Hava Durumu
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      Kare Canlı Widget
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
