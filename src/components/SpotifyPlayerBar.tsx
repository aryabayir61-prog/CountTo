import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Heart, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  Disc3,
  X
} from 'lucide-react';
import { SpotifyTrack } from '../types/music';

interface SpotifyPlayerBarProps {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
  isFavorite: boolean;
  onClose?: () => void;
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
}) => {
  const [showEmbed, setShowEmbed] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  if (!track) return null;

  return (
    <>
      {/* Floating Modern Spotify Player Bar (Persistent across all tabs) */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-xl w-full select-none"
      >
        <div className="bg-neutral-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-white">
          {/* Left: Album Artwork & Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
              <img
                src={track.albumCover}
                alt={track.name}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Disc3 className="w-6 h-6 text-[#1DB954] animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="text-xs sm:text-sm font-bold truncate text-white">
                {track.name}
              </span>
              <span className="text-[11px] text-neutral-400 truncate">
                {track.artist}
              </span>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrevious}
              title="Önceki Şarkı"
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-[#1DB954] text-neutral-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              title="Sonraki Şarkı"
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Right: Actions (Spotify Embed Toggle, Favorite, Spotify Link) */}
          <div className="flex items-center gap-2 shrink-0">
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
              onClick={() => setShowEmbed((prev) => !prev)}
              title="Resmi Spotify Oynatıcıyı Göster / Gizle"
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                showEmbed
                  ? 'bg-[#1DB954]/20 border-[#1DB954]/50 text-[#1DB954]'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
              }`}
            >
              <span className="hidden md:inline text-[11px]">Spotify Oynatıcı</span>
              {showEmbed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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

        {/* Embedded Official Spotify Player Modal / Widget */}
        <AnimatePresence>
          {showEmbed && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              className="mt-2 rounded-2xl overflow-hidden border border-[#1DB954]/40 shadow-2xl bg-black"
            >
              <iframe
                title={`Spotify Player - ${track.name}`}
                src={`https://open.spotify.com/embed/track/${track.spotifyUri.replace('spotify:track:', '')}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
