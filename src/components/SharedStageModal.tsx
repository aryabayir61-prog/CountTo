import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Copy,
  Check,
  LogOut,
  Pause,
  Play,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Mic,
} from 'lucide-react';
import {
  CountdownEvent,
  SharedStageRoomState,
  StageParticipant,
  ThemeConfig,
} from '../types/countdown';
import { StageConnectionStatus } from '../hooks/useSharedStageRoom';

interface SharedStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  activeEvent: CountdownEvent;
  roomState: SharedStageRoomState | null;
  selfId: string | null;
  connectionStatus: StageConnectionStatus;
  errorMessage: string | null;
  participantName: string;
  onSaveParticipantName: (name: string) => void;
  onCreateRoom: (customName: string) => Promise<string | null>;
  onJoinRoom: (code: string, customName: string) => void;
  onLeaveRoom: () => void;
  onTogglePauseRoom: () => void;
  onBroadcastCelebration: () => void;
  onOpenClapSettings: () => void;
}

export const SharedStageModal: React.FC<SharedStageModalProps> = ({
  isOpen,
  onClose,
  theme,
  activeEvent,
  roomState,
  selfId,
  connectionStatus,
  errorMessage,
  participantName,
  onSaveParticipantName,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onTogglePauseRoom,
  onBroadcastCelebration,
  onOpenClapSettings,
}) => {
  const [nameInput, setNameInput] = useState<string>(participantName);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const shareUrl = React.useMemo(() => {
    if (typeof window === 'undefined' || !roomState) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomState.roomCode);
    url.searchParams.set('title', roomState.event.title);
    url.searchParams.set('target', roomState.event.targetDate);
    url.searchParams.set('style', roomState.event.style);
    url.searchParams.set('theme', roomState.event.theme);
    return url.toString();
  }, [roomState]);

  const handleCopyInvite = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback
    }
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2400);
  };

  const handleCopyCode = async () => {
    if (!roomState) return;
    try {
      await navigator.clipboard.writeText(roomState.roomCode);
    } catch {
      // Fallback
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateSubmit = async () => {
    setIsCreating(true);
    try {
      onSaveParticipantName(nameInput);
      await onCreateRoom(nameInput);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = joinCodeInput.trim().toUpperCase();
    if (!cleaned) return;
    onSaveParticipantName(nameInput);
    onJoinRoom(cleaned, nameInput);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Single-Elevation Modal Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/12 p-6 sm:p-7 shadow-2xl text-neutral-100 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="text-xs font-medium text-neutral-400 mb-1 flex items-center gap-2">
                  <span>Çok Kullanıcılı Canlı Senkronizasyon</span>
                  {roomState && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-numbers text-neutral-300">
                        {connectionStatus === 'connected'
                          ? 'Bağlı'
                          : connectionStatus === 'reconnecting'
                            ? 'Yeniden bağlanıyor...'
                            : 'Bağlanıyor...'}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Ortak Etkinlik Sahnesi
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Ekibiniz veya arkadaşlarınızla aynı geri sayımı eşzamanlı takip edin, canlı alkış
                  ve tepki gönderin.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Participant Display Name Row */}
            <div className="py-4 border-b border-white/10">
              <label
                htmlFor="stage-participant-name"
                className="block text-xs font-semibold text-neutral-300 mb-2"
              >
                Sahne Adınız
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="stage-participant-name"
                  type="text"
                  maxLength={32}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => onSaveParticipantName(nameInput)}
                  placeholder="Örn: Emre, Zeynep, Ekip..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
                {roomState && (
                  <button
                    type="button"
                    onClick={() => onSaveParticipantName(nameInput)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Güncelle
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-4 flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Branch A: Not Currently In a Room -> Create or Join */}
            {!roomState ? (
              <div className="pt-5 space-y-6">
                {/* Option 1: Host Current Countdown */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Yeni Ortak Sahne Başlat
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Seçili etkinlik:{' '}
                      <span className="text-neutral-200 font-medium">{activeEvent.title}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={handleCreateSubmit}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-neutral-950 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Users className="w-4 h-4 stroke-[2.25]" />
                    <span>
                      {isCreating
                        ? 'Sahne Oluşturuluyor...'
                        : 'Canlı Ortak Sahne Oluştur ve Paylaş'}
                    </span>
                  </button>
                </div>

                <div className="border-t border-white/10" />

                {/* Option 2: Join Existing Room via Code */}
                <form onSubmit={handleJoinSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="stage-join-code"
                      className="block text-sm font-semibold text-white"
                    >
                      Oda Koduyla Katıl
                    </label>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Size paylaşılan 6 haneli etkinlik sahnesi kodunu girin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="stage-join-code"
                      type="text"
                      maxLength={12}
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="Örn: K7M9P2"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 font-mono-numbers text-sm font-bold tracking-widest text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-white/30"
                    />
                    <button
                      type="submit"
                      disabled={!joinCodeInput.trim() || connectionStatus === 'connecting'}
                      className="px-5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {connectionStatus === 'connecting' ? 'Bağlanıyor...' : 'Katıl'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Branch B: Active Connected Shared Stage Room */
              <div className="pt-5 space-y-5">
                {/* Clean Typographic Room Summary (Zero Static Pills) */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="text-neutral-400">Oda Kodu:</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="font-mono-numbers text-base font-bold text-white tracking-wider hover:opacity-80 transition-opacity inline-flex items-center gap-1.5 cursor-pointer"
                      title="Oda Kodunu Kopyala"
                    >
                      <span>{roomState.roomCode}</span>
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </button>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="font-mono-numbers">{roomState.participantCount} Katılımcı</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="font-mono-numbers">{roomState.totalClaps} Alkış</span>
                  </div>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                    style={{ color: theme.primary }}
                  >
                    <span>Yeni Sekmede Test Et</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Invite Link Copy */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Canlı Davet Bağlantısı
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-neutral-300 font-mono text-xs select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="px-4 py-2 rounded-xl text-neutral-950 font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {copiedInvite ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Synchronized Stage Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={onTogglePauseRoom}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {roomState.event.isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                        <span>Sayacı Başlat</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Herkes İçin Duraklat</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onBroadcastCelebration}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    <span>Konfeti Başlat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenClapSettings();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                    <span>Alkış Mikrofonu</span>
                  </button>
                </div>

                {/* Live Participant List (Single-level list with clean hairline separators) */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs font-semibold text-neutral-300 mb-2.5">
                    Sahnedeki Katılımcılar
                  </div>
                  <div className="divide-y divide-white/5 max-h-40 overflow-y-auto">
                    {roomState.participants.map((p: StageParticipant) => {
                      const isSelf = p.id === selfId;
                      return (
                        <div
                          key={p.id}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-white truncate">
                              {p.name}
                            </span>
                            {isSelf && (
                              <span className="text-neutral-400">(Siz)</span>
                            )}
                            {p.isHost && (
                              <>
                                <span aria-hidden="true" className="text-neutral-600">·</span>
                                <span style={{ color: theme.primary }} className="font-medium">
                                  Sahne Yöneticisi
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-neutral-400 shrink-0">
                            {p.clapActive ? 'Mikrofon Açık' : 'İzleyici'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leave Room Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onLeaveRoom}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Odadan Ayrıl</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Sahneye Dön
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
