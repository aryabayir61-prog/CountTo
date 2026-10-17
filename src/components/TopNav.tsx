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

const EASTER_EGG_PHRASES = [
  'CountTo',
  'Knk hadi işte tema seç',
  'ne bakıyon tam ekran yap',
  'Tek başıma kurdum yaktım',
  'Bizler divayız saate bakarız',
];

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

  // Easter Egg typewriter loop state
  const [displayText, setDisplayText] = React.useState<string>('CountTo');
  const [phraseIndex, setPhraseIndex] = React.useState<number>(0);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const currentTarget = EASTER_EGG_PHRASES[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      if (displayText.length < currentTarget.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, 70);
      } else {
        // Pause at full text: CountTo waits a full 1 minute (60s) before looping again
        const pauseTime = currentTarget === 'CountTo' ? 60000 : 4200;
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Deleting backward (dot moves back erasing letters)
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 55);
      } else {
        // Completely erased: pause then switch to next phrase
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % EASTER_EGG_PHRASES.length);
        }, 320);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <header className="w-full border-b border-white/10 backdrop-blur-2xl bg-neutral-950/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
        {/* Zone 1: Interactive Wordmark with Backspacing Easter Egg (Pinned to left, never pushes middle tabs) */}
        <div className="flex items-center min-w-0 max-w-[calc(50%-160px)] sm:max-w-[calc(50%-180px)] z-10">
          <button
            onClick={() => onNavigate('display')}
            className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 focus-visible:outline-none cursor-pointer shrink-0 select-none group min-w-0"
            title="CountTo"
          >
            <span className="inline-block tracking-tight transition-all duration-75 whitespace-nowrap truncate">
              {displayText}
            </span>
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse shrink-0 transition-transform duration-100" 
              style={{ 
                backgroundColor: theme.primary,
                boxShadow: `0 0 10px ${theme.primary}`,
              }} 
            />
          </button>
        </div>

        {/* Zone 2: Modern Segmented Pill Switcher - Absolutely Centered so it NEVER shifts */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto z-20">
          <div className="p-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-xl flex items-center shadow-inner relative">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="relative px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold select-none whitespace-nowrap transition-colors focus-visible:outline-none cursor-pointer"
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

        {/* Zone 3: Primary action button (Pinned to right) */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-1.5 text-xs font-bold text-neutral-950 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 whitespace-nowrap border border-white/20 cursor-pointer"
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
