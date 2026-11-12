import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Users, Pause, Play, Sparkles, Volume2 } from 'lucide-react';
import {
  SharedStageRoomState,
  StageReactionType,
  ThemeConfig,
} from '../types/countdown';
import { FloatingStageReaction, StageConnectionStatus } from '../hooks/useSharedStageRoom';

interface SharedStageOverlayProps {
  theme: ThemeConfig;
  roomState: SharedStageRoomState | null;
  connectionStatus: StageConnectionStatus;
  floatingReactions: FloatingStageReaction[];
  isMicListening: boolean;
  micLevel: number;
  lastVoiceTranscript: string | null;
  lastClapFeedback: 'single' | 'double' | null;
  isFocusMode: boolean;
  onSendReaction: (type: StageReactionType, viaClap?: boolean) => void;
  onTogglePauseRoom?: () => void;
  onOpenStageModal: () => void;
  onOpenClapSettings: () => void;
}

const REACTION_META: Record<
  StageReactionType,
  { symbol: string; label: string; glowColor: string }
> = {
  clap: { symbol: '👏', label: 'Alkışladı', glowColor: 'rgba(250, 204, 21, 0.5)' },
  confetti: { symbol: '🎉', label: 'Kutladı', glowColor: 'rgba(56, 189, 248, 0.5)' },
  sparkle: { symbol: '✨', label: 'Parıldadı', glowColor: 'rgba(167, 139, 250, 0.5)' },
  heart: { symbol: '❤️', label: 'Beğendi', glowColor: 'rgba(244, 63, 94, 0.5)' },
  fire: { symbol: '🔥', label: 'Harika!', glowColor: 'rgba(249, 115, 22, 0.5)' },
};

const QUICK_REACTION_BUTTONS: { type: StageReactionType; symbol: string; title: string }[] = [
  { type: 'clap', symbol: '👏', title: 'Alkışla' },
  { type: 'confetti', symbol: '🎉', title: 'Konfeti Gönder' },
  { type: 'sparkle', symbol: '✨', title: 'Yıldız Gönder' },
  { type: 'heart', symbol: '❤️', title: 'Kalp Gönder' },
  { type: 'fire', symbol: '🔥', title: 'Harika!' },
];

export const SharedStageOverlay: React.FC<SharedStageOverlayProps> = ({
  theme,
  roomState,
  connectionStatus,
  floatingReactions,
  isMicListening,
  micLevel,
  lastVoiceTranscript,
  lastClapFeedback,
  isFocusMode,
  onSendReaction,
  onTogglePauseRoom,
  onOpenStageModal,
  onOpenClapSettings,
}) => {
  const showBottomDock = !isFocusMode && (Boolean(roomState) || isMicListening);

  return (
    <>
      {/* 1. Floating Multi-User & Acoustic Clap Reactions Layer (GPU Compositor Only) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      >
        <AnimatePresence>
          {floatingReactions.map((rx) => {
            const meta = REACTION_META[rx.type] || REACTION_META.clap;
            return (
              <motion.div
                key={rx.reactionId}
                initial={{
                  opacity: 0,
                  y: '86vh',
                  scale: 0.55 * rx.scale,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: ['86vh', '54vh', '26vh', '10vh'],
                  scale: [0.6 * rx.scale, 1.08 * rx.scale, 1.0 * rx.scale, 0.88 * rx.scale],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  left: `${rx.lane}%`,
                }}
                className="fixed top-0 -translate-x-1/2 flex flex-col items-center select-none will-change-transform"
              >
                <div className="relative flex items-center justify-center">
                  {rx.viaClap && (
                    <motion.span
                      initial={{ opacity: 0.85, scale: 0.7 }}
                      animate={{ opacity: 0, scale: 2.15 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: theme.primary,
                      }}
                    />
                  )}
                  <span
                    className="text-3xl sm:text-4xl leading-none"
                    style={{
                      filter: `drop-shadow(0 6px 16px ${meta.glowColor})`,
                    }}
                  >
                    {meta.symbol}
                  </span>
                </div>
                <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-neutral-950/85 border border-white/10 backdrop-blur-md text-[11px] font-medium text-neutral-200 whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <span className="font-semibold text-white">{rx.senderName}</span>
                  <span aria-hidden="true" className="text-neutral-500">·</span>
                  <span className="text-neutral-300">
                    {rx.viaClap ? 'Gerçek Alkış' : meta.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. Acoustic Clap / Voice Recognition Live Feedback Banner (Compact & Transient) */}
      <AnimatePresence>
        {(lastClapFeedback || lastVoiceTranscript) && (
          <motion.div
            key={lastVoiceTranscript || lastClapFeedback || 'feedback'}
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="px-4 py-1.5 rounded-xl bg-neutral-900/90 border border-white/15 backdrop-blur-xl text-xs text-neutral-100 shadow-2xl flex items-center gap-2 whitespace-nowrap">
              {lastVoiceTranscript ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
                  <span>Sesli Komut:</span>
                  <span className="font-semibold text-white">“{lastVoiceTranscript}”</span>
                </>
              ) : lastClapFeedback === 'double' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
                  <span className="font-semibold text-white">Çift Alkış Algılandı</span>
                </>
              ) : (
                <>
                  <span className="text-sm leading-none">👏</span>
                  <span className="font-semibold text-white">Alkış Algılandı</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Compact Docked Ortak Etkinlik Sahnesi & Hands-Free Clap Bar */}
      <AnimatePresence>
        {showBottomDock && (
          <motion.div
            key="shared-stage-dock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[96vw]"
          >
            <div className="px-3.5 py-2 rounded-2xl bg-neutral-900/92 border border-white/12 backdrop-blur-2xl shadow-2xl flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              {/* Live Room Unboxed Metadata & Room Controls Trigger */}
              {roomState ? (
                <button
                  type="button"
                  onClick={onOpenStageModal}
                  className="flex items-center gap-2 text-xs text-neutral-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none"
                  title="Ortak Etkinlik Sahnesi Ayarlarını Aç"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
                  <span className="font-mono-numbers font-bold text-white tracking-wider">
                    {roomState.roomCode}
                  </span>
                  <span aria-hidden="true" className="text-neutral-500">·</span>
                  <span className="font-mono-numbers text-neutral-300">
                    {roomState.participantCount} Katılımcı
                  </span>
                  <span aria-hidden="true" className="text-neutral-500">·</span>
                  <span className="font-mono-numbers text-neutral-300">
                    {roomState.totalClaps} Alkış
                  </span>
                  {connectionStatus === 'reconnecting' && (
                    <>
                      <span aria-hidden="true" className="text-neutral-500">·</span>
                      <span className="text-amber-300">Yeniden bağlanıyor...</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenClapSettings}
                  className="flex items-center gap-2 text-xs text-neutral-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Eller Serbest Alkış Ayarları"
                >
                  <Mic className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
                  <span className="font-medium">Alkış Algılama Açık</span>
                </button>
              )}

              <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />

              {/* Quick Live Reaction Triggers */}
              <div className="flex items-center gap-1 shrink-0">
                {QUICK_REACTION_BUTTONS.map((btn) => (
                  <button
                    key={btn.type}
                    type="button"
                    onClick={() => onSendReaction(btn.type, false)}
                    title={btn.title}
                    className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/12 active:scale-90 border border-white/5 hover:border-white/15 transition-all text-base leading-none flex items-center justify-center cursor-pointer select-none"
                  >
                    {btn.symbol}
                  </button>
                ))}
              </div>

              {/* Room Pause/Resume & Hands-Free Mic Level Indicator */}
              {(roomState || isMicListening) && (
                <>
                  <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    {roomState && onTogglePauseRoom && (
                      <button
                        type="button"
                        onClick={onTogglePauseRoom}
                        className="h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        title={
                          roomState.event.isPaused
                            ? 'Sahne Sayacını Devam Ettir'
                            : 'Sahne Sayacını Herkes İçin Duraklat'
                        }
                      >
                        {roomState.event.isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                            <span>Devam Et</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-neutral-300" />
                            <span>Duraklat</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onOpenClapSettings}
                      className={`h-8 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                        isMicListening
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                      title="Mikrofon Alkış ve Ses Komutu Ayarları"
                    >
                      {isMicListening ? (
                        <Mic className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primary }} />
                      ) : (
                        <MicOff className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{isMicListening ? 'Mikrofon' : 'Alkışla'}</span>
                      {isMicListening && (
                        <span className="w-8 h-1.5 rounded-full bg-black/50 overflow-hidden inline-flex items-center">
                          <span
                            className="h-full w-full origin-left rounded-full transition-transform duration-75"
                            style={{
                              backgroundColor: theme.primary,
                              transform: `scaleX(${Math.max(0.08, micLevel)})`,
                            }}
                          />
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
