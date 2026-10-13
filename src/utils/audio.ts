// Web Audio API based studio-grade sound design for CountTo
import { ThemeId } from '../types/countdown';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Subtle modern haptic tick sound (soft crystal / precision click)
 */
export function playTickSound(volume = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio permission or playback errors
  }
}

/**
 * Subtle tactile UI hover click sound (mini tactile click / haptic tap)
 * Plays when hovering over themes with cursor
 */
let lastHoverSoundTime = 0;

export function playHoverClickSound(volume = 0.055) {
  try {
    const now = Date.now();
    // Throttle to at most once every 35ms to keep rapid mouse sweeps crisp and pleasant
    if (now - lastHoverSoundTime < 35) return;
    lastHoverSoundTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Crisp tactile drop: 1950Hz -> 850Hz in 16ms
    osc.frequency.setValueAtTime(1950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.016);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Completion celebration chime (pentatonic chord shimmer)
 */
export function playCelebrationChime(volume = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 1.3);
    });
  } catch {
    // Ignore audio permission errors
  }
}

/**
 * Unified Lush Cosmic Ambient Pad Engine (Theme selection sound effect):
 */
function playCosmicSwell(
  ctx: AudioContext,
  now: number,
  chordNotes: number[],
  filterPeak = 2100,
  filterQ = 2.4,
  volume = 0.28,
  duration = 1.45
) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(filterPeak, now + 0.32);
  filter.frequency.exponentialRampToValueAtTime(550, now + duration - 0.1);
  filter.Q.setValueAtTime(filterQ, now);
  filter.connect(ctx.destination);

  const rootNote = chordNotes[0];
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(rootNote * 0.5, now);

  subGain.gain.setValueAtTime(0.0001, now);
  subGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.18);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

  subOsc.connect(subGain);
  subGain.connect(filter);
  subOsc.start(now);
  subOsc.stop(now + duration);

  chordNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const detuneCents = (i - 2) * 3;
    osc.detune.setValueAtTime(detuneCents, now);

    const noteStart = now + i * 0.022;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(volume * 0.24, noteStart + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(noteStart);
    osc.stop(noteStart + duration + 0.05);
  });
}

/**
 * Cinematic Cosmic Ambient Theme Sounds (On theme selection)
 */
export function playThemeSound(theme: ThemeId, volume = 0.28) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (theme) {
      case 'violet': {
        const violetNotes = [146.83, 220.00, 349.23, 523.25, 783.99, 1318.51];
        playCosmicSwell(ctx, now, violetNotes, 2200, 2.6, volume, 1.5);
        break;
      }
      case 'aurora': {
        const auroraNotes = [185.00, 277.18, 349.23, 415.30, 554.37, 830.61];
        playCosmicSwell(ctx, now, auroraNotes, 2600, 2.2, volume, 1.55);
        break;
      }
      case 'cyber': {
        const cyberNotes = [110.00, 164.81, 261.63, 392.00, 493.88, 659.25];
        playCosmicSwell(ctx, now, cyberNotes, 1950, 2.8, volume, 1.45);
        break;
      }
      case 'gold': {
        const goldNotes = [164.81, 246.94, 415.30, 622.25, 739.99, 987.77];
        playCosmicSwell(ctx, now, goldNotes, 2300, 2.5, volume, 1.5);
        break;
      }
      case 'emerald': {
        const emeraldNotes = [98.00, 146.83, 246.94, 293.66, 440.00, 783.99];
        playCosmicSwell(ctx, now, emeraldNotes, 1850, 2.1, volume, 1.6);
        break;
      }
      case 'monochrome': {
        const monoNotes = [130.81, 196.00, 246.94, 293.66, 329.63, 493.88];
        playCosmicSwell(ctx, now, monoNotes, 2050, 2.3, volume, 1.4);
        break;
      }
      case 'crimson': {
        const crimsonNotes = [110.00, 164.81, 220.00, 329.63, 440.00, 659.25];
        playCosmicSwell(ctx, now, crimsonNotes, 2400, 2.7, volume, 1.55);
        break;
      }
      case 'midnight': {
        const midnightNotes = [146.83, 220.00, 293.66, 440.00, 587.33, 880.00];
        playCosmicSwell(ctx, now, midnightNotes, 2100, 2.4, volume, 1.6);
        break;
      }
      case 'sakura': {
        const sakuraNotes = [174.61, 261.63, 349.23, 523.25, 698.46, 1046.50];
        playCosmicSwell(ctx, now, sakuraNotes, 2500, 2.3, volume, 1.5);
        break;
      }
      case 'hyperlime': {
        const limeNotes = [123.47, 185.00, 246.94, 370.00, 493.88, 739.99];
        playCosmicSwell(ctx, now, limeNotes, 2700, 2.9, volume, 1.45);
        break;
      }
      case 'sunset': {
        const sunsetNotes = [130.81, 196.00, 261.63, 392.00, 523.25, 783.99];
        playCosmicSwell(ctx, now, sunsetNotes, 2300, 2.4, volume, 1.55);
        break;
      }
      case 'nordic': {
        const nordicNotes = [196.00, 293.66, 392.00, 587.33, 783.99, 1174.66];
        playCosmicSwell(ctx, now, nordicNotes, 2800, 2.1, volume, 1.65);
        break;
      }
      case 'synthwave': {
        const synthNotes = [146.83, 220.00, 277.18, 440.00, 554.37, 880.00];
        playCosmicSwell(ctx, now, synthNotes, 2900, 2.7, volume, 1.55);
        break;
      }
      case 'nebula': {
        const nebulaNotes = [164.81, 246.94, 329.63, 493.88, 659.25, 987.77];
        playCosmicSwell(ctx, now, nebulaNotes, 2500, 2.4, volume, 1.6);
        break;
      }
      case 'solarpunk': {
        const solarNotes = [130.81, 196.00, 246.94, 329.63, 493.88, 783.99];
        playCosmicSwell(ctx, now, solarNotes, 2200, 2.3, volume, 1.55);
        break;
      }
      case 'aquamarine': {
        const aquaNotes = [174.61, 261.63, 349.23, 440.00, 698.46, 1046.50];
        playCosmicSwell(ctx, now, aquaNotes, 2650, 2.2, volume, 1.5);
        break;
      }
      case 'volcano': {
        const volcanoNotes = [110.00, 164.81, 220.00, 293.66, 440.00, 587.33];
        playCosmicSwell(ctx, now, volcanoNotes, 2100, 2.8, volume, 1.65);
        break;
      }
      case 'matrix': {
        const matrixNotes = [123.47, 185.00, 246.94, 370.00, 493.88, 739.99];
        playCosmicSwell(ctx, now, matrixNotes, 2750, 2.6, volume, 1.45);
        break;
      }
    }
  } catch {
    // Ignore audio permission errors
  }
}

/**
 * Plays a luxurious, theme-tuned celestial chime for weather notifications.
 */
export function playWeatherNotificationSound(themeId: ThemeId, volume = 0.16): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Theme frequency pairings for crystalline notification chimes
    const themePitchMap: Record<ThemeId, [number, number]> = {
      aurora: [587.33, 880.00],    // D5 -> A5
      cyber: [523.25, 783.99],     // C5 -> G5
      violet: [440.00, 659.25],    // A4 -> E5
      gold: [493.88, 739.99],      // B4 -> F#5
      emerald: [523.25, 659.25],   // C5 -> E5
      monochrome: [440.00, 880.00],// A4 -> A5
      crimson: [415.30, 622.25],   // G#4 -> D#5
      midnight: [370.00, 554.37],  // F#4 -> C#5
      sakura: [659.25, 987.77],    // E5 -> B5
      hyperlime: [587.33, 880.00], // D5 -> A5
      sunset: [440.00, 659.25],    // A4 -> E5
      nordic: [698.46, 1046.50],   // F5 -> C6
      synthwave: [554.37, 830.61], // C#5 -> G#5
      nebula: [493.88, 739.99],    // B4 -> F#5
      solarpunk: [523.25, 783.99], // C5 -> G5
      aquamarine: [659.25, 987.77],// E5 -> B5
      volcano: [392.00, 587.33],   // G4 -> D5
      matrix: [440.00, 659.25],    // A4 -> E5
    };

    const [f1, f2] = themePitchMap[themeId] || [523.25, 783.99];

    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f1, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.7, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.25);

    // Note 2 (slightly delayed celestial harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f2, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(volume, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.65);
  } catch {
    // Ignore audio errors
  }
}

/* ===================================================================================
   PURE LONG-EVOLVING COSMIC AMBIENT PAD ENGINE
   - Sadece o çok sevilen, uzun giden, nefes alan sinematik akor dalgaları
   - Sıfır çan/çınlama veya "dın din don" sesi
   - Yumuşacık 2.4s çapraz geçişlerle (crossfade) 4 zengin akor arasında süzülüş
   - Kısık, huzurlu ve kesintisiz kadife atmosfer
   =================================================================================== */

interface MusicalThemeProfile {
  bpm: number;
  pulseFreq: number; // Hz for low-end comforting pulse
  chords: number[][]; // Cycle of 4 emotional ambient chords
  filterCutoff: number;
}

const THEME_MUSICAL_PROFILES: Record<ThemeId, MusicalThemeProfile> = {
  violet: {
    // Kozmik Menekşe: Dm9 -> Bbmaj7 -> Cadd9 -> Am7 (Uzun ve derin uzay akor dalgası)
    bpm: 56,
    pulseFreq: 58,
    chords: [
      [73.42, 110.0, 174.61, 261.63, 329.63], // Dm9
      [58.27, 116.54, 174.61, 220.0, 293.66], // Bbmaj7
      [65.41, 130.81, 196.0, 293.66, 329.63], // Cadd9
      [55.0, 110.0, 164.81, 220.0, 261.63],   // Am7
    ],
    filterCutoff: 1050,
  },
  aurora: {
    // Aurora: F#maj9 -> D#m7 -> Bmaj7 -> C#sus4 (Göksel kuzey ışığı akışı)
    bpm: 54,
    pulseFreq: 62,
    chords: [
      [92.5, 138.59, 185.0, 277.18, 349.23], // F#maj9
      [77.78, 155.56, 233.08, 277.18, 370.0], // D#m7
      [61.74, 123.47, 185.0, 293.66, 370.0], // Bmaj7
      [69.3, 138.59, 207.65, 277.18, 349.23], // C#sus4
    ],
    filterCutoff: 1250,
  },
  cyber: {
    // Siber Kor: Am9 -> Fmaj7 -> G6 -> Em7 (Blade Runner sıcak analog akorlar)
    bpm: 58,
    pulseFreq: 55,
    chords: [
      [55.0, 110.0, 164.81, 246.94, 261.63], // Am9
      [43.65, 87.31, 130.81, 174.61, 220.0], // Fmaj7
      [49.0, 98.0, 146.83, 196.0, 246.94],   // G6
      [41.2, 82.41, 123.47, 164.81, 196.0],  // Em7
    ],
    filterCutoff: 900,
  },
  gold: {
    // Obsidyen Altın: Emaj9 -> C#m7 -> Amaj7 -> Bsus4 (Lüks altın gün batımı pad'i)
    bpm: 56,
    pulseFreq: 65,
    chords: [
      [82.41, 123.47, 164.81, 246.94, 311.13], // Emaj9
      [69.3, 138.59, 207.65, 246.94, 329.63],  // C#m7
      [55.0, 110.0, 164.81, 220.0, 277.18],    // Amaj7
      [61.74, 123.47, 185.0, 246.94, 329.63],  // Bsus4
    ],
    filterCutoff: 1100,
  },
  emerald: {
    // Zümrüt Zen: Gadd9 -> Em9 -> Cmaj9 -> Dsus2 (Derin huzurlu vadi akorları)
    bpm: 52,
    pulseFreq: 50,
    chords: [
      [49.0, 98.0, 146.83, 220.0, 246.94],    // Gadd9
      [41.2, 82.41, 123.47, 164.81, 246.94],  // Em9
      [65.41, 130.81, 196.0, 246.94, 293.66], // Cmaj9
      [73.42, 146.83, 220.0, 293.66, 329.63], // Dsus2
    ],
    filterCutoff: 850,
  },
  monochrome: {
    // Stark Mono: Cmaj7 -> Am7 -> Fmaj7 -> G6 (Duru, mimari uzay akor dalgası)
    bpm: 56,
    pulseFreq: 60,
    chords: [
      [65.41, 130.81, 196.0, 246.94, 329.63], // Cmaj7
      [55.0, 110.0, 164.81, 220.0, 261.63],   // Am7
      [43.65, 87.31, 130.81, 174.61, 261.63], // Fmaj7
      [49.0, 98.0, 146.83, 196.0, 246.94],   // G6
    ],
    filterCutoff: 980,
  },
  crimson: {
    bpm: 54,
    pulseFreq: 52,
    chords: [
      [73.42, 110.0, 146.83, 220.0, 261.63],
      [58.27, 116.54, 174.61, 233.08, 293.66],
      [49.0, 98.0, 146.83, 174.61, 220.0],
      [55.0, 110.0, 164.81, 220.0, 293.66],
    ],
    filterCutoff: 1100,
  },
  midnight: {
    bpm: 52,
    pulseFreq: 50,
    chords: [
      [41.2, 82.41, 123.47, 164.81, 246.94],
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [61.74, 123.47, 185.0, 246.94, 293.66],
    ],
    filterCutoff: 950,
  },
  sakura: {
    bpm: 58,
    pulseFreq: 64,
    chords: [
      [43.65, 87.31, 130.81, 174.61, 261.63],
      [73.42, 110.0, 174.61, 220.0, 293.66],
      [58.27, 116.54, 174.61, 220.0, 293.66],
      [65.41, 130.81, 196.0, 261.63, 349.23],
    ],
    filterCutoff: 1200,
  },
  hyperlime: {
    bpm: 60,
    pulseFreq: 58,
    chords: [
      [61.74, 123.47, 185.0, 220.0, 293.66],
      [49.0, 98.0, 146.83, 196.0, 293.66],
      [55.0, 110.0, 164.81, 220.0, 277.18],
      [46.25, 92.5, 138.59, 185.0, 277.18],
    ],
    filterCutoff: 1300,
  },
  sunset: {
    bpm: 54,
    pulseFreq: 60,
    chords: [
      [65.41, 130.81, 196.0, 246.94, 293.66],
      [41.2, 82.41, 123.47, 164.81, 246.94],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [49.0, 98.0, 146.83, 196.0, 261.63],
    ],
    filterCutoff: 1150,
  },
  nordic: {
    bpm: 50,
    pulseFreq: 68,
    chords: [
      [49.0, 98.0, 146.83, 196.0, 293.66],
      [41.2, 82.41, 123.47, 164.81, 293.66],
      [65.41, 130.81, 196.0, 246.94, 329.63],
      [73.42, 146.83, 220.0, 293.66, 392.0],
    ],
    filterCutoff: 1350,
  },
  synthwave: {
    bpm: 58,
    pulseFreq: 60,
    chords: [
      [73.42, 110.0, 174.61, 220.0, 293.66],
      [58.27, 116.54, 174.61, 233.08, 349.23],
      [65.41, 130.81, 196.0, 246.94, 329.63],
      [55.0, 110.0, 164.81, 220.0, 329.63],
    ],
    filterCutoff: 1280,
  },
  nebula: {
    bpm: 52,
    pulseFreq: 54,
    chords: [
      [82.41, 123.47, 164.81, 246.94, 329.63],
      [69.3, 138.59, 207.65, 277.18, 329.63],
      [61.74, 123.47, 185.0, 246.94, 370.0],
      [73.42, 146.83, 220.0, 293.66, 370.0],
    ],
    filterCutoff: 1200,
  },
  solarpunk: {
    bpm: 54,
    pulseFreq: 62,
    chords: [
      [65.41, 130.81, 196.0, 246.94, 329.63],
      [49.0, 98.0, 146.83, 196.0, 246.94],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [43.65, 87.31, 130.81, 174.61, 261.63],
    ],
    filterCutoff: 1120,
  },
  aquamarine: {
    bpm: 56,
    pulseFreq: 66,
    chords: [
      [87.31, 130.81, 174.61, 261.63, 349.23],
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [73.42, 146.83, 220.0, 293.66, 349.23],
      [58.27, 116.54, 174.61, 220.0, 293.66],
    ],
    filterCutoff: 1320,
  },
  volcano: {
    bpm: 52,
    pulseFreq: 52,
    chords: [
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [49.0, 98.0, 146.83, 196.0, 246.94],
      [41.2, 82.41, 123.47, 164.81, 246.94],
    ],
    filterCutoff: 1020,
  },
  matrix: {
    bpm: 60,
    pulseFreq: 56,
    chords: [
      [61.74, 123.47, 185.0, 246.94, 293.66],
      [49.0, 98.0, 146.83, 196.0, 293.66],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [46.25, 92.5, 138.59, 185.0, 277.18],
    ],
    filterCutoff: 1250,
  },
};

interface AmbientSession {
  theme: ThemeId;
  masterGain: GainNode;
  filter: BiquadFilterNode;
  activeChordGains: GainNode[];
  activeChordOscs: OscillatorNode[];
  intervalId: NodeJS.Timeout;
}

let activeAmbientSession: AmbientSession | null = null;

/**
 * Start or crossfade into the long, breathing cosmic ambient pad stream.
 * Pure evolving harmonies with zero chime drops.
 */
export function startAmbientMusic(theme: ThemeId, targetVolume = 0.048) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // If already playing this theme, do nothing
    if (activeAmbientSession && activeAmbientSession.theme === theme) {
      return;
    }

    // If another theme was playing, smoothly crossfade it out
    if (activeAmbientSession) {
      const old = activeAmbientSession;
      clearInterval(old.intervalId);
      old.masterGain.gain.setValueAtTime(old.masterGain.gain.value, now);
      old.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.8);
      setTimeout(() => {
        try {
          old.activeChordOscs.forEach((osc) => osc.stop());
          old.masterGain.disconnect();
        } catch {
          // Ignore
        }
      }, 1900);
      activeAmbientSession = null;
    }

    const profile = THEME_MUSICAL_PROFILES[theme] || THEME_MUSICAL_PROFILES.violet;
    const beatSec = 60 / profile.bpm; // ~1.05s per beat

    // Master filter and gain for this session
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(profile.filterCutoff, now);
    filter.Q.setValueAtTime(1.8, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetVolume, now + 2.5);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Track active nodes
    const activeChordOscs: OscillatorNode[] = [];
    const activeChordGains: GainNode[] = [];

    // Musical Sequencer State
    let chordIndex = 0;
    let nextChordTime = now + 0.1;
    let nextBeatTime = now + 0.1;
    const chordDuration = beatSec * 7.5; // Uzun ve nefes alan akorlar (~7.8 saniye)

    // Helper: Play a very subtle, soft resting heartbeat pulse for rhythmic breath
    const playHeartbeatPulse = (time: number) => {
      try {
        const pulseOsc = ctx.createOscillator();
        const pulseGain = ctx.createGain();
        const pulseFilter = ctx.createBiquadFilter();

        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(profile.pulseFreq, time);
        pulseOsc.frequency.exponentialRampToValueAtTime(profile.pulseFreq * 0.75, time + 0.2);

        pulseFilter.type = 'lowpass';
        pulseFilter.frequency.setValueAtTime(110, time);

        // Derinden gelen, çok kısık ve yumuşak nabız vuruşu
        pulseGain.gain.setValueAtTime(0.0001, time);
        pulseGain.gain.linearRampToValueAtTime(0.28, time + 0.05);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

        pulseOsc.connect(pulseGain);
        pulseGain.connect(pulseFilter);
        pulseFilter.connect(filter);

        pulseOsc.start(time);
        pulseOsc.stop(time + 0.28);
      } catch {
        // Ignore
      }
    };

    // Helper: Transition to next chord in the cycle smoothly with long crossfade
    const transitionChord = (time: number, chordNotes: number[]) => {
      try {
        // Fade out previous chord gains over 2.4 seconds
        while (activeChordGains.length > 0) {
          const g = activeChordGains.shift();
          if (g) {
            g.gain.setValueAtTime(g.gain.value, time);
            g.gain.linearRampToValueAtTime(0.0001, time + 2.4);
          }
        }

        // Spawn new chord oscillators
        chordNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          const detune = (idx - 2) * 2.2;
          osc.detune.setValueAtTime(detune, time);

          const targetLevel = idx < 2 ? 0.3 : 0.18;
          gain.gain.setValueAtTime(0.0001, time);
          gain.gain.linearRampToValueAtTime(targetLevel, time + 2.4); // Uzun ve pürüzsüz açılış

          osc.connect(gain);
          gain.connect(filter);

          osc.start(time);
          activeChordOscs.push(osc);
          activeChordGains.push(gain);
        });
      } catch {
        // Ignore
      }
    };

    // Master Web Audio Lookahead Scheduler
    const scheduleNextEvents = () => {
      try {
        const currentTime = ctx.currentTime;
        const lookahead = currentTime + 0.45;

        // 1. Schedule Chords: Rotates through 4 emotional extended chords with long crossfades
        while (nextChordTime < lookahead) {
          const chord = profile.chords[chordIndex % profile.chords.length];
          transitionChord(nextChordTime, chord);
          chordIndex++;
          nextChordTime += chordDuration;
        }

        // 2. Schedule Soft Resting Heartbeat Pulse (Sadece derinden gelen kısık nabız, dın din don YOK)
        while (nextBeatTime < lookahead) {
          playHeartbeatPulse(nextBeatTime);
          nextBeatTime += beatSec;
        }
      } catch {
        // Ignore scheduling errors
      }
    };

    // Run scheduler every 100ms
    scheduleNextEvents();
    const intervalId = setInterval(scheduleNextEvents, 100);

    activeAmbientSession = {
      theme,
      masterGain,
      filter,
      activeChordGains,
      activeChordOscs,
      intervalId,
    };
  } catch {
    // Ignore audio permission errors
  }
}

/**
 * Smoothly stop ambient music with a gentle fade-out.
 */
export function stopAmbientMusic(fadeSeconds = 1.4) {
  try {
    if (!activeAmbientSession) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const session = activeAmbientSession;
    clearInterval(session.intervalId);

    session.masterGain.gain.setValueAtTime(session.masterGain.gain.value, now);
    session.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);

    setTimeout(() => {
      try {
        session.activeChordOscs.forEach((osc) => osc.stop());
        session.masterGain.disconnect();
      } catch {
        // Ignore
      }
    }, (fadeSeconds + 0.1) * 1000);

    activeAmbientSession = null;
  } catch {
    // Ignore
  }
}
