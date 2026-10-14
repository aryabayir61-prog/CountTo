import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';

interface TopNavProps {
  currentTheme: ThemeId;
  activeView: 'display' | 'list' | 'themes';
  onNavigate: (view: 'display' | 'list' | 'themes') => void;
  onOpenCreateModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTheme,
  activeView,
  onNavigate,
  onOpenCreateModal,
}) => {
  const theme = THEMES[currentTheme];

  const navItems: { id: 'display' | 'list' | 'themes'; label: string }[] = [
    { id: 'display', label: 'Geri Sayım' },
    { id: 'list', label: 'Etkinlikler' },
    { id: 'themes', label: 'Temalar' },
  ];

  return (
    <header className="w-full border-b border-white/10 backdrop-blur-2xl bg-neutral-950/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('display')}
          className="text-xl sm:text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 focus-visible:outline-none"
        >
          <span>CountTo</span>
          <span 
            className="w-2 h-2 rounded-full inline-block animate-pulse" 
            style={{ backgroundColor: theme.primary }} 
          />
        </button>

        {/* Zone 2: Modern Segmented Pill Switcher with Smooth Sliding Indicator */}
        <nav className="flex items-center">
          <div className="p-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-xl flex items-center shadow-inner relative">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="relative px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold select-none whitespace-nowrap transition-colors focus-visible:outline-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTopNavPill"
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
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-1.5 text-xs font-bold text-neutral-950 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 whitespace-nowrap border border-white/20"
            style={{
              backgroundColor: theme.primary,
            }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Yeni Ekle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
