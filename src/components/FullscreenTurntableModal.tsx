import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Disc3,
  Layers,
  ListMusic,
  Search,
  Loader2,
  X,
  Minimize2,
  Music,
  Rows3,
  Columns3,
  MicVocal,
} from 'lucide-react';
import { PRESET_SONGS, SongTrack } from '../utils/musicAudioEngine';

interface LyricLine {
  timeSec: number | null;
  text: string;
  isInstrumental?: boolean;
}

interface LyricsResult {
  trackId: string;
  found: boolean;
  synced: boolean;
  lines: LyricLine[];
}

type FullscreenView = 'turntable' | 'crate3d' | 'search';
type CrateLayout = 'stack' | 'shelf';

interface FullscreenTurntableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  activeTrack: SongTrack;
  activeColors: [string, string];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  isRepeat: boolean;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (seconds: number) => void;
  onSelectTrack: (track: SongTrack, pool?: SongTrack[]) => void;
  crateTracks: SongTrack[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchResults: SongTrack[];
  isSearchingOnline: boolean;
  onHoverTrack: (track: SongTrack | null) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function isHexColorLight(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(isNaN)) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58;
}

export const FullscreenTurntableModal: React.FC<FullscreenTurntableModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  activeTrack,
  activeColors,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  isRepeat,
  onTogglePlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onSelectTrack,
  crateTracks,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearchingOnline,
  onHoverTrack,
}) => {
  const [view, setView] = useState<FullscreenView>('turntable');
  const [crateLayout, setCrateLayout] = useState<CrateLayout>('stack');
  const [sleeveError, setSleeveError] = useState(false);

  // CountTo Music Sing (Automatic Lyrics + Real-Time Karaoke)
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [isSingActive, setIsSingActive] = useState<boolean>(false);
  const [singTime, setSingTime] = useState<number>(currentTime);
  const singTimeRef = useRef<number>(currentTime);
  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);
  const lyricLineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const userScrollingLyricsUntilRef = useRef<number>(0);

  // Physical platter inertia state (60fps RAF)
  const discRef = useRef<HTMLDivElement | null>(null);
  const angleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  // Seekbar drag state
  const isSeekingRef = useRef<boolean>(false);

  // 3D Crate continuous scroll & inertia
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [smoothIndex, setSmoothIndex] = useState<number>(0);
  const targetIndexRef = useRef<number>(0);
  const smoothIndexRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; startTarget: number; moved: boolean; pointerCaptured: boolean } | null>(null);
  const wasDraggedRef = useRef<boolean>(false);
  const wheelSnapTimerRef = useRef<number | null>(null);
  const [hoveredCrateId, setHoveredCrateId] = useState<string | null>(null);

  const uniqueCrateTracks = useMemo(() => {
    const base = crateTracks.length > 0 ? crateTracks : PRESET_SONGS;
    const seen = new Set<string>();
    const out: SongTrack[] = [];
    for (const t of base) {
      const key = `${t.name.toLowerCase()}::${t.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(t);
      }
    }
    return out;
  }, [crateTracks]);

  const crateIdsKey = useMemo(
    () => uniqueCrateTracks.map((t) => t.id).join('|'),
    [uniqueCrateTracks]
  );

  // Reset sleeve error on track change
  useEffect(() => {
    setSleeveError(false);
  }, [activeTrack.id, activeTrack.albumCover]);

  // Reset to turntable view when fullscreen opens
  useEffect(() => {
    if (isOpen) {
      setView('turntable');
    } else {
      setHoveredCrateId(null);
      setIsSingActive(false);
      onHoverTrack(null);
      if (wheelSnapTimerRef.current) {
        window.clearTimeout(wheelSnapTimerRef.current);
        wheelSnapTimerRef.current = null;
      }
    }
  }, [isOpen]);

  // Automatic background lyrics lookup when fullscreen is open; hides Sing completely if not found
  useEffect(() => {
    if (!isOpen || !activeTrack?.name) return;

    let cancelled = false;
    const controller = new AbortController();
    const targetTrackId = activeTrack.id;

    setLyricsData((prev) => (prev?.trackId === targetTrackId ? prev : null));

    const params = new URLSearchParams({
      title: activeTrack.name,
      artist: activeTrack.artist || '',
      duration: String(Math.round(activeTrack.durationSec || duration || 0)),
    });

    fetch(`/api/lyrics?${params.toString()}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.found && Array.isArray(data.lines) && data.lines.length > 0) {
          setLyricsData({
            trackId: targetTrackId,
            found: true,
            synced: Boolean(data.synced),
            lines: data.lines,
          });
        } else {
          setLyricsData({
            trackId: targetTrackId,
            found: false,
            synced: false,
            lines: [],
          });
          setIsSingActive(false);
        }
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setLyricsData({
          trackId: targetTrackId,
          found: false,
          synced: false,
          lines: [],
        });
        setIsSingActive(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isOpen, activeTrack.id, activeTrack.name, activeTrack.artist]);

  // Sync singTime to audio currentTime and smoothly interpolate at 60fps when Sing is active
  useEffect(() => {
    lyricLineRefs.current = [];
  }, [activeTrack.id]);

  useEffect(() => {
    singTimeRef.current = currentTime;
    setSingTime(currentTime);
  }, [currentTime, activeTrack.id]);

  const hasLyrics = Boolean(
    lyricsData &&
      lyricsData.trackId === activeTrack.id &&
      lyricsData.found &&
      lyricsData.lines.length > 0
  );
  const showSingStage = view === 'turntable' && isSingActive && hasLyrics;

  useEffect(() => {
    if (!isOpen || !showSingStage || !isPlaying) return;
    let rafId = 0;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      // Do not run ahead while YouTube is still buffering at 0:00, and keep drift bounded to reported playback time
      if (currentTimeRef.current > 0.05) {
        const maxAllowed = currentTimeRef.current + 0.35;
        singTimeRef.current = Math.min(duration || 9999, maxAllowed, singTimeRef.current + dt);
      } else {
        singTimeRef.current = currentTimeRef.current;
      }
      setSingTime(singTimeRef.current);
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, showSingStage, isPlaying, duration]);

  const activeLyricIndex = useMemo(() => {
    if (!hasLyrics || !lyricsData) return -1;
    const lines = lyricsData.lines;
    if (lyricsData.synced) {
      const t = singTime;
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        const lineTime = lines[i].timeSec;
        if (lineTime !== null && lineTime <= t) {
          idx = i;
        } else {
          break;
        }
      }
      return idx;
    }
    if (duration <= 0) return 0;
    const ratio = Math.max(0, Math.min(0.999, singTime / duration));
    return Math.floor(ratio * lines.length);
  }, [hasLyrics, lyricsData, singTime, duration]);

  // Auto-scroll active karaoke line into focus
  useEffect(() => {
    if (!showSingStage) return;
    if (Date.now() < userScrollingLyricsUntilRef.current) return;
    if (activeLyricIndex < 0) {
      lyricsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = lyricLineRefs.current[activeLyricIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showSingStage, activeLyricIndex]);

  // Sync crate focal index to current active track ONLY when entering 3D view or when track list IDs genuinely change
  useEffect(() => {
    if (view === 'crate3d') {
      const idx = uniqueCrateTracks.findIndex(
        (t) =>
          t.id === activeTrack.id ||
          (t.name.toLowerCase() === activeTrack.name.toLowerCase() &&
            t.artist.toLowerCase() === activeTrack.artist.toLowerCase())
      );
      const nextIdx = idx >= 0 ? idx : 0;
      targetIndexRef.current = nextIdx;
      smoothIndexRef.current = nextIdx;
      setTargetIndex(nextIdx);
      setSmoothIndex(nextIdx);
    } else {
      setHoveredCrateId(null);
      onHoverTrack(null);
    }
  }, [view, crateIdsKey]);

  // Real belt-drive platter inertia animation loop
  useEffect(() => {
    if (!isOpen) return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const targetVel = isPlayingRef.current ? 82 : 0; // degrees/sec
      const accel = isPlayingRef.current ? 3.5 : 2.3;
      velocityRef.current += (targetVel - velocityRef.current) * Math.min(1, dt * accel);

      if (Math.abs(velocityRef.current) > 0.04) {
        angleRef.current = (angleRef.current + velocityRef.current * dt) % 360;
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, view]);

  // Smooth spring damping loop for 3D record stack/shelf scrolling
  useEffect(() => {
    if (!isOpen || view !== 'crate3d') return;
    let rafId = 0;

    const animate = () => {
      const diff = targetIndexRef.current - smoothIndexRef.current;
      if (Math.abs(diff) > 0.001) {
        smoothIndexRef.current += diff * 0.16;
        setSmoothIndex(smoothIndexRef.current);
      } else if (smoothIndexRef.current !== targetIndexRef.current) {
        smoothIndexRef.current = targetIndexRef.current;
        setSmoothIndex(targetIndexRef.current);
      }
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, view]);

  // Keyboard navigation in 3D view + Space play/pause in turntable view
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.code === 'Space' && view !== 'search') {
        e.preventDefault();
        onTogglePlayPause();
        return;
      }

      if (view === 'crate3d') {
        const maxIdx = Math.max(0, uniqueCrateTracks.length - 1);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const next = Math.min(maxIdx, Math.round(targetIndexRef.current + 1));
          targetIndexRef.current = next;
          setTargetIndex(next);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = Math.max(0, Math.round(targetIndexRef.current - 1));
          targetIndexRef.current = prev;
          setTargetIndex(prev);
        } else if (e.key === 'Enter') {
          const centered = uniqueCrateTracks[Math.round(targetIndexRef.current)];
          if (centered) {
            onSelectTrack(centered, uniqueCrateTracks);
            setView('turntable');
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, view, uniqueCrateTracks, onTogglePlayPause, onSelectTrack]);

  if (typeof document === 'undefined') return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);
  const tonearmAngle = isPlaying ? 18.5 + (progressPercent / 100) * 13 : -3.5;

  const seekFromClientX = (el: HTMLDivElement, clientX: number) => {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(pct * duration);
  };

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isSeekingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    seekFromClientX(e.currentTarget, e.clientX);
  };

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.stopPropagation();
    seekFromClientX(e.currentTarget, e.clientX);
  };

  const handleSeekPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.stopPropagation();
    isSeekingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 3D Crate wheel + pointer drag handlers
  const handleCrateWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(rawDelta) < 0.5) return;
    const maxIdx = Math.max(0, uniqueCrateTracks.length - 1);
    const step = rawDelta * 0.0085;
    const next = Math.max(0, Math.min(maxIdx, targetIndexRef.current + step));
    targetIndexRef.current = next;
    setTargetIndex(next);

    if (wheelSnapTimerRef.current) {
      window.clearTimeout(wheelSnapTimerRef.current);
    }
    wheelSnapTimerRef.current = window.setTimeout(() => {
      const snapped = Math.max(0, Math.min(maxIdx, Math.round(targetIndexRef.current)));
      targetIndexRef.current = snapped;
      setTargetIndex(snapped);
      wheelSnapTimerRef.current = null;
    }, 140);
  };

  const handleCratePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    wasDraggedRef.current = false;
    if (wheelSnapTimerRef.current) {
      window.clearTimeout(wheelSnapTimerRef.current);
      wheelSnapTimerRef.current = null;
    }
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTarget: targetIndexRef.current,
      moved: false,
      pointerCaptured: false,
    };
  };

  const handleCratePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = dragStartRef.current.x - e.clientX;
    const dy = dragStartRef.current.y - e.clientY;
    if (!dragStartRef.current.moved && Math.hypot(dx, dy) > 5) {
      dragStartRef.current.moved = true;
      if (!dragStartRef.current.pointerCaptured) {
        dragStartRef.current.pointerCaptured = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }
    }
    const delta = crateLayout === 'stack' ? dy / 68 : dx / 84;
    const maxIdx = Math.max(0, uniqueCrateTracks.length - 1);
    const next = Math.max(0, Math.min(maxIdx, dragStartRef.current.startTarget + delta));
    targetIndexRef.current = next;
    setTargetIndex(next);
  };

  const handleCratePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current?.pointerCaptured) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (dragStartRef.current?.moved) {
      wasDraggedRef.current = true;
      const maxIdx = Math.max(0, uniqueCrateTracks.length - 1);
      const snapped = Math.max(0, Math.min(maxIdx, Math.round(targetIndexRef.current)));
      targetIndexRef.current = snapped;
      setTargetIndex(snapped);
    }
    dragStartRef.current = null;
  };

  const handlePickRecordFromCrate = (track: SongTrack) => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    onHoverTrack(null);
    onSelectTrack(track, uniqueCrateTracks);
    setView('turntable');
  };

  const activeSearchList = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return uniqueCrateTracks;
    if (searchResults.length > 0) return searchResults;
    const qLower = trimmed.toLowerCase();
    return uniqueCrateTracks.filter(
      (s) => s.name.toLowerCase().includes(qLower) || s.artist.toLowerCase().includes(qLower)
    );
  }, [searchQuery, searchResults, uniqueCrateTracks]);

  const focusedCrateTrack =
    (hoveredCrateId && uniqueCrateTracks.find((t) => t.id === hoveredCrateId)) ||
    uniqueCrateTracks[Math.max(0, Math.min(uniqueCrateTracks.length - 1, Math.round(smoothIndex)))] ||
    activeTrack;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="md-vinyl-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[120] bg-[#141417] text-white flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Matte Studio Turntable Surface & Restrained Album Tint */}
          <div
            className="pointer-events-none absolute inset-0 transition-all duration-1000"
            style={{
              background: `
                radial-gradient(ellipse 75% 65% at 50% 44%, color-mix(in srgb, ${activeColors[0]} 22%, #242429) 0%, #16161a 56%, #0c0c0f 100%)
              `,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-35 transition-all duration-1000"
            style={{
              background: `radial-gradient(circle at 28% 52%, ${activeColors[1]}2e 0%, transparent 52%)`,
            }}
          />

          {/* Top-right Window Controls ONLY (Zero Header Clutter) */}
          <div className="relative z-30 flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-6">
            <div className="flex items-center gap-2">
              {view === 'crate3d' && (
                <div className="inline-flex items-center p-1 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setCrateLayout('stack')}
                    title="Dikey Yığın"
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      crateLayout === 'stack'
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Rows3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrateLayout('shelf')}
                    title="Yatay Raf"
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      crateLayout === 'shelf'
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMinimize}
                title="Küçült"
                className="w-9 h-9 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/12 backdrop-blur-xl flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Kapat"
                className="w-9 h-9 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/12 backdrop-blur-xl flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CENTER STAGE: Switches seamlessly between Real Turntable, 3D Record Selector, and Clean Search */}
          <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-10 min-h-0">
            <AnimatePresence mode="wait">
              {view === 'turntable' && (
                <motion.div
                  key="stage-turntable"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex items-center justify-center w-full h-full min-h-0 ${
                    showSingStage
                      ? 'max-w-6xl flex-col lg:flex-row gap-6 lg:gap-12'
                      : 'max-w-[820px]'
                  }`}
                >
                  {/* Turntable Group: Centered normally, glides smoothly left when Sing opens */}
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    className={`relative flex items-center justify-center shrink-0 origin-center transition-transform duration-500 ${
                      showSingStage
                        ? 'scale-[0.72] sm:scale-[0.78] lg:scale-[0.82] -my-6 lg:my-0'
                        : 'scale-100'
                    }`}
                  >
                    {/* 1. LEFT: TACTILE CARDBOARD ALBUM SLEEVE (Slightly tilted like real studio desk placement) */}
                    <AnimatePresence mode="popLayout">
                      <motion.button
                        key={`sleeve-${activeTrack.id}`}
                        type="button"
                        onClick={() => setView('crate3d')}
                        initial={{ opacity: 0, x: -34, rotate: -6, scale: 0.94 }}
                        animate={{ opacity: 1, x: 0, rotate: -2.4, scale: 1 }}
                        exit={{ opacity: 0, x: -24, rotate: -5, scale: 0.94 }}
                        whileHover={{ rotate: -1, x: -6, scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        title="3D Plak Seçici"
                        className="relative z-20 -mr-[78px] sm:-mr-[106px] md:-mr-[118px] w-[200px] h-[200px] sm:w-[276px] sm:h-[276px] md:w-[324px] md:h-[324px] rounded-[6px] overflow-hidden shrink-0 cursor-pointer bg-neutral-900 focus:outline-none"
                        style={{
                          boxShadow:
                            '0 32px 64px -14px rgba(0,0,0,0.88), 10px 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.22)',
                        }}
                      >
                        {!sleeveError && activeTrack.albumCover ? (
                          <img
                            src={activeTrack.albumCover}
                            alt={activeTrack.name}
                            referrerPolicy="no-referrer"
                            onError={() => setSleeveError(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                            style={{
                              background: `linear-gradient(135deg, ${activeColors[0]}, ${activeColors[1]})`,
                            }}
                          >
                            <Music className="w-12 h-12 text-white/80 mb-3" />
                            <span className="text-base font-bold text-white line-clamp-2">
                              {activeTrack.name}
                            </span>
                            <span className="text-xs text-white/75 mt-1">{activeTrack.artist}</span>
                          </div>
                        )}
                        {/* Left spine crease & subtle matte studio sheen */}
                        <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-white/20 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/30 pointer-events-none" />
                      </motion.button>
                    </AnimatePresence>

                    {/* 2. CENTER-RIGHT: REALISTIC 60FPS SPINNING VINYL PLATTER */}
                    <div className="relative z-10 w-[212px] h-[212px] sm:w-[292px] sm:h-[292px] md:w-[344px] md:h-[344px] shrink-0 flex items-center justify-center">
                      {/* Recessed subtle platter shadow ring */}
                      <div className="absolute inset-[-7px] rounded-full bg-black/45 border border-white/[0.05] shadow-[inset_0_8px_24px_rgba(0,0,0,0.9)] pointer-events-none" />

                      <div
                        onClick={onTogglePlayPause}
                        title={isPlaying ? 'Duraklat' : 'Oynat'}
                        className="relative w-full h-full rounded-full cursor-pointer overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)]"
                        style={{ background: '#09090b' }}
                      >
                        {/* Rotating Disc (60fps RAF inertia) */}
                        <div
                          ref={discRef}
                          className="w-full h-full rounded-full relative will-change-transform flex items-center justify-center"
                          style={{
                            background:
                              'repeating-radial-gradient(circle at center, #0c0c0f 0px, #0c0c0f 1.5px, #17171d 2.3px, #09090c 3.4px)',
                          }}
                        >
                          {/* Outer lead-in bevel */}
                          <div className="absolute inset-0 rounded-full border border-white/15 pointer-events-none" />
                          {/* LP track divider rings */}
                          <div
                            className="absolute rounded-full border border-white/[0.06] pointer-events-none"
                            style={{ inset: '12%' }}
                          />
                          <div
                            className="absolute rounded-full border border-white/[0.05] pointer-events-none"
                            style={{ inset: '21%' }}
                          />
                          {/* Dead-wax inner run-out zone */}
                          <div
                            className="absolute rounded-full border border-white/[0.09] bg-[#09090b]/60 pointer-events-none"
                            style={{ inset: '28%' }}
                          />

                          {/* Authentic Printed Center Paper Label */}
                          <div
                            key={`label-${activeTrack.id}`}
                            className="relative w-[92px] h-[92px] sm:w-[126px] sm:h-[126px] md:w-[146px] md:h-[146px] rounded-full flex flex-col items-center justify-between py-4 sm:py-6 px-3 text-center shadow-[inset_0_0_12px_rgba(0,0,0,0.22),0_0_0_2px_rgba(0,0,0,0.85)]"
                            style={{
                              background: `radial-gradient(circle at 38% 32%, color-mix(in srgb, ${activeColors[0]} 22%, #eef0f2) 0%, color-mix(in srgb, ${activeColors[0]} 30%, #d4d8dd) 100%)`,
                            }}
                          >
                            {/* Subtle printed outer ring */}
                            <div className="absolute inset-[5px] sm:inset-[7px] rounded-full border border-neutral-900/15 pointer-events-none" />

                            {/* Title (top half) */}
                            <span className="text-[8.5px] sm:text-[11px] md:text-[12px] font-bold tracking-tight text-neutral-900 leading-tight truncate max-w-[74px] sm:max-w-[104px] mt-0.5">
                              {activeTrack.name}
                            </span>

                            {/* Artist (bottom half) */}
                            <span className="text-[7px] sm:text-[9px] md:text-[10px] font-medium text-neutral-700 leading-tight truncate max-w-[70px] sm:max-w-[98px] mb-1">
                              {activeTrack.artist}
                            </span>

                            {/* Micro barcode accent */}
                            <div className="absolute bottom-[7px] sm:bottom-[9px] w-4 h-[2px] rounded-full bg-neutral-900/25" />

                            {/* Brushed Steel Center Spindle Pin */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-700 border border-neutral-800/80 shadow-[0_2px_4px_rgba(0,0,0,0.65)]" />
                          </div>
                        </div>

                        {/* Stationary Studio Overhead Softbox Light Reflections */}
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-screen"
                          style={{
                            background:
                              'conic-gradient(from 28deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.22) 26deg, rgba(255,255,255,0.04) 54deg, transparent 92deg, transparent 182deg, rgba(255,255,255,0.18) 208deg, rgba(255,255,255,0.03) 236deg, transparent 274deg)',
                          }}
                        />
                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
                      </div>
                    </div>

                    {/* 3. FAR RIGHT: SCULPTED BRUSHED METAL TONEARM */}
                    <button
                      type="button"
                      onClick={onTogglePlayPause}
                      title={isPlaying ? 'İğneyi Kaldır' : 'İğneyi İndir'}
                      className="relative z-30 -ml-4 sm:-ml-6 w-[64px] sm:w-[82px] h-[220px] sm:h-[300px] md:h-[346px] shrink-0 cursor-pointer focus:outline-none"
                    >
                      {/* Recessed Oval Turntable Plinth Baseplate */}
                      <div className="absolute top-3 sm:top-4 right-1.5 sm:right-2 w-11 sm:w-14 h-20 sm:h-28 rounded-full bg-gradient-to-b from-white/[0.07] via-[#1c1c21] to-black/75 border border-white/12 shadow-[inset_0_2px_10px_rgba(0,0,0,0.75)] pointer-events-none" />

                      {/* Pivoting Tonearm Assembly */}
                      <motion.div
                        animate={{ rotate: tonearmAngle }}
                        transition={{
                          type: 'spring',
                          stiffness: 110,
                          damping: 18,
                          mass: 0.9,
                        }}
                        style={{ transformOrigin: '50% 38px' }}
                        className="absolute top-0 right-1.5 sm:right-2 w-11 sm:w-14 h-full pointer-events-none"
                      >
                        {/* Rear Counterweight */}
                        <div className="mx-auto mt-3 sm:mt-4 w-5 sm:w-6 h-7 sm:h-8 rounded-[4px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/15 shadow-[0_6px_14px_rgba(0,0,0,0.85)] relative">
                          <div className="absolute inset-x-0.5 top-1.5 h-[2px] rounded-full bg-white/20" />
                        </div>

                        {/* Gimbal Pivot Housing */}
                        <div className="mx-auto -mt-2 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-700 to-zinc-950 border border-white/25 shadow-[0_4px_12px_rgba(0,0,0,0.85)] flex items-center justify-center relative z-10">
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/25" />
                        </div>

                        {/* Brushed Aluminum Arm Shaft */}
                        <div
                          className="mx-auto -mt-1 w-[4.5px] sm:w-[5.5px] h-[124px] sm:h-[172px] md:h-[204px] rounded-full shadow-[3px_6px_14px_rgba(0,0,0,0.8)]"
                          style={{
                            background:
                              'linear-gradient(90deg, #9ca3af 0%, #f4f4f5 45%, #71717a 100%)',
                          }}
                        />

                        {/* Angled Matte-Black Headshell + Finger Lift + Stylus */}
                        <div
                          className="mx-auto -mt-1 w-4 sm:w-5 h-8 sm:h-10 rounded-[3px] bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/25 shadow-[0_6px_16px_rgba(0,0,0,0.92)] relative"
                          style={{ transform: 'rotate(19deg)', transformOrigin: 'top center' }}
                        >
                          {/* Finger lift wire */}
                          <div className="absolute -right-[6px] top-[7px] w-[7px] h-[2px] rounded-full bg-zinc-300" />
                          {/* Stylus tip pinpoint */}
                          <div
                            className={`absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[3.5px] h-[3.5px] rounded-full transition-colors duration-300 ${
                              isPlaying ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]' : 'bg-zinc-600'
                            }`}
                          />
                        </div>
                      </motion.div>
                    </button>
                  </motion.div>

                  {/* RIGHT: COUNTTO MUSIC SING REAL-TIME KARAOKE LYRICS */}
                  <AnimatePresence>
                    {showSingStage && lyricsData && (
                      <motion.div
                        key={`sing-lyrics-${activeTrack.id}`}
                        initial={{ opacity: 0, x: 36 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 w-full max-w-xl h-[44vh] sm:h-[52vh] lg:h-[60vh] min-h-0 flex flex-col justify-center"
                      >
                        <div
                          ref={lyricsScrollRef}
                          onWheel={() => {
                            userScrollingLyricsUntilRef.current = Date.now() + 3500;
                          }}
                          onTouchStart={() => {
                            userScrollingLyricsUntilRef.current = Date.now() + 3500;
                          }}
                          className="w-full h-full overflow-y-auto px-2 sm:px-5 py-[18vh] flex flex-col gap-6 sm:gap-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                          style={{
                            maskImage:
                              'linear-gradient(to bottom, transparent 0%, black 15%, black 83%, transparent 100%)',
                            WebkitMaskImage:
                              'linear-gradient(to bottom, transparent 0%, black 15%, black 83%, transparent 100%)',
                          }}
                        >
                          {lyricsData.synced &&
                            activeLyricIndex === -1 &&
                            (lyricsData.lines[0]?.timeSec ?? 0) > 1.5 &&
                            !lyricsData.lines[0]?.isInstrumental && (
                              <div className="flex items-center gap-2 py-2" aria-hidden="true">
                                {[0, 1, 2].map((dotIdx) => (
                                  <span
                                    key={dotIdx}
                                    className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse"
                                    style={{ animationDelay: `${dotIdx * 220}ms` }}
                                  />
                                ))}
                              </div>
                            )}

                          {lyricsData.lines.map((line, i) => {
                            const isCurrent = i === activeLyricIndex;
                            const isPast = activeLyricIndex >= 0 && i < activeLyricIndex;

                            if (line.isInstrumental) {
                              return (
                                <button
                                  key={`${i}-${line.timeSec ?? 'inst'}`}
                                  ref={(el) => {
                                    lyricLineRefs.current[i] = el;
                                  }}
                                  type="button"
                                  onClick={() => {
                                    if (line.timeSec !== null) {
                                      userScrollingLyricsUntilRef.current = 0;
                                      onSeek(line.timeSec);
                                    }
                                  }}
                                  className={`text-left py-1.5 transition-all duration-300 focus:outline-none ${
                                    line.timeSec !== null ? 'cursor-pointer' : 'cursor-default'
                                  }`}
                                  aria-label="Enstrümantal ara"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    {[0, 1, 2].map((dotIdx) => (
                                      <span
                                        key={dotIdx}
                                        className={`rounded-full transition-all duration-300 ${
                                          isCurrent
                                            ? 'w-2.5 h-2.5 bg-white/85 animate-pulse'
                                            : isPast
                                            ? 'w-1.5 h-1.5 bg-white/15'
                                            : 'w-1.5 h-1.5 bg-white/25'
                                        }`}
                                        style={isCurrent ? { animationDelay: `${dotIdx * 220}ms` } : undefined}
                                      />
                                    ))}
                                  </span>
                                </button>
                              );
                            }

                            const nextLineTime =
                              lyricsData.synced && i + 1 < lyricsData.lines.length
                                ? lyricsData.lines[i + 1].timeSec ?? (line.timeSec ?? 0) + 4
                                : (line.timeSec ?? 0) + 4;
                            const lineStart = line.timeSec ?? 0;
                            const lineDuration = Math.max(0.8, Math.min(8, nextLineTime - lineStart));
                            const lineProgress = isCurrent
                              ? Math.max(0, Math.min(1, (singTime - lineStart) / lineDuration))
                              : isPast
                              ? 1
                              : 0;

                            const words = line.text.split(' ');
                            const totalChars = Math.max(1, words.reduce((acc, w) => acc + w.length, 0));
                            let consumedChars = 0;

                            return (
                              <button
                                key={`${i}-${line.timeSec ?? 'p'}`}
                                ref={(el) => {
                                  lyricLineRefs.current[i] = el;
                                }}
                                type="button"
                                onClick={() => {
                                  if (line.timeSec !== null) {
                                    userScrollingLyricsUntilRef.current = 0;
                                    onSeek(line.timeSec);
                                  }
                                }}
                                className={`text-left transition-all duration-300 focus:outline-none ${
                                  line.timeSec !== null ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isCurrent
                                    ? 'text-[24px] sm:text-[29px] lg:text-[32px] font-bold leading-[1.28] tracking-tight'
                                    : isPast
                                    ? 'text-[17px] sm:text-[21px] font-semibold leading-[1.35] text-white/22 hover:text-white/50'
                                    : 'text-[17px] sm:text-[21px] font-semibold leading-[1.35] text-white/32 hover:text-white/60'
                                }`}
                              >
                                {isCurrent && lyricsData.synced ? (
                                  <span className="inline">
                                    {words.map((word, wIdx) => {
                                      const startRatio = consumedChars / totalChars;
                                      consumedChars += word.length;
                                      const endRatio = consumedChars / totalChars;
                                      const wordRatio = Math.max(
                                        0,
                                        Math.min(
                                          1,
                                          (lineProgress - startRatio) /
                                            Math.max(0.05, endRatio - startRatio)
                                        )
                                      );

                                      if (wordRatio <= 0.005) {
                                        return (
                                          <span
                                            key={wIdx}
                                            className="inline-block mr-[0.26em] text-white/36"
                                          >
                                            {word}
                                          </span>
                                        );
                                      }

                                      if (wordRatio >= 0.995) {
                                        return (
                                          <span
                                            key={wIdx}
                                            className="inline-block mr-[0.26em] text-white"
                                            style={{
                                              textShadow: '0 0 18px rgba(255,255,255,0.24)',
                                            }}
                                          >
                                            {word}
                                          </span>
                                        );
                                      }

                                      const fillPct = Math.round(wordRatio * 100);

                                      return (
                                        <span
                                          key={wIdx}
                                          className="inline-block mr-[0.26em]"
                                          style={{
                                            backgroundImage: `linear-gradient(90deg, #ffffff ${Math.max(
                                              0,
                                              fillPct - 3
                                            )}%, rgba(255,255,255,0.36) ${Math.min(100, fillPct + 5)}%)`,
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                          }}
                                        >
                                          {word}
                                        </span>
                                      );
                                    })}
                                  </span>
                                ) : (
                                  <span className={isCurrent ? 'text-white' : undefined}>
                                    {line.text}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {view === 'crate3d' && (
                <motion.div
                  key="stage-crate3d"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  onWheel={handleCrateWheel}
                  onPointerDown={handleCratePointerDown}
                  onPointerMove={handleCratePointerMove}
                  onPointerUp={handleCratePointerUp}
                  onPointerCancel={handleCratePointerUp}
                  className="relative w-full h-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                  style={{
                    perspective: crateLayout === 'stack' ? '1050px' : '1350px',
                    perspectiveOrigin: '50% 50%',
                  }}
                >
                  {crateLayout === 'stack' ? (
                    /* ===== 3D VERTICAL VINYL RECORD STACK (Reference: image_98998442.png) ===== */
                    <div
                      className="relative w-[290px] sm:w-[360px] h-[440px] sm:h-[540px] flex items-center justify-center"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {uniqueCrateTracks.map((track, index) => {
                        const offset = index - smoothIndex;
                        if (Math.abs(offset) > 5.5) return null;

                        const isHoveredItem = hoveredCrateId === track.id;
                        const isPlayingThis = track.id === activeTrack.id;
                        const absOffset = Math.abs(offset);
                        const isFocused = absOffset < 0.38;
                        const spineBg = track.colors?.[0] || '#27272a';
                        const lightText = !isHexColorLight(spineBg);
                        const shadeAlpha = Math.min(0.42, absOffset * 0.08);

                        const translateY =
                          offset * 66 + Math.tanh(offset * 2.4) * 38;
                        const translateZ =
                          -absOffset * 24 + (isFocused ? 52 : 0) + (isHoveredItem ? 64 : 0);
                        // Continuous -90deg spine-forward axis:
                        // Above center (offset<0): rotates toward -55deg (spine at top edge, cover tilts down/back)
                        // Center (offset=0): -90deg (spine head-on with full spacing)
                        // Below center (offset>0): rotates toward -125deg (spine at bottom edge, cover tilts up/back)
                        const naturalRotateX = -90 - Math.tanh(offset * 1.15) * 34;
                        const rotateX = isHoveredItem ? -28 : naturalRotateX;

                        return (
                          <div
                            key={track.id}
                            onMouseEnter={() => {
                              setHoveredCrateId(track.id);
                              onHoverTrack(track);
                            }}
                            onMouseLeave={() => {
                              setHoveredCrateId(null);
                              onHoverTrack(null);
                            }}
                            onClick={() => handlePickRecordFromCrate(track)}
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: `translate3d(0, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg)`,
                              zIndex: Math.round(200 - absOffset * 20 + (isHoveredItem ? 45 : 0)),
                              transition: isHoveredItem
                                ? 'transform 240ms cubic-bezier(0.16,1,0.3,1)'
                                : undefined,
                            }}
                            className="absolute w-[236px] h-[236px] sm:w-[292px] sm:h-[292px] cursor-pointer"
                          >
                            {/* Top (+Z) Album Artwork Face — visible on sleeves above center & on hover */}
                            <div
                              className="absolute inset-0 rounded-[4px] overflow-hidden bg-neutral-900 border border-white/15"
                              style={{
                                transform: 'translateZ(11px)',
                                backfaceVisibility: 'hidden',
                                boxShadow: '0 22px 44px rgba(0,0,0,0.68)',
                              }}
                            >
                              <img
                                src={track.albumCover}
                                alt={track.name}
                                referrerPolicy="no-referrer"
                                draggable={false}
                                className="w-full h-full object-cover pointer-events-none"
                                loading="eager"
                                decoding="async"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: `rgba(10,10,14,${shadeAlpha})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-black/35 pointer-events-none" />
                            </div>

                            {/* Underside (-Z) Album Artwork Face — visible upright on sleeves below center */}
                            <div
                              className="absolute inset-0 rounded-[4px] overflow-hidden bg-neutral-900 border border-white/15"
                              style={{
                                transform: 'rotateX(180deg) translateZ(11px)',
                                backfaceVisibility: 'hidden',
                                boxShadow: '0 22px 44px rgba(0,0,0,0.68)',
                              }}
                            >
                              <img
                                src={track.albumCover}
                                alt={track.name}
                                referrerPolicy="no-referrer"
                                draggable={false}
                                className="w-full h-full object-cover pointer-events-none"
                                loading="eager"
                                decoding="async"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: `rgba(10,10,14,${shadeAlpha})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 pointer-events-none" />
                            </div>

                            {/* Front Spine (-Y top edge) — ALWAYS flush at front edge & facing forward */}
                            <div
                              className="absolute left-0 right-0 top-0 -mt-[11px] h-[22px] px-3 flex items-center justify-center gap-2 overflow-hidden border-y border-black/25 shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
                              style={{
                                backgroundColor: spineBg,
                                color: lightText ? '#fafafa' : '#111115',
                                transformOrigin: 'center center',
                                transform: 'rotateX(90deg)',
                                backfaceVisibility: 'hidden',
                              }}
                            >
                              <span className="text-[11px] font-bold tracking-tight truncate">
                                {track.name}
                              </span>
                              <span className="text-[10px] opacity-75 truncate shrink-0 max-w-[42%]">
                                {track.artist}
                              </span>
                              {isPlayingThis && <Play className="w-2.5 h-2.5 fill-current shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ===== 3D HORIZONTAL VINYL SHELF (Reference: image_1bd84f1b.png top-left) ===== */
                    <div
                      className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {uniqueCrateTracks.map((track, index) => {
                        const offset = index - smoothIndex;
                        if (Math.abs(offset) > 5.5) return null;

                        const isHoveredItem = hoveredCrateId === track.id;
                        const absOffset = Math.abs(offset);
                        const isFocused = absOffset < 0.42;
                        const spineBg = track.colors?.[0] || '#27272a';
                        const lightText = !isHexColorLight(spineBg);
                        const shadeAlpha = Math.min(0.4, absOffset * 0.08);

                        const translateX =
                          offset * 108 + Math.tanh(offset * 2.4) * 98;
                        const translateZ =
                          -36 - absOffset * 28 + (isFocused ? 124 : 0) + (isHoveredItem ? 44 : 0);
                        const rotateY = isFocused ? 14 : isHoveredItem ? 18 : 54;

                        return (
                          <div
                            key={track.id}
                            onMouseEnter={() => {
                              setHoveredCrateId(track.id);
                              onHoverTrack(track);
                            }}
                            onMouseLeave={() => {
                              setHoveredCrateId(null);
                              onHoverTrack(null);
                            }}
                            onClick={() => handlePickRecordFromCrate(track)}
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg)`,
                              zIndex: Math.round(200 - absOffset * 20 + (isHoveredItem ? 45 : 0)),
                              transition: isHoveredItem
                                ? 'transform 220ms cubic-bezier(0.16,1,0.3,1)'
                                : undefined,
                            }}
                            className="absolute w-[220px] h-[220px] sm:w-[270px] sm:h-[270px] cursor-pointer"
                          >
                            {/* Front Cover Face */}
                            <div
                              className="absolute inset-0 rounded-[4px] overflow-hidden bg-neutral-900 border border-white/15"
                              style={{
                                transform: 'translateZ(10px)',
                                backfaceVisibility: 'hidden',
                                boxShadow: '0 24px 48px rgba(0,0,0,0.75)',
                              }}
                            >
                              <img
                                src={track.albumCover}
                                alt={track.name}
                                referrerPolicy="no-referrer"
                                draggable={false}
                                className="w-full h-full object-cover pointer-events-none"
                                loading="eager"
                                decoding="async"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: `rgba(10,10,14,${shadeAlpha})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
                            </div>

                            {/* Back Cover Face */}
                            <div
                              className="absolute inset-0 rounded-[4px] overflow-hidden bg-neutral-950 border border-white/10"
                              style={{
                                transform: 'rotateY(180deg) translateZ(10px)',
                                backfaceVisibility: 'hidden',
                              }}
                            />

                            {/* Left Vertical Spine Face */}
                            <div
                              className="absolute top-0 bottom-0 left-0 -ml-[10px] w-[20px] flex items-center justify-center overflow-hidden border-x border-black/25 shadow-md"
                              style={{
                                backgroundColor: spineBg,
                                color: lightText ? '#fafafa' : '#111115',
                                transformOrigin: 'center center',
                                transform: 'rotateY(-90deg)',
                                backfaceVisibility: 'hidden',
                              }}
                            >
                              <span
                                className="text-[10px] font-bold tracking-tight whitespace-nowrap truncate max-h-[88%]"
                                style={{ writingMode: 'vertical-rl' }}
                              >
                                {track.name} · {track.artist}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Focused Track Subtle Indicator in 3D Mode */}
                  <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-sm font-semibold text-white">
                      {focusedCrateTrack.name}
                    </div>
                    <div className="text-xs text-white/55">{focusedCrateTrack.artist}</div>
                  </div>
                </motion.div>
              )}

              {view === 'search' && (
                <motion.div
                  key="stage-search"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-xl flex flex-col gap-4 max-h-[66vh]"
                >
                  <div className="flex items-center px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/12 backdrop-blur-2xl">
                    {isSearchingOnline ? (
                      <Loader2 className="w-4 h-4 text-white/70 animate-spin mr-3 shrink-0" />
                    ) : (
                      <Search className="w-4 h-4 text-white/45 mr-3 shrink-0" />
                    )}
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      placeholder="Şarkı veya sanatçı ara..."
                      className="bg-transparent text-white placeholder-white/40 focus:outline-none w-full text-sm font-medium"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => onSearchQueryChange('')}
                        className="text-white/45 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col divide-y divide-white/[0.06] custom-sticky-scrollbar">
                    {activeSearchList.length > 0 ? (
                      activeSearchList.map((song) => {
                        const isThisActive = activeTrack.id === song.id;
                        return (
                          <button
                            key={song.id}
                            type="button"
                            onMouseEnter={() => onHoverTrack(song)}
                            onMouseLeave={() => onHoverTrack(null)}
                            onClick={() => {
                              onHoverTrack(null);
                              onSelectTrack(song, activeSearchList);
                              setView('turntable');
                            }}
                            className={`w-full flex items-center justify-between py-2.5 px-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isThisActive ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={song.albumCover}
                                alt={song.name}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-lg object-cover shrink-0 border border-white/10"
                                loading="lazy"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-white truncate">
                                  {song.name}
                                </span>
                                <span className="text-xs text-white/55 truncate">
                                  {song.artist} · {formatTime(song.durationSec)}
                                </span>
                              </div>
                            </div>
                            <span className="text-white/75 px-2 shrink-0">
                              {isThisActive && isPlaying ? (
                                <Pause className="w-4 h-4 fill-white" />
                              ) : (
                                <Play className="w-4 h-4 fill-white" />
                              )}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-sm text-white/45">
                        {isSearchingOnline ? 'Aranıyor...' : 'Sonuç bulunamadı.'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM DOCK: Minimal, Studio-grade Layout Matching Reference 1 (image_1bd84f1b.png) */}
          <div className="relative z-30 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-5 sm:pb-7 pt-2 flex flex-col gap-3">
            {/* Thin Interactive Timeline Scrub Bar */}
            <div className="flex items-center gap-3 w-full max-w-xl mx-auto">
              <span className="text-[11px] font-mono tabular-nums text-white/50 w-9 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                onPointerDown={handleSeekPointerDown}
                onPointerMove={handleSeekPointerMove}
                onPointerUp={handleSeekPointerUp}
                onPointerCancel={handleSeekPointerUp}
                className="relative h-1.5 hover:h-2 flex-1 bg-white/12 rounded-full cursor-pointer flex items-center overflow-hidden transition-all touch-none"
                title="İlerlet"
              >
                <div
                  className="h-full bg-white/85 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono tabular-nums text-white/50 w-9">
                -{formatTime(remainingSeconds)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* Bottom-Left: Unboxed Track Info */}
              <div className="min-w-0 text-center md:text-left">
                <div className="text-base sm:text-lg font-semibold tracking-tight text-white truncate">
                  {activeTrack.name}
                </div>
                <div className="text-xs sm:text-sm text-white/55 truncate">
                  {activeTrack.artist}
                </div>
              </div>

              {/* Bottom-Center: Minimal Transport Controls */}
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={onToggleShuffle}
                  title="Karışık"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isShuffle ? 'text-white' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onPrevious}
                  title="Önceki"
                  className="p-2 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  title={isPlaying ? 'Duraklat' : 'Oynat'}
                  className="w-12 h-12 rounded-full bg-white text-neutral-950 hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-neutral-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  title="Sonraki"
                  className="p-2 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={onToggleRepeat}
                  title="Tekrar"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isRepeat ? 'text-white' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom-Right: MD Vinyl 3-View Switcher + Conditional CountTo Music Sing Button */}
              <div className="flex justify-center md:justify-end">
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/[0.1] border border-white/15 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setView('crate3d')}
                    title="3D Plak Seçici"
                    className={`w-10 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      view === 'crate3d'
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('turntable');
                      setIsSingActive(false);
                    }}
                    title="Pikap"
                    className={`w-10 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      view === 'turntable' && !isSingActive
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Disc3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('search')}
                    title="Ara & Liste"
                    className={`w-10 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      view === 'search'
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>

                  <AnimatePresence initial={false}>
                    {hasLyrics && (
                      <motion.button
                        key="countto-sing-btn"
                        type="button"
                        layout
                        initial={{ opacity: 0, scale: 0.5, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 40, marginLeft: 2 }}
                        exit={{ opacity: 0, scale: 0.5, width: 0, marginLeft: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                        onClick={() => {
                          if (view !== 'turntable') {
                            setView('turntable');
                            setIsSingActive(true);
                          } else {
                            setIsSingActive((prev) => !prev);
                          }
                        }}
                        title="CountTo Music Sing"
                        className={`h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          view === 'turntable' && isSingActive
                            ? 'bg-white text-neutral-950 shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <MicVocal className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
