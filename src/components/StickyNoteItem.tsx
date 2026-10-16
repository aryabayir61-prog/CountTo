import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreHorizontal, X, Bold, Italic, Underline, Palette, Check } from 'lucide-react';
import { StickyNote } from '../types/stickyNote';
import { ThemeConfig } from '../types/countdown';
import { playPaperTearSound } from '../utils/audio';

interface StickyNoteItemProps {
  note: StickyNote;
  theme: ThemeConfig;
  isGlobalFocusMode?: boolean;
  onUpdate: (id: string, updates: Partial<StickyNote>) => void;
  onDelete: (id: string) => void;
  onAddAnother: (sourceX: number, sourceY: number) => void;
  onBringToFront: (id: string) => void;
}

const PRESET_COLORS = [
  { id: 'theme', name: 'Tema Rengi', color: '' },
  { id: 'yellow', name: 'Sarı', color: '#eab308' },
  { id: 'emerald', name: 'Yeşil', color: '#10b981' },
  { id: 'pink', name: 'Pembe', color: '#ec4899' },
  { id: 'violet', name: 'Mor', color: '#8b5cf6' },
  { id: 'cyan', name: 'Camgöbeği', color: '#06b6d4' },
  { id: 'charcoal', name: 'Koyu Gri', color: '#4b5563' },
];

export const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  note,
  theme,
  isGlobalFocusMode = false,
  onUpdate,
  onDelete,
  onAddAnother,
  onBringToFront,
}) => {
  const [isTearing, setIsTearing] = useState<boolean>(false);
  const [showColorMenu, setShowColorMenu] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Effective header color: custom chosen color or active theme primary
  const headerColor = note.color || theme.primary;

  // Determine header text color (black for bright yellow/amber/lime, white for dark)
  const isLightHeader =
    ['#eab308', '#f59e0b', '#84cc16'].includes(headerColor) ||
    headerColor.toLowerCase() === '#eab308' ||
    (theme.id === 'gold' && !note.color);

  const headerTextColor = isLightHeader ? '#1a1a1a' : '#ffffff';

  // In focus mode, controls are smoothly hidden unless the user hovers over the note or focuses it to edit
  const isControlsHidden = Boolean(
    isGlobalFocusMode && !isHovered && !isEditorFocused && !showColorMenu && !isDragging
  );

  // Synchronize initial content and auto-focus if newly created
  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.innerHTML !== note.content) {
        contentRef.current.innerHTML = note.content;
      }
      // If note was created within the last 1.5 seconds and has empty content, focus it
      if (Date.now() - note.createdAt < 1500 && !note.content) {
        contentRef.current.focus();
      }
    }
  }, []);

  // Dragging logic via pointer events on header
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Prevent dragging if clicked on interactive buttons inside header
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"], input')) {
      return;
    }

    onBringToFront(note.id);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: note.x,
      startY: note.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;

      // Constrain position within window boundaries
      const noteWidth = note.width || 270;
      const noteHeight = note.height || 260;
      const maxX = Math.max(0, window.innerWidth - noteWidth);
      const maxY = Math.max(0, window.innerHeight - 48);

      const nextX = Math.max(0, Math.min(maxX, dragStartRef.current.startX + dx));
      const nextY = Math.max(0, Math.min(maxY, dragStartRef.current.startY + dy));

      onUpdate(note.id, { x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Close with realistic paper tear sound and visual ripping animation
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTearing) return;

    setIsTearing(true);
    playPaperTearSound(0.35);

    // Give time for paper tearing animation before unmounting
    setTimeout(() => {
      onDelete(note.id);
    }, 420);
  };

  // Rich text formatting actions
  const applyFormat = (command: string) => {
    document.execCommand(command, false);
    if (contentRef.current) {
      onUpdate(note.id, { content: contentRef.current.innerHTML });
    }
  };

  const handleInput = () => {
    if (contentRef.current) {
      onUpdate(note.id, { content: contentRef.current.innerHTML });
    }
  };

  // Jagged rip paper clip-paths for torn halves
  const ripPathLeft =
    'polygon(0% 0%, 53% 0%, 48% 12%, 54% 24%, 47% 38%, 53% 52%, 46% 67%, 54% 82%, 48% 100%, 0% 100%)';
  const ripPathRight =
    'polygon(53% 0%, 100% 0%, 100% 100%, 48% 100%, 54% 82%, 46% 67%, 53% 52%, 47% 38%, 54% 24%, 48% 12%)';

  // Render note interior (used both for normal rendering and for the split halves during tearing)
  const renderNoteContent = (readOnly = false) => (
    <div className="flex flex-col h-full bg-[#1e1e24] text-neutral-100 select-text overflow-hidden rounded-xl shadow-2xl border border-white/10 transition-colors duration-300">
      {/* Top Header Bar: Collapses smoothly into a clean slim accent stripe in Focus Mode */}
      <div
        className={`flex items-center justify-between px-2 select-none overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isControlsHidden && !readOnly ? 'h-2 py-0' : 'h-9 py-1.5'
        }`}
        style={{
          backgroundColor: headerColor,
          color: headerTextColor,
        }}
      >
        {/* Plus Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddAnother(note.x + 24, note.y + 24);
          }}
          disabled={readOnly || isControlsHidden}
          title="Yeni Not Ekle"
          className={`p-1 rounded hover:bg-black/15 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
            isControlsHidden && !readOnly ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'
          }`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>

        {/* Header Drag Handle Area */}
        <div
          className={`flex-1 h-6 mx-2 cursor-grab active:cursor-grabbing flex items-center justify-center transition-opacity duration-200 ${
            isControlsHidden && !readOnly ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-8 h-1 rounded-full bg-black/20" />
        </div>

        {/* Header Action Buttons (Color Menu & Close) */}
        <div
          className={`flex items-center gap-1 shrink-0 transition-all duration-200 ${
            isControlsHidden && !readOnly ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'
          }`}
        >
          {/* Options / Color Picker */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorMenu((prev) => !prev);
            }}
            disabled={readOnly || isControlsHidden}
            title="Not Rengi"
            className="p-1 rounded hover:bg-black/15 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative"
          >
            <MoreHorizontal size={16} strokeWidth={2.5} />
          </button>

          {/* Close Button with Paper Tear */}
          <button
            type="button"
            onClick={handleClose}
            disabled={readOnly || isControlsHidden}
            title="Notu Kapat ve Yırt"
            className="p-1 rounded hover:bg-black/20 hover:text-red-400 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Note Body: Only the written text remains in focus mode */}
      <div className="relative flex-1 p-3.5 overflow-y-auto cursor-text text-[13.5px] leading-relaxed tracking-wide min-h-[140px] focus:outline-none transition-all duration-300">
        <div
          ref={contentRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => {
            setIsEditorFocused(true);
            onBringToFront(note.id);
          }}
          onBlur={() => setIsEditorFocused(false)}
          className={`w-full h-full min-h-[140px] focus:outline-none whitespace-pre-wrap break-words ${
            isControlsHidden ? 'empty:before:hidden' : "empty:before:content-['Not_alın...'] empty:before:text-neutral-500 empty:before:pointer-events-none"
          }`}
        />
      </div>

      {/* Bottom Text Formatting Toolbar: Smoothly collapses down and disappears in Focus Mode */}
      <div
        className={`flex items-center justify-between px-2.5 bg-[#17171c] select-none text-neutral-400 overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isControlsHidden && !readOnly
            ? 'max-h-0 py-0 opacity-0 border-t-0 pointer-events-none'
            : 'max-h-12 py-1.5 opacity-100 border-t border-white/5 pointer-events-auto'
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Kalın (Ctrl+B)"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
            disabled={readOnly || isControlsHidden}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 hover:text-neutral-200 transition-colors font-bold text-xs cursor-pointer"
          >
            <Bold size={13} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            title="İtalik (Ctrl+I)"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
            disabled={readOnly || isControlsHidden}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 hover:text-neutral-200 transition-colors italic text-xs cursor-pointer"
          >
            <Italic size={13} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            title="Altı Çizili (Ctrl+U)"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('underline');
            }}
            disabled={readOnly || isControlsHidden}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 hover:text-neutral-200 transition-colors text-xs cursor-pointer"
          >
            <Underline size={13} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            title="Üstü Çizili"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('strikeThrough');
            }}
            disabled={readOnly || isControlsHidden}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 hover:text-neutral-200 transition-colors line-through text-xs font-semibold cursor-pointer"
          >
            ab
          </button>
        </div>

        {/* Color Palette Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowColorMenu((prev) => !prev);
          }}
          disabled={readOnly || isControlsHidden}
          title="Renk Paleti"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors cursor-pointer"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
            style={{ backgroundColor: headerColor }}
          />
          <Palette size={11} />
        </button>
      </div>

      {/* Color Selection Popover */}
      {showColorMenu && !readOnly && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-10 right-3 z-30 p-2.5 bg-[#25252d] border border-white/15 rounded-lg shadow-2xl flex flex-col gap-1.5 backdrop-blur-md min-w-[150px]"
        >
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1 px-1">
            Not Rengi
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_COLORS.map((item) => {
              const isSelected = item.color
                ? note.color === item.color
                : !note.color;
              const displayColor = item.color || theme.primary;

              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.name}
                  onClick={() => {
                    onUpdate(note.id, { color: item.color || undefined });
                    setShowColorMenu(false);
                  }}
                  className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: displayColor }}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      className={item.id === 'yellow' ? 'text-black' : 'text-white'}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="absolute select-none sticky-note-window"
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${note.width || 270}px`,
        height: `${note.height || 260}px`,
        zIndex: note.zIndex,
      }}
      onPointerDown={() => onBringToFront(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowColorMenu(false);
      }}
    >
      <AnimatePresence>
        {!isTearing ? (
          /* Normal Note View with Drag Pointer Support */
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="w-full h-full relative"
            onPointerDown={handlePointerDown}
          >
            {renderNoteContent(false)}
          </motion.div>
        ) : (
          /* Realistic Paper Tearing / Ripping Animation Split */
          <div className="w-full h-full relative pointer-events-none">
            {/* Left ripped half tearing away */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{
                x: -34,
                y: 56,
                rotate: -15,
                opacity: 0,
                scale: 0.85,
              }}
              transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
              style={{
                clipPath: ripPathLeft,
                WebkitClipPath: ripPathLeft,
              }}
              className="absolute inset-0 w-full h-full shadow-2xl"
            >
              {renderNoteContent(true)}
            </motion.div>

            {/* Right ripped half tearing away */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{
                x: 36,
                y: 64,
                rotate: 17,
                opacity: 0,
                scale: 0.85,
              }}
              transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
              style={{
                clipPath: ripPathRight,
                WebkitClipPath: ripPathRight,
              }}
              className="absolute inset-0 w-full h-full shadow-2xl"
            >
              {renderNoteContent(true)}
            </motion.div>

            {/* Paper tear friction fiber spark line */}
            <motion.div
              initial={{ opacity: 0.8, scaleY: 0 }}
              animate={{ opacity: 0, scaleY: 1.2 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/40 blur-xs -translate-x-1/2"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
