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
  crimson: {
    id: 'crimson',
    name: 'Kızıl Tutulma (Crimson Eclipse)',
    primary: '#f43f5e',      // rose-500
    secondary: '#b91c1c',    // red-700
    glow: 'rgba(244, 63, 94, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(244, 63, 94, 0.14) 0%, rgba(20, 8, 12, 0.98) 70%)',
    cardBg: 'rgba(32, 14, 20, 0.65)',
    cardBorder: 'rgba(244, 63, 94, 0.22)',
    textAccent: 'text-rose-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-rose-200/70',
    ringColor: '#f43f5e',
  },
  midnight: {
    id: 'midnight',
    name: 'Gece Yarısı (Midnight Abyss)',
    primary: '#3b82f6',      // blue-500
    secondary: '#1d4ed8',    // blue-700
    glow: 'rgba(59, 130, 246, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.14) 0%, rgba(6, 12, 28, 0.98) 70%)',
    cardBg: 'rgba(12, 20, 42, 0.65)',
    cardBorder: 'rgba(59, 130, 246, 0.22)',
    textAccent: 'text-blue-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-blue-200/70',
    ringColor: '#3b82f6',
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Çiçeği (Neon Sakura)',
    primary: '#f472b6',      // pink-400
    secondary: '#ec4899',    // pink-500
    glow: 'rgba(244, 114, 182, 0.26)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(244, 114, 182, 0.13) 0%, rgba(22, 10, 20, 0.98) 70%)',
    cardBg: 'rgba(30, 16, 28, 0.65)',
    cardBorder: 'rgba(244, 114, 182, 0.2)',
    textAccent: 'text-pink-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-pink-200/70',
    ringColor: '#f472b6',
  },
  hyperlime: {
    id: 'hyperlime',
    name: 'Siber Misket (Hyper Lime)',
    primary: '#a3e635',      // lime-400
    secondary: '#4ade80',    // green-400
    glow: 'rgba(163, 230, 53, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(163, 230, 53, 0.12) 0%, rgba(10, 18, 8, 0.98) 70%)',
    cardBg: 'rgba(16, 26, 12, 0.65)',
    cardBorder: 'rgba(163, 230, 53, 0.22)',
    textAccent: 'text-lime-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-lime-200/70',
    ringColor: '#a3e635',
  },
  sunset: {
    id: 'sunset',
    name: 'Alacakaranlık (Sunset Glow)',
    primary: '#fb923c',      // orange-400
    secondary: '#f43f5e',    // rose-500
    glow: 'rgba(251, 146, 60, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(251, 146, 60, 0.13) 0%, rgba(24, 12, 14, 0.98) 70%)',
    cardBg: 'rgba(32, 18, 18, 0.65)',
    cardBorder: 'rgba(251, 146, 60, 0.22)',
    textAccent: 'text-orange-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-orange-200/70',
    ringColor: '#fb923c',
  },
  nordic: {
    id: 'nordic',
    name: 'Kutup Buzulu (Nordic Glacier)',
    primary: '#7dd3fc',      // sky-300
    secondary: '#e0f2fe',    // sky-100
    glow: 'rgba(125, 211, 252, 0.26)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(125, 211, 252, 0.12) 0%, rgba(8, 16, 24, 0.98) 70%)',
    cardBg: 'rgba(14, 24, 34, 0.65)',
    cardBorder: 'rgba(125, 211, 252, 0.22)',
    textAccent: 'text-sky-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-sky-200/70',
    ringColor: '#7dd3fc',
  },
  synthwave: {
    id: 'synthwave',
    name: "80'ler Retrodalga (Synthwave)",
    primary: '#d946ef',      // fuchsia-500
    secondary: '#06b6d4',    // cyan-500
    glow: 'rgba(217, 70, 239, 0.32)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(217, 70, 239, 0.15) 0%, rgba(18, 8, 30, 0.98) 70%)',
    cardBg: 'rgba(30, 14, 40, 0.65)',
    cardBorder: 'rgba(217, 70, 239, 0.25)',
    textAccent: 'text-fuchsia-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-fuchsia-200/70',
    ringColor: '#d946ef',
  },
  nebula: {
    id: 'nebula',
    name: 'Derin Nebula (Cosmic Plasma)',
    primary: '#818cf8',      // indigo-400
    secondary: '#c084fc',    // purple-400
    glow: 'rgba(129, 140, 248, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(129, 140, 248, 0.14) 0%, rgba(10, 10, 28, 0.98) 70%)',
    cardBg: 'rgba(20, 18, 42, 0.65)',
    cardBorder: 'rgba(129, 140, 248, 0.22)',
    textAccent: 'text-indigo-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-indigo-200/70',
    ringColor: '#818cf8',
  },
  solarpunk: {
    id: 'solarpunk',
    name: 'Güneş Işıltısı (Solarpunk Amber)',
    primary: '#f59e0b',      // amber-500
    secondary: '#fbbf24',    // amber-400
    glow: 'rgba(245, 158, 11, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(245, 158, 11, 0.14) 0%, rgba(25, 18, 6, 0.98) 70%)',
    cardBg: 'rgba(32, 24, 10, 0.65)',
    cardBorder: 'rgba(245, 158, 11, 0.24)',
    textAccent: 'text-amber-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-amber-200/70',
    ringColor: '#f59e0b',
  },
  aquamarine: {
    id: 'aquamarine',
    name: 'Maldiv Turkuazı (Lagoon Coral)',
    primary: '#2dd4bf',      // teal-400
    secondary: '#0ea5e9',    // sky-500
    glow: 'rgba(45, 212, 191, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(45, 212, 191, 0.13) 0%, rgba(6, 22, 26, 0.98) 70%)',
    cardBg: 'rgba(10, 28, 32, 0.65)',
    cardBorder: 'rgba(45, 212, 191, 0.22)',
    textAccent: 'text-teal-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-teal-200/70',
    ringColor: '#2dd4bf',
  },
  volcano: {
    id: 'volcano',
    name: 'Ateş Lavı (Volcanic Magma)',
    primary: '#ea580c',      // orange-600
    secondary: '#ef4444',    // red-500
    glow: 'rgba(234, 88, 12, 0.32)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(234, 88, 12, 0.15) 0%, rgba(24, 8, 6, 0.98) 70%)',
    cardBg: 'rgba(32, 12, 10, 0.65)',
    cardBorder: 'rgba(234, 88, 12, 0.24)',
    textAccent: 'text-orange-500',
    numberColor: 'text-neutral-100',
    labelColor: 'text-orange-300/70',
    ringColor: '#ea580c',
  },
  matrix: {
    id: 'matrix',
    name: 'Siber Terminal (Matrix Code)',
    primary: '#22c55e',      // green-500
    secondary: '#16a34a',    // green-600
    glow: 'rgba(34, 197, 94, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(34, 197, 94, 0.12) 0%, rgba(4, 14, 8, 0.98) 70%)',
    cardBg: 'rgba(8, 22, 12, 0.65)',
    cardBorder: 'rgba(34, 197, 94, 0.22)',
    textAccent: 'text-green-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-green-200/70',
    ringColor: '#22c55e',
  },
  dustypink: {
    id: 'dustypink',
    name: 'Toz Pembe (Dusty Rose)',
    primary: '#f498a8',      // soft dusty pastel pink
    secondary: '#e27a94',    // deeper muted rose
    glow: 'rgba(244, 152, 168, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(244, 152, 168, 0.13) 0%, rgba(24, 12, 18, 0.98) 70%)',
    cardBg: 'rgba(32, 18, 24, 0.65)',
    cardBorder: 'rgba(244, 152, 168, 0.22)',
    textAccent: 'text-pink-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-pink-200/70',
    ringColor: '#f498a8',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanta Esintisi (Lavender Mist)',
    primary: '#c4b5fd',      // violet-300
    secondary: '#8b5cf6',    // violet-500
    glow: 'rgba(196, 181, 253, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(196, 181, 253, 0.12) 0%, rgba(16, 12, 28, 0.98) 70%)',
    cardBg: 'rgba(26, 20, 40, 0.65)',
    cardBorder: 'rgba(196, 181, 253, 0.22)',
    textAccent: 'text-violet-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-violet-200/70',
    ringColor: '#c4b5fd',
  },
  deepocean: {
    id: 'deepocean',
    name: 'Okyanus Derinliği (Deep Ocean)',
    primary: '#38bdf8',      // sky-400
    secondary: '#0284c7',    // sky-600
    glow: 'rgba(56, 189, 248, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.13) 0%, rgba(4, 16, 32, 0.98) 70%)',
    cardBg: 'rgba(8, 22, 42, 0.65)',
    cardBorder: 'rgba(56, 189, 248, 0.22)',
    textAccent: 'text-sky-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-sky-200/70',
    ringColor: '#38bdf8',
  },
  caramel: {
    id: 'caramel',
    name: 'Sıcak Karamel (Caramel Warmth)',
    primary: '#fbbf24',      // amber-400
    secondary: '#d97706',    // amber-600
    glow: 'rgba(251, 191, 36, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(251, 191, 36, 0.13) 0%, rgba(26, 16, 6, 0.98) 70%)',
    cardBg: 'rgba(34, 22, 10, 0.65)',
    cardBorder: 'rgba(251, 191, 36, 0.22)',
    textAccent: 'text-amber-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-amber-200/70',
    ringColor: '#fbbf24',
  },
  sage: {
    id: 'sage',
    name: 'Adaçayı Dinginliği (Sage Zen)',
    primary: '#86efac',      // green-300
    secondary: '#22c55e',    // green-500
    glow: 'rgba(134, 239, 172, 0.25)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(134, 239, 172, 0.11) 0%, rgba(10, 20, 14, 0.98) 70%)',
    cardBg: 'rgba(16, 28, 20, 0.65)',
    cardBorder: 'rgba(134, 239, 172, 0.2)',
    textAccent: 'text-green-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-green-200/70',
    ringColor: '#86efac',
  },
  cobalt: {
    id: 'cobalt',
    name: 'Buzul Kobalt (Ice Cobalt)',
    primary: '#60a5fa',      // blue-400
    secondary: '#2563eb',    // blue-600
    glow: 'rgba(96, 165, 250, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(96, 165, 250, 0.14) 0%, rgba(8, 14, 34, 0.98) 70%)',
    cardBg: 'rgba(14, 22, 46, 0.65)',
    cardBorder: 'rgba(96, 165, 250, 0.24)',
    textAccent: 'text-blue-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-blue-200/70',
    ringColor: '#60a5fa',
  },
  copper: {
    id: 'copper',
    name: 'Bakır Ufuk (Copper Horizon)',
    primary: '#f97316',      // orange-500
    secondary: '#c2410c',    // orange-700
    glow: 'rgba(249, 115, 22, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(249, 115, 22, 0.12) 0%, rgba(28, 12, 8, 0.98) 70%)',
    cardBg: 'rgba(36, 16, 12, 0.65)',
    cardBorder: 'rgba(249, 115, 22, 0.22)',
    textAccent: 'text-orange-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-orange-200/70',
    ringColor: '#f97316',
  },
  moonlight: {
    id: 'moonlight',
    name: 'Ay Işığı (Platinum Moonlight)',
    primary: '#e2e8f0',      // slate-200
    secondary: '#94a3b8',    // slate-400
    glow: 'rgba(226, 232, 240, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(226, 232, 240, 0.12) 0%, rgba(12, 14, 20, 0.98) 70%)',
    cardBg: 'rgba(22, 26, 36, 0.65)',
    cardBorder: 'rgba(226, 232, 240, 0.22)',
    textAccent: 'text-slate-200',
    numberColor: 'text-neutral-100',
    labelColor: 'text-slate-300/70',
    ringColor: '#e2e8f0',
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo Gece (Tokyo Drift Neon)',
    primary: '#f43f5e',      // rose-500
    secondary: '#06b6d4',    // cyan-500
    glow: 'rgba(244, 63, 94, 0.35)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(244, 63, 94, 0.16) 0%, rgba(14, 8, 24, 0.98) 70%)',
    cardBg: 'rgba(26, 12, 34, 0.65)',
    cardBorder: 'rgba(244, 63, 94, 0.26)',
    textAccent: 'text-rose-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-rose-200/70',
    ringColor: '#f43f5e',
  },
  matcha: {
    id: 'matcha',
    name: 'Kyoto Yeşili (Kyoto Matcha)',
    primary: '#4ade80',      // green-400
    secondary: '#15803d',    // green-700
    glow: 'rgba(74, 222, 128, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(74, 222, 128, 0.13) 0%, rgba(8, 20, 12, 0.98) 70%)',
    cardBg: 'rgba(12, 28, 16, 0.65)',
    cardBorder: 'rgba(74, 222, 128, 0.22)',
    textAccent: 'text-emerald-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-emerald-200/70',
    ringColor: '#4ade80',
  },
  cherry: {
    id: 'cherry',
    name: 'Bordo Kadife (Velvet Cherry)',
    primary: '#e11d48',      // rose-600
    secondary: '#881337',    // rose-900
    glow: 'rgba(225, 29, 72, 0.32)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(225, 29, 72, 0.15) 0%, rgba(22, 6, 14, 0.98) 70%)',
    cardBg: 'rgba(32, 10, 18, 0.65)',
    cardBorder: 'rgba(225, 29, 72, 0.25)',
    textAccent: 'text-rose-400',
    numberColor: 'text-neutral-100',
    labelColor: 'text-rose-200/70',
    ringColor: '#e11d48',
  },
  oasis: {
    id: 'oasis',
    name: 'Çöl Vahası (Mirage Oasis)',
    primary: '#38bdf8',      // sky-400
    secondary: '#f59e0b',    // amber-500
    glow: 'rgba(56, 189, 248, 0.30)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.14) 0%, rgba(12, 18, 26, 0.98) 70%)',
    cardBg: 'rgba(14, 24, 36, 0.65)',
    cardBorder: 'rgba(56, 189, 248, 0.24)',
    textAccent: 'text-sky-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-sky-200/70',
    ringColor: '#38bdf8',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Kraliyet Ametist (Royal Amethyst)',
    primary: '#c084fc',      // purple-400
    secondary: '#7c3aed',    // violet-600
    glow: 'rgba(192, 132, 252, 0.32)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(192, 132, 252, 0.15) 0%, rgba(18, 8, 32, 0.98) 70%)',
    cardBg: 'rgba(26, 14, 44, 0.65)',
    cardBorder: 'rgba(192, 132, 252, 0.25)',
    textAccent: 'text-purple-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-purple-200/70',
    ringColor: '#c084fc',
  },
  eucalyptus: {
    id: 'eucalyptus',
    name: 'Okaliptüs Sisi (Eucalyptus Mist)',
    primary: '#5eead4',      // teal-300
    secondary: '#0f766e',    // teal-700
    glow: 'rgba(94, 234, 212, 0.28)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(94, 234, 212, 0.12) 0%, rgba(8, 22, 24, 0.98) 70%)',
    cardBg: 'rgba(12, 28, 30, 0.65)',
    cardBorder: 'rgba(94, 234, 212, 0.22)',
    textAccent: 'text-teal-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-teal-200/70',
    ringColor: '#5eead4',
  },
  sunburst: {
    id: 'sunburst',
    name: 'Tropik Şafak (Tropic Sunburst)',
    primary: '#fb923c',      // orange-400
    secondary: '#facc15',    // yellow-400
    glow: 'rgba(251, 146, 60, 0.32)',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(251, 146, 60, 0.15) 0%, rgba(26, 14, 8, 0.98) 70%)',
    cardBg: 'rgba(36, 18, 12, 0.65)',
    cardBorder: 'rgba(251, 146, 60, 0.25)',
    textAccent: 'text-amber-300',
    numberColor: 'text-neutral-100',
    labelColor: 'text-amber-200/70',
    ringColor: '#fb923c',
  },
};
