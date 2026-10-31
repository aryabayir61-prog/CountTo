export interface NoteSticker {
  id: string;
  stickerId: string;
  x: number; // px relative to note body container
  y: number; // px relative to note body container
  rotation?: number; // tilt in degrees (-15 to 15)
  scale?: number; // scale multiplier (default 1)
}

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
  stickers?: NoteSticker[];
}
