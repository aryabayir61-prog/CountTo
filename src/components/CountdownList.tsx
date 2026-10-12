import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Trash2, 
  Edit2, 
  Plus, 
  Calendar, 
  Clock, 
  Search, 
  Share2,
  Sparkles
} from 'lucide-react';
import { CountdownEvent, ThemeConfig } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { formatShortDate, getTurkishRelativeTime } from '../utils/time';

interface CountdownListProps {
  events: CountdownEvent[];
  activeEventId: string;
  theme: ThemeConfig;
  onSelectEvent: (id: string) => void;
  onEditEvent: (event: CountdownEvent) => void;
  onDeleteEvent: (id: string) => void;
  onOpenCreateModal: () => void;
  onShareEvent: (event: CountdownEvent) => void;
}

export const CountdownList: React.FC<CountdownListProps> = ({
  events,
  activeEventId,
  theme,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onOpenCreateModal,
  onShareEvent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.notes && ev.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedFilter === 'all' || ev.category === selectedFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 z-10">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Tüm Geri Sayımlarınız
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Kaydettiğiniz özel anları yönetin, düzenleyin veya yenilerini ekleyin.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-950 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Yeni Geri Sayım</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Geri sayımlarda ara..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-cyan-400/80 transition-colors"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center p-1 bg-neutral-900/90 rounded-full border border-white/10 overflow-x-auto shadow-inner relative">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'genel', label: 'Saat' },
            { id: 'kutlama', label: 'Kutlama' },
            { id: 'tatil', label: 'Tatil' },
            { id: 'is', label: 'İş / Hedef' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className="relative px-4 py-1.5 text-xs font-semibold rounded-full select-none whitespace-nowrap transition-colors focus-visible:outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-full border shadow-sm"
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: `${theme.primary}dd`,
                      boxShadow: `0 4px 15px -3px ${theme.glow}`,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Countdowns */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/5 bg-neutral-900/40 backdrop-blur-md">
          <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-300">Henüz eşleşen bir geri sayım bulunamadı.</p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Hemen Bir Tane Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((ev) => {
            const evTheme = THEMES[ev.theme] || theme;
            const isActive = ev.id === activeEventId;
            const isClock = ev.id === 'preset-current-time';
            const relativeTimeStr = isClock 
              ? 'Canlı Türkiye Saati (UTC+3)' 
              : getTurkishRelativeTime(ev.targetDate);

            return (
              <div
                key={ev.id}
                className={`relative rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl ${
                  isActive
                    ? 'border-white/30 bg-neutral-900/90 shadow-2xl'
                    : 'border-white/10 bg-neutral-900/50 hover:border-white/20 hover:bg-neutral-900/70'
                }`}
                style={{
                  boxShadow: isActive ? `0 10px 30px -10px ${evTheme.glow}` : undefined,
                }}
              >
                {/* Top Section */}
                <div>
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-medium text-neutral-300">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {isClock ? 'Canlı Saat' : formatShortDate(ev.targetDate)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {ev.style === 'countTo' ? 'CountTo' : ev.style === 'flip' ? '3D Flip' : ev.style === 'orbital' ? 'Halka' : ev.style === 'kinetic' ? 'Kinetik' : 'Monolit'}
                      </span>
                    </div>

                    {isActive && (
                      <span 
                        className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${evTheme.primary}25`, color: evTheme.primary }}
                      >
                        Aktif
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug flex items-center gap-2">
                    {isClock && <span>🇹🇷</span>}
                    <span>{ev.title}</span>
                  </h3>

                  {ev.notes && (
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {ev.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    {isClock && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />}
                    <span>{relativeTimeStr}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onShareEvent(ev)}
                      title="Paylaş"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {!isClock && (
                      <button
                        onClick={() => onEditEvent(ev)}
                        title="Düzenle"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {!isClock && (
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        title="Sil"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {!isActive && (
                      <button
                        onClick={() => onSelectEvent(ev.id)}
                        className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Görüntüle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
