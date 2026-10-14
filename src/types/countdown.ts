export type CountdownStyle = 'countTo' | 'flip' | 'orbital' | 'kinetic' | 'monolith';

export type ThemeId = 
  | 'aurora' 
  | 'cyber' 
  | 'violet' 
  | 'gold' 
  | 'emerald' 
  | 'monochrome'
  | 'crimson'
  | 'midnight'
  | 'sakura'
  | 'hyperlime'
  | 'sunset'
  | 'nordic'
  | 'synthwave'
  | 'nebula'
  | 'solarpunk'
  | 'aquamarine'
  | 'volcano'
  | 'matrix'
  | 'dustypink'
  | 'lavender'
  | 'deepocean'
  | 'caramel'
  | 'sage'
  | 'cobalt'
  | 'copper';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  textAccent: string;
  numberColor: string;
  labelColor: string;
  ringColor: string;
}

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // ISO 8601 string
  createdAt: string;  // ISO 8601 string
  style: CountdownStyle;
  theme: ThemeId;
  notes?: string;
  category?: 'genel' | 'ozel' | 'is' | 'tatil' | 'eglence' | 'kutlama';
  showMilliseconds?: boolean;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalMs: number;
  isPast: boolean;
  progressPercent: number; // 0 to 100 based on createdAt -> targetDate
}
