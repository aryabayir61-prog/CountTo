import { ThemeConfig, ThemeId } from '../types/countdown';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  aurora: {
    id: 'aurora',
    name: 'Kutup Işığı (Aurora)',
    primary: '#06b6d4',      // cyan-500
    secondary: '#10b981',    // emerald-500
    glow: 'rgba(6, 182, 212, 0.25)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(6, 182, 212, 0.12) 0%, rgba(5, 10, 20, 0.98) 70%)',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    cardBorder: 'rgba(6, 182, 212, 0.2)',
    textAccent: 'text-cyan-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-cyan-200/70',
    ringColor: '#06b6d4',
  },
  cyber: {
    id: 'cyber',
    name: 'Siber Kor (Cyber Ember)',
    primary: '#f97316',      // orange-500
    secondary: '#ef4444',    // red-500
    glow: 'rgba(249, 115, 22, 0.25)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(249, 115, 22, 0.12) 0%, rgba(18, 10, 10, 0.98) 70%)',
    cardBg: 'rgba(28, 18, 16, 0.65)',
    cardBorder: 'rgba(249, 115, 22, 0.2)',
    textAccent: 'text-orange-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-orange-200/70',
    ringColor: '#f97316',
  },
  violet: {
    id: 'violet',
    name: 'Kozmik Menekşe (Cosmic Violet)',
    primary: '#a855f7',      // purple-500
    secondary: '#6366f1',    // indigo-500
    glow: 'rgba(168, 85, 247, 0.25)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(168, 85, 247, 0.12) 0%, rgba(14, 10, 25, 0.98) 70%)',
    cardBg: 'rgba(24, 18, 38, 0.65)',
    cardBorder: 'rgba(168, 85, 247, 0.2)',
    textAccent: 'text-purple-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-purple-200/70',
    ringColor: '#a855f7',
  },
  gold: {
    id: 'gold',
    name: 'Obsidyen Altın (Obsidian Gold)',
    primary: '#eab308',      // yellow-500
    secondary: '#f59e0b',    // amber-500
    glow: 'rgba(234, 179, 8, 0.22)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(234, 179, 8, 0.1) 0%, rgba(17, 16, 12, 0.98) 70%)',
    cardBg: 'rgba(28, 26, 18, 0.65)',
    cardBorder: 'rgba(234, 179, 8, 0.2)',
    textAccent: 'text-amber-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-amber-200/70',
    ringColor: '#eab308',
  },
  emerald: {
    id: 'emerald',
    name: 'Zümrüt Vaha (Emerald Zen)',
    primary: '#10b981',      // emerald-500
    secondary: '#14b8a6',    // teal-500
    glow: 'rgba(16, 185, 129, 0.22)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.11) 0%, rgba(8, 18, 14, 0.98) 70%)',
    cardBg: 'rgba(14, 28, 22, 0.65)',
    cardBorder: 'rgba(16, 185, 129, 0.2)',
    textAccent: 'text-emerald-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-emerald-200/70',
    ringColor: '#10b981',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Saf Minimal (Stark Mono)',
    primary: '#f3f4f6',      // gray-100
    secondary: '#9ca3af',    // gray-400
    glow: 'rgba(255, 255, 255, 0.15)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.05) 0%, rgba(10, 10, 12, 0.98) 70%)',
    cardBg: 'rgba(24, 24, 27, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    textAccent: 'text-neutral-300',
    numberColor: 'text-white',
    labelColor: 'text-neutral-400',
    ringColor: '#e5e7eb',
  },
};
