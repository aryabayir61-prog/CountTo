import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headphones, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Moon, 
  CloudRain, 
  Play, 
  Pause,
  ChevronUp,
} from 'lucide-react';
import { ThemeConfig } from '../types/countdown';
import { 
  AMBIENT_STATIONS, 
  AmbientStationId, 
  subscribeToAmbientState, 
  setAmbientStation, 
  setAmbientVolume, 
  toggleAmbient,
  playAmbient,
  stopAmbient
} from '../utils/lofiAudio';
import { playHoverClickSound } from '../utils/audio';

interface LofiAmbientControlProps {
  theme: ThemeConfig;
}

export const LofiAmbientControl: React.FC<LofiAmbientControlProps> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ambientState, setAmbientState] = useState({
    isPlaying: false,
    station: 'chillhop' as AmbientStationId,
    volume: 0.45,
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAmbientState((state) => {
      setAmbientState(state);
    });
    return () => unsubscribe();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeStation = AMBIENT_STATIONS[ambientState.station] || AMBIENT_STATIONS.chillhop;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHoverClickSound(0.08);
    toggleAmbient();
  };

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHoverClickSound(0.06);
    setIsOpen(!isOpen);
  };

  const getStationIcon = (id: AmbientStationId) => {
    switch (id) {
      case 'chillhop':
        return <Headphones className="w-4 h-4 text-amber-400" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'cosmic':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      {/* Main Control Bar Button Group */}
      <div
        className={`inline-flex items-center rounded-full text-xs font-semibold transition-all duration-200 select-none ${
          ambientState.isPlaying
            ? 'text-neutral-950 shadow-sm border'
            : 'text-neutral-400 hover:text-white border border-transparent hover:bg-white/5'
        }`}
        style={
          ambientState.isPlaying
            ? {
                backgroundColor: theme.primary,
                borderColor: `${theme.primary}dd`,
                boxShadow: `0 4px 15px -3px ${theme.glow}`,
              }
            : undefined
        }
      >
        {/* Toggle Play / Pause Button */}
        <button
          onClick={handleToggle}
          title={ambientState.isPlaying ? 'Ambiyans Müziğini Durdur' : 'Kaliteli 24/7 Lo-Fi Müziği Başlat'}
          className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer rounded-l-full"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span className={ambientState.isPlaying ? 'font-bold' : ''}>
            {ambientState.isPlaying ? 'Lo-Fi' : 'Ambiyans'}
          </span>

          {/* Animated Waveform Equalizer when playing */}
          {ambientState.isPlaying && (
            <div className="flex items-end gap-[2px] h-3 ml-0.5">
              <span className="w-[2px] h-2 bg-neutral-950 rounded-full animate-pulse" />
              <span className="w-[2px] h-3 bg-neutral-950 rounded-full animate-bounce" />
              <span className="w-[2px] h-1.5 bg-neutral-950 rounded-full animate-pulse" />
            </div>
          )}
        </button>

        {/* Mini Chevron for Menu Options */}
        <button
          onClick={handleOpenMenu}
          title="Lo-Fi İstasyonları ve Ses Ayarı"
          className={`p-1.5 pr-2.5 rounded-r-full transition-colors cursor-pointer border-l ${
            ambientState.isPlaying
              ? 'border-neutral-950/20 hover:bg-black/10 text-neutral-950'
              : 'border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <ChevronUp className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popover Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 rounded-2xl bg-neutral-900/95 border border-white/15 p-4 backdrop-blur-xl shadow-2xl z-50 text-left select-none"
            style={{
              boxShadow: `0 16px 40px -10px rgba(0,0,0,0.8), 0 0 20px -2px ${theme.glow}`,
            }}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">
                  24/7 Lo-Fi & Ambiyans
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ambientState.isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
                <span className="text-[10px] font-semibold text-neutral-400">
                  {ambientState.isPlaying ? 'Canlı Çalıyor' : 'Durduruldu'}
                </span>
              </div>
            </div>

            {/* Station Cards */}
            <div className="space-y-1.5 mb-3.5">
              {(Object.keys(AMBIENT_STATIONS) as AmbientStationId[]).map((stId) => {
                const st = AMBIENT_STATIONS[stId];
                const isSelected = ambientState.station === stId;
                return (
                  <button
                    key={stId}
                    onClick={() => {
                      playHoverClickSound(0.06);
                      setAmbientStation(stId);
                      if (!ambientState.isPlaying) {
                        playAmbient(stId);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 mt-0.5 shrink-0">
                      {getStationIcon(stId)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{st.name}</span>
                        {isSelected && ambientState.isPlaying && (
                          <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {st.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider & Playback Button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                {ambientState.volume <= 0.05 ? (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={ambientState.volume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="text-[11px] font-mono text-neutral-400 w-8 text-right">
                  {Math.round(ambientState.volume * 100)}%
                </span>
              </div>

              <button
                onClick={handleToggle}
                className="px-3 py-1.5 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
              >
                {ambientState.isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-neutral-950" />
                    <span>Durdur</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-neutral-950" />
                    <span>Başlat</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
