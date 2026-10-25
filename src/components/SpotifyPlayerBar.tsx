import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Heart, 
  Repeat, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  X,
  Radio
} from 'lucide-react';
import { SpotifyTrack } from '../types/music';
import { audioPlayer } from '../utils/audioPlayerManager';

interface SpotifyPlayerBarProps {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
  isFavorite: boolean;
  onClose?: () => void;
  isFullscreen?: boolean;
  isFocusMode?: boolean;
}

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const SpotifyPlayerBar: React.FC<SpotifyPlayerBarProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorite,
  onClose,
  isFullscreen = false,
  isFocusMode = false,
}) => {
  const [playerState, setPlayerState] = useState(audioPlayer.getState());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekValue, setSeekValue] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setPlayerState(state);
      if (!isSeeking) {
        setSeekValue(state.currentTime);
      }
    });
    return unsubscribe;
  }, [isSeeking]);

  if (!track) return null;

  const effectiveDuration = playerState.duration || (track.durationMs ? track.durationMs / 1000 : 180);
  const currentPos = isSeeking ? seekValue : playerState.currentTime;
  const progressPercent = effectiveDuration > 0 ? (currentPos / effectiveDuration) * 100 : 0;

  // In focus mode in fullscreen, player gracefully fades to 15% opacity or auto-hides so it doesn't disturb the clock
  const isDimmed = isFullscreen && isFocusMode;

  return (
    <AnimatePresence>
      <motion.div
        key="spotify-player-bar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: isDimmed ? 0.2 : 1,
          scale: isDimmed ? 0.96 : 1,
        }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className={`fixed z-40 select-none transition-opacity duration-300 ${
          isFullscreen 
            ? 'bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg' 
            : 'bottom-4 left-4 right-4 sm:left-auto sm:right-6 max-w-lg w-full'
        }`}
      >
        {isMinimized ? (
          /* Minimized Compact Pill Mode */
          <div className="bg-neutral-900/90 border border-white/15 rounded-full px-4 py-2 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={track.albumCover}
                alt={track.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 animate-spin"
                style={{ animationDuration: isPlaying ? '6s' : '0s' }}
              />
              <span className="text-xs font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                {track.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-7 h-7 rounded-full bg-cyan-400 text-neutral-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {playerState.isBuffering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                title="Genişlet"
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Modern Rectangular Player Bar */
          <div className="bg-neutral-900/95 border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-2 text-white overflow-hidden relative group">
            {/* Top row: Track info, primary controls, and audio tools */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Album Artwork & Metadata */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <img
                    src={track.albumCover}
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && !playerState.isBuffering && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex flex-col">
                  <span className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
                    {track.name}
                  </span>
                  <span className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {track.artist}
                  </span>
                </div>
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onPrevious}
                  title="Önceki"
                  className="p-1.5 text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-neutral-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  {playerState.isBuffering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  title="Sonraki"
                  className="p-1.5 text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Right: Tools (Volume, Repeat, Favorite, Minimize, Close) */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => audioPlayer.toggleLoop()}
                  title={playerState.isLooping ? 'Döngü Açık' : 'Döngüyü Aç'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    playerState.isLooping ? 'text-cyan-400 bg-cyan-500/15' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => audioPlayer.toggleMute()}
                  title={playerState.isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {playerState.isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(track)}
                  title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Küçült"
                  className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    title="Kapat"
                    className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Scrubber Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] text-neutral-500 font-mono w-8 text-right shrink-0">
                {formatSeconds(currentPos)}
              </span>

              <div className="flex-1 relative h-2 flex items-center group/slider">
                <input
                  type="range"
                  min={0}
                  max={effectiveDuration || 180}
                  step={1}
                  value={currentPos}
                  onChange={(e) => {
                    setIsSeeking(true);
                    setSeekValue(Number(e.target.value));
                  }}
                  onMouseUp={(e) => {
                    setIsSeeking(false);
                    audioPlayer.seek(Number((e.target as HTMLInputElement).value));
                  }}
                  onTouchEnd={(e) => {
                    setIsSeeking(false);
                    audioPlayer.seek(Number((e.target as HTMLInputElement).value));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Background bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>

              <span className="text-[10px] text-neutral-500 font-mono w-8 text-left shrink-0">
                {formatSeconds(effectiveDuration)}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
