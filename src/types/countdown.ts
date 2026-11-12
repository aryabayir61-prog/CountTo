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
  | 'copper'
  | 'moonlight'
  | 'tokyo'
  | 'matcha'
  | 'cherry'
  | 'oasis'
  | 'amethyst'
  | 'eucalyptus'
  | 'sunburst';

export type CompletionSoundId = 
  | 'celestial_chime'
  | 'zen_bowl'
  | 'grand_fanfare'
  | 'deep_gong'
  | 'crystal_sparkle'
  | 'harpsichord_shimmer'
  | 'soft_bell';

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
  completionSound?: CompletionSoundId;
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

export type StageReactionType = 'clap' | 'confetti' | 'sparkle' | 'heart' | 'fire';

export interface StageReactionEvent {
  reactionId: string;
  type: StageReactionType;
  senderId: string;
  senderName: string;
  viaClap: boolean;
  timestamp: number;
}

export interface StageParticipant {
  id: string;
  name: string;
  isHost: boolean;
  clapActive: boolean;
  joinedAt: number;
}

export interface StageEventSnapshot {
  id?: string;
  title: string;
  targetDate: string;
  createdAt: string;
  style: CountdownStyle;
  theme: ThemeId;
  completionSound?: CompletionSoundId;
  notes?: string;
  category?: 'genel' | 'ozel' | 'is' | 'tatil' | 'eglence' | 'kutlama';
  showMilliseconds?: boolean;
  isPaused?: boolean;
  pausedRemainingMs?: number;
}

export interface SharedStageRoomState {
  roomCode: string;
  hostId: string;
  hostName: string;
  event: StageEventSnapshot;
  isPaused: boolean;
  pausedRemainingMs?: number;
  participants: StageParticipant[];
  participantCount: number;
  totalClaps: number;
  totalReactions: number;
  createdAt: number;
}
