import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StickyNote } from '../types/stickyNote';
import { ThemeConfig } from '../types/countdown';
import { StickyNoteItem } from './StickyNoteItem';
import { playPaperPageSound } from '../utils/audio';

const STORAGE_KEY = 'contto_sticky_notes';

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
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const nextZIndexRef = useRef<number>(50);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore
    }
  }, [notes]);

  // Bring a note to front
  const handleBringToFront = useCallback((id: string) => {
    nextZIndexRef.current += 1;
    const topZ = nextZIndexRef.current;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, zIndex: topZ } : n))
    );
  }, []);

  // Create a new sticky note with realistic paper page rustle sound
  const handleCreateNote = useCallback(
    (targetX?: number, targetY?: number) => {
      const noteWidth = 270;
      const noteHeight = 260;
      const pad = 16;

      let x = typeof targetX === 'number' ? targetX : window.innerWidth / 2 - noteWidth / 2;
      let y = typeof targetY === 'number' ? targetY : window.innerHeight / 2 - noteHeight / 2;

      // Clamp coordinates within visible viewport
      x = Math.max(pad, Math.min(window.innerWidth - noteWidth - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - noteHeight - pad, y));

      nextZIndexRef.current += 1;

      const newNote: StickyNote = {
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

  const handleUpdateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Double click listener: When in fullscreen, double-clicking anywhere on the screen creates a sticky note
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      // Only active when in fullscreen as requested
      if (!isFullscreen) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't spawn note if double clicking on buttons, inputs, links, or inside existing sticky notes
      if (
        target.closest(
          'button, a, input, textarea, select, [role="button"], .sticky-note-window, .no-sticky-create'
        )
      ) {
        return;
      }

      // Create note at double-click location
      handleCreateNote(e.clientX - 20, e.clientY - 16);
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [isFullscreen, handleCreateNote]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
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
    </div>
  );
};
