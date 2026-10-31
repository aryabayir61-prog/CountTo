import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Sparkles, Keyboard } from 'lucide-react';
import { ThemeConfig } from '../types/countdown';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

interface ShortcutItem {
  key: string;
  description: string;
  category: 'Genel' | 'Görünüm' | 'Kontrol';
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const shortcuts: ShortcutItem[] = [
    { key: 'F', description: 'Tam Ekran Modunu Aç / Çık', category: 'Genel' },
    { key: 'T', description: 'Temalar Sayfasına Geç / Geri Dön', category: 'Genel' },
    { key: 'N', description: 'Yeni Geri Sayım Oluştur', category: 'Genel' },
    { key: 'L', description: 'Etkinlikler Listesine Git / Dön', category: 'Genel' },
    { key: 'E', description: 'Aktif Geri Sayımı Düzenle', category: 'Kontrol' },
    { key: 'S', description: 'Saat Sesi & Tik-Tak Sesini Aç / Kapat', category: 'Kontrol' },
    { key: 'M', description: 'Saliseyi (Milisaniye) Aç / Kapat', category: 'Kontrol' },
    { key: 'G', description: "Okul Güvenlik Koruması ('Okullarda Müzik kullanılamaz.')", category: 'Kontrol' },
    { key: '1 - 5', description: 'Animasyon Stilini Değiştir (CountTo, Flip, Halkalar...)', category: 'Görünüm' },
    { key: 'Çift Tık', description: 'Tıkladığınız yerde Widget (Not / Hava Durumu) menüsünü açar', category: 'Kontrol' },
    { key: 'Esc', description: 'Pencereleri Kapat / Geri Sayıma Dön', category: 'Genel' },
    { key: '?', description: 'Klavye Kısayolları Kılavuzunu Aç', category: 'Genel' },
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-3xl bg-neutral-900/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
            style={{
              boxShadow: `0 20px 50px -10px ${theme.glow}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl text-neutral-950 font-bold flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Keyboard className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                    Klavye Kısayolları
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Uygulamayı klavyenizden hızla yönetin
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Kapat (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcut Grid */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {shortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <span className="text-xs text-neutral-300 font-medium">
                    {item.description}
                  </span>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-neutral-800 rounded-lg border border-white/15 shadow-inner">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer Tip */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Herhangi bir ekrandayken <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">?</kbd> tuşuna basarak açabilirsiniz
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Anladım
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
