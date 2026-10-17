import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, Volume2, Heart } from 'lucide-react';
import { RecommendationResult, SpotifyTrack } from '../types/music';

interface RecommendedMusicSliderProps {
  recommendations: RecommendationResult[];
  activeTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: SpotifyTrack) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
  isFavorite: (trackId: string) => boolean;
}

export const RecommendedMusicSlider: React.FC<RecommendedMusicSliderProps> = ({
  recommendations,
  activeTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onToggleFavorite,
  isFavorite,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = Math.min(6, recommendations.length);
  const items = recommendations.slice(0, total);

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (isPaused || total === 0) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  if (total === 0) return null;

  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div
      className="mb-8 relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mini Title Label with Spotify Icon & Pulsing Dot */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wide text-neutral-200 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
            <span>Sizin İçin Önerilenler</span>
            <span className="text-[10px] lowercase text-[#1DB954] font-normal px-2 py-0.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 hidden sm:inline">
              CountTo Dinleme Algoritması
            </span>
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400 font-medium">
          {activeIndex + 1} / {total}
        </span>
      </div>

      {/* 3D Stepped Carousel Stage */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden flex items-center justify-center py-1">
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          {items.map((rec, idx) => {
            const offset = getOffset(idx);
            const isCenter = offset === 0;
            const isThisPlaying = activeTrack?.id === rec.track.id && isPlaying;
            const isFav = isFavorite(rec.track.id);

            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            let translateX = 0;
            let scale = 1;
            let zIndex = 30;
            let filter = 'none';

            if (offset === 0) {
              translateX = 0;
              scale = 1;
              zIndex = 30;
              filter = 'none';
            } else if (offset === -1) {
              translateX = -180;
              scale = 0.86;
              zIndex = 20;
              filter = 'brightness(0.65)';
            } else if (offset === 1) {
              translateX = 180;
              scale = 0.86;
              zIndex = 20;
              filter = 'brightness(0.65)';
            } else if (offset === -2) {
              translateX = -320;
              scale = 0.72;
              zIndex = 10;
              filter = 'brightness(0.35)';
            } else if (offset === 2) {
              translateX = 320;
              scale = 0.72;
              zIndex = 10;
              filter = 'brightness(0.35)';
            }

            return (
              <div
                key={rec.track.id}
                onClick={() => {
                  if (offset !== 0) {
                    setActiveIndex(idx);
                  } else {
                    if (activeTrack?.id === rec.track.id) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(rec.track);
                    }
                  }
                }}
                className={`absolute w-72 sm:w-84 rounded-3xl border p-4 sm:p-5 transition-all duration-500 ease-out cursor-pointer overflow-hidden backdrop-blur-2xl ${
                  isCenter
                    ? 'border-[#1DB954]/60 bg-neutral-900/95 ring-2 ring-[#1DB954]/25 shadow-2xl'
                    : 'border-white/10 bg-neutral-900/70 hover:border-white/20'
                }`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  filter,
                  boxShadow: isCenter
                    ? '0 20px 45px -10px rgba(29, 185, 84, 0.3)'
                    : undefined,
                }}
              >
                {/* Artwork & Playing Indicator */}
                <div className="relative h-32 sm:h-36 w-full rounded-2xl overflow-hidden mb-3.5 bg-neutral-950 flex items-center justify-center group">
                  <img
                    src={rec.track.albumCover}
                    alt={rec.track.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Play / Pause Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform ${
                        isThisPlaying
                          ? 'bg-[#1DB954] text-neutral-950 scale-100 shadow-lg'
                          : 'bg-black/60 text-white backdrop-blur-md hover:bg-[#1DB954] hover:text-neutral-950 hover:scale-110'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Top Badges: Match Score & Favorite */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1DB954] text-neutral-950 shadow-md">
                      %{rec.matchPercentage} Uyum
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(rec.track);
                      }}
                      className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Track Information */}
                <div className="flex flex-col">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {rec.track.name}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mb-2">
                    {rec.track.artist}
                  </p>

                  {/* Algorithmic Reason Tag */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 truncate max-w-[210px]">
                      {rec.reason}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#1DB954]/50" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
