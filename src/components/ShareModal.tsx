import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { CountdownEvent } from '../types/countdown';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CountdownEvent | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  // Build shareable link
  const url = new URL(window.location.href);
  url.searchParams.set('title', event.title);
  url.searchParams.set('target', event.targetDate);
  url.searchParams.set('style', event.style);
  url.searchParams.set('theme', event.theme);
  if (event.notes) {
    url.searchParams.set('notes', event.notes);
  }
  const shareableUrl = url.toString();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Geri Sayımı Paylaş</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Arkadaşlarınız veya ekibiniz bu bağlantıyı açtığında aynı geri sayımı canlı olarak görebilir.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Etkinlik Bağlantısı
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-neutral-300 font-mono text-xs select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-neutral-300">
            <div className="font-semibold text-white mb-1">{event.title}</div>
            <div className="text-neutral-400">
              Hedef: {new Date(event.targetDate).toLocaleString('tr-TR')}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
