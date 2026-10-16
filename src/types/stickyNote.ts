export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // HTML formatted content
  color?: string; // Optional custom color hex (if unset, follows active theme)
  isTearing?: boolean;
  zIndex: number;
  createdAt: number;
}
