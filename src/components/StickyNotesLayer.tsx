import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StickyNote as StickyNoteType } from '../types/stickyNote';
import { WeatherWidgetData } from '../types/weatherWidget';
import { ThemeConfig } from '../types/countdown';
import { StickyNoteItem } from './StickyNoteItem';
import { WeatherWidgetCard } from './WeatherWidgetCard';
import { playPaperPageSound, playHoverClickSound } from '../utils/audio';

const STORAGE_NOTES_KEY = 'contto_sticky_notes';
const STORAGE_WIDGETS_KEY = 'contto_weather_widgets';

interface StickyNotesLayerProps {
  theme: ThemeConfig;
  isFullscreen: boolean;
  isFocusMode?: boolean;
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

  // Create Sticky Note
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

  // Double click listener: Directly creates a sticky note at cursor position (eskisi gibi direkt yapışkan not)
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't spawn if clicked on interactive elements, controls, or inside existing cards
      if (
        target.closest(
          'button, a, input, textarea, select, [role="button"], .sticky-note-window, .weather-widget-window, .no-sticky-create'
        )
      ) {
        return;
      }

      // Directly create sticky note at double-click coordinates
      handleCreateNote(e.clientX - 20, e.clientY - 16);
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [handleCreateNote]);

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
        <div key={widget.id} className="pointer-events-auto">
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
    </div>
  );
};
