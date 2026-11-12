import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Maximize2,
  PauseCircle,
  AlertCircle,
} from 'lucide-react';
import { ThemeConfig } from '../types/countdown';
import {
  ClapSensitivity,
  DoubleClapAction,
  isSpeechRecognitionSupported,
} from '../utils/clapDetector';

interface HandsFreeClapPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  isMicListening: boolean;
  micLevel: number;
  isClapPeakFlashing: boolean;
  micError: string | null;
  sensitivity: ClapSensitivity;
  doubleClapAction: DoubleClapAction;
  voiceCommandsEnabled: boolean;
  isInRoom: boolean;
  onToggleMic: () => void;
  onChangeSensitivity: (s: ClapSensitivity) => void;
  onChangeDoubleClapAction: (action: DoubleClapAction) => void;
  onToggleVoiceCommands: () => void;
  onTestApplause: () => void;
}

export const HandsFreeClapPopover: React.FC<HandsFreeClapPopoverProps> = ({
  isOpen,
  onClose,
  theme,
  isMicListening,
  micLevel,
  isClapPeakFlashing,
  micError,
  sensitivity,
  doubleClapAction,
  voiceCommandsEnabled,
  isInRoom,
  onToggleMic,
  onChangeSensitivity,
  onChangeDoubleClapAction,
  onToggleVoiceCommands,
  onTestApplause,
}) => {
  const voiceSupported = isSpeechRecognitionSupported();

  const sensitivityOptions: { id: ClapSensitivity; label: string }[] = [
    { id: 'high', label: 'Hassas' },
    { id: 'medium', label: 'Normal' },
    { id: 'low', label: 'Yüksek Eşik' },
  ];

  const doubleClapOptions: {
    id: DoubleClapAction;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'fullscreen',
      label: 'Tam Ekran',
      icon: <Maximize2 className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'celebrate',
      label: 'Konfeti Kutlama',
      icon: <Sparkles className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'pause',
      label: 'Duraklat / Başlat',
      icon: <PauseCircle className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

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
            className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-white/12 p-6 sm:p-7 shadow-2xl text-neutral-100 z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="text-xs font-medium text-neutral-400 mb-1">
                  Akustik Kontrol · Kısayol: K
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Alkışlamayı Unutma
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Mikrofonunuz ellerinizi çırptığınızı gerçek zamanlı algılar ve sahneye canlı
                  alkış dalgası gönderir.
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

            {/* Primary Microphone Toggle & Live Level Meter */}
            <div className="py-5 border-b border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Mikrofon Alkış Algılama
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {isMicListening
                      ? isInRoom
                        ? 'Aktif · Alkışlarınız Ortak Etkinlik Sahnesine iletiliyor'
                        : 'Aktif · Tek alkışta sahne alkışı, çift alkışta seçili eylem çalışır'
                      : 'Kapalı · Başlatmak için mikrofon erişimi verin'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    isMicListening
                      ? 'bg-white/12 text-white border border-white/20 hover:bg-white/18'
                      : 'text-neutral-950 shadow-md hover:brightness-110'
                  }`}
                  style={!isMicListening ? { backgroundColor: theme.primary } : undefined}
                >
                  {isMicListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Durdur</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dinlemeyi Başlat</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-time Audio Level & Clap Peak Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Canlı Mikrofon Seviyesi</span>
                  <span
                    className={`font-mono-numbers font-semibold transition-colors ${
                      isClapPeakFlashing ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {isClapPeakFlashing
                      ? 'Alkış Algılandı!'
                      : isMicListening
                        ? `%${Math.round(micLevel * 100)}`
                        : 'Beklemede'}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full w-full origin-left rounded-full transition-transform duration-75 will-change-transform"
                    style={{
                      backgroundColor: isClapPeakFlashing ? '#ffffff' : theme.primary,
                      transform: `scaleX(${isMicListening ? Math.max(0.03, micLevel) : 0})`,
                    }}
                  />
                </div>
              </div>

              {micError && (
                <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{micError}</span>
                </div>
              )}
            </div>

            {/* Sensitivity & Double-Clap Action Configuration */}
            <div className="py-5 border-b border-white/10 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-neutral-200">Alkış Hassasiyeti</span>
                  <span className="text-neutral-400">Ortam gürültüsüne göre ayarlayın</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
                  {sensitivityOptions.map((opt) => {
                    const active = sensitivity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeSensitivity(opt.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'text-neutral-950 font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        style={active ? { backgroundColor: theme.primary } : undefined}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-neutral-200">Çift Alkış Eylemi</span>
                  <span className="text-neutral-400">Tek alkış her zaman 👏 gönderir</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
                  {doubleClapOptions.map((opt) => {
                    const active = doubleClapAction === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeDoubleClapAction(opt.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          active
                            ? 'text-neutral-950 font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                        style={active ? { backgroundColor: theme.primary } : undefined}
                      >
                        {opt.icon}
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Turkish Voice Commands Toggle */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    Türkçe Sesli Komutlar
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {voiceSupported
                      ? '“Başlat”, “Durdur”, “Tam ekran”, “Alkışla”, “Konfeti”'
                      : 'Bu tarayıcıda konuşma tanıma desteklenmiyor'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!voiceSupported}
                  onClick={onToggleVoiceCommands}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    voiceCommandsEnabled && voiceSupported
                      ? 'text-neutral-950 font-bold'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/15'
                  }`}
                  style={
                    voiceCommandsEnabled && voiceSupported
                      ? { backgroundColor: theme.primary }
                      : undefined
                  }
                >
                  {voiceCommandsEnabled && voiceSupported ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onTestApplause}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/12 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <span>Alkış Sesi & Dalga Test Et</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/12 hover:bg-white/18 text-xs font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                Tamam
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
