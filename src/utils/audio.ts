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
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

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
 * Plays a warm, noble horological chime for the top of the hour in Turkey Time.
 * Uses a resonant celestial chime sequence followed by an acoustic clock gong.
 */
export function playHourlyChimeSound(hours: number, themeId: ThemeId = 'aurora', volume = 0.22): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 4-note melodic chime motif (Westminster-inspired gentle acoustic chime)
    const chimeMotif = [
      { freq: 659.25, time: 0 },       // E5
      { freq: 523.25, time: 0.22 },    // C5
      { freq: 587.33, time: 0.44 },    // D5
      { freq: 392.00, time: 0.66 },    // G4
    ];

    chimeMotif.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(volume * 0.75, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });

    // Deep resonant acoustic clock gong strike at 1.05s
    const gongTime = now + 1.05;
    const gongFrequencies = [130.81, 261.63, 392.00, 523.25]; // C3, C4, G4, C5 warm gong harmonics

    const gongFilter = ctx.createBiquadFilter();
    gongFilter.type = 'lowpass';
    gongFilter.frequency.setValueAtTime(1400, gongTime);
    gongFilter.frequency.exponentialRampToValueAtTime(320, gongTime + 2.4);

    const gongMasterGain = ctx.createGain();
    gongMasterGain.gain.setValueAtTime(volume * 0.95, gongTime);
    gongMasterGain.gain.exponentialRampToValueAtTime(0.0001, gongTime + 2.5);

    gongFilter.connect(gongMasterGain);
    gongMasterGain.connect(ctx.destination);

    gongFrequencies.forEach((f, idx) => {
      const gongOsc = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gongOsc.type = idx === 0 ? 'sine' : 'triangle';
      gongOsc.frequency.setValueAtTime(f, gongTime);

      const voiceVol = idx === 0 ? 0.35 : 0.2 / idx;
      gongGain.gain.setValueAtTime(0.0001, gongTime);
      gongGain.gain.linearRampToValueAtTime(voiceVol, gongTime + 0.04);
      gongGain.gain.exponentialRampToValueAtTime(0.0001, gongTime + 2.2);

      gongOsc.connect(gongGain);
      gongGain.connect(gongFilter);

      gongOsc.start(gongTime);
      gongOsc.stop(gongTime + 2.5);
    });
  } catch {
    // Ignore audio playback errors
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
      case 'dustypink': {
        const dustyNotes = [174.61, 261.63, 329.63, 392.00, 523.25, 783.99];
        playCosmicSwell(ctx, now, dustyNotes, 2400, 2.3, volume, 1.5);
        break;
      }
      case 'lavender': {
        const lavNotes = [146.83, 220.00, 293.66, 440.00, 659.25, 880.00];
        playCosmicSwell(ctx, now, lavNotes, 2600, 2.4, volume, 1.55);
        break;
      }
      case 'deepocean': {
        const oceanNotes = [130.81, 196.00, 261.63, 392.00, 587.33, 783.99];
        playCosmicSwell(ctx, now, oceanNotes, 2100, 2.5, volume, 1.6);
        break;
      }
      case 'caramel': {
        const caramelNotes = [146.83, 220.00, 293.66, 370.00, 554.37, 739.99];
        playCosmicSwell(ctx, now, caramelNotes, 2300, 2.2, volume, 1.5);
        break;
      }
      case 'sage': {
        const sageNotes = [164.81, 246.94, 329.63, 440.00, 659.25, 987.77];
        playCosmicSwell(ctx, now, sageNotes, 2200, 2.1, volume, 1.45);
        break;
      }
      case 'cobalt': {
        const cobaltNotes = [110.00, 164.81, 220.00, 329.63, 493.88, 659.25];
        playCosmicSwell(ctx, now, cobaltNotes, 2700, 2.7, volume, 1.5);
        break;
      }
      case 'copper': {
        const copperNotes = [130.81, 196.00, 261.63, 329.63, 493.88, 659.25];
        playCosmicSwell(ctx, now, copperNotes, 2350, 2.4, volume, 1.55);
        break;
      }
      case 'moonlight': {
        const moonNotes = [164.81, 261.63, 329.63, 523.25, 659.25, 1046.50];
        playCosmicSwell(ctx, now, moonNotes, 2800, 2.5, volume, 1.5);
        break;
      }
      case 'tokyo': {
        const tokyoNotes = [110.00, 164.81, 220.00, 329.63, 440.00, 880.00];
        playCosmicSwell(ctx, now, tokyoNotes, 2900, 2.8, volume, 1.6);
        break;
      }
      case 'matcha': {
        const matchaNotes = [130.81, 196.00, 246.94, 293.66, 392.00, 587.33];
        playCosmicSwell(ctx, now, matchaNotes, 2100, 2.1, volume, 1.45);
        break;
      }
      case 'cherry': {
        const cherryNotes = [116.54, 174.61, 233.08, 311.13, 466.16, 622.25];
        playCosmicSwell(ctx, now, cherryNotes, 2400, 2.5, volume, 1.55);
        break;
      }
      case 'oasis': {
        const oasisNotes = [146.83, 220.00, 293.66, 370.00, 440.00, 739.99];
        playCosmicSwell(ctx, now, oasisNotes, 2600, 2.4, volume, 1.5);
        break;
      }
      case 'amethyst': {
        const amethystNotes = [146.83, 220.00, 277.18, 370.00, 554.37, 783.99];
        playCosmicSwell(ctx, now, amethystNotes, 2750, 2.6, volume, 1.55);
        break;
      }
      case 'eucalyptus': {
        const eucaNotes = [130.81, 164.81, 220.00, 261.63, 329.63, 523.25];
        playCosmicSwell(ctx, now, eucaNotes, 2250, 2.2, volume, 1.45);
        break;
      }
      case 'sunburst': {
        const sunNotes = [164.81, 246.94, 329.63, 392.00, 493.88, 659.25];
        playCosmicSwell(ctx, now, sunNotes, 2650, 2.5, volume, 1.5);
        break;
      }
    }
  } catch {
    // Ignore audio permission errors
  }
}

/**
 * Plays a studio-grade celestial chord swell for real-time weather alerts,
 * tuned with rich polyphonic harmonics matching the active theme's aura.
 */
export function playWeatherNotificationSound(themeId: ThemeId, volume = 0.24): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 5-voice rich celestial chord charts tuned per theme
    const themeChordMap: Record<ThemeId, { notes: number[]; filterCutoff: number; q: number }> = {
      aurora: {
        notes: [277.18, 415.30, 554.37, 830.61, 1108.73], // C#maj9 ethereal shimmer
        filterCutoff: 2900,
        q: 2.3,
      },
      synthwave: {
        notes: [220.00, 329.63, 440.00, 554.37, 880.00], // Neon A6/9
        filterCutoff: 3100,
        q: 2.6,
      },
      cyber: {
        notes: [261.63, 392.00, 523.25, 659.25, 783.99], // Pristine Cmaj9
        filterCutoff: 2800,
        q: 2.4,
      },
      violet: {
        notes: [220.00, 349.23, 440.00, 523.25, 783.99], // Deep Cosmic Fmaj7#11
        filterCutoff: 2600,
        q: 2.2,
      },
      gold: {
        notes: [246.94, 370.00, 493.88, 622.25, 739.99], // Luminous Bmaj9
        filterCutoff: 2700,
        q: 2.5,
      },
      emerald: {
        notes: [196.00, 293.66, 392.00, 493.88, 659.25], // Forest Gmaj9
        filterCutoff: 2400,
        q: 2.1,
      },
      monochrome: {
        notes: [220.00, 329.63, 440.00, 659.25, 880.00], // Pure Asymmetric Sus2
        filterCutoff: 2500,
        q: 2.2,
      },
      crimson: {
        notes: [207.65, 311.13, 415.30, 622.25, 830.61], // Velvet G#m9
        filterCutoff: 2750,
        q: 2.5,
      },
      midnight: {
        notes: [185.00, 277.18, 370.00, 554.37, 739.99], // Dark F#m11
        filterCutoff: 2300,
        q: 2.1,
      },
      sakura: {
        notes: [261.63, 349.23, 523.25, 698.46, 1046.50], // Blossom Fmaj9
        filterCutoff: 3000,
        q: 2.2,
      },
      hyperlime: {
        notes: [246.94, 370.00, 493.88, 739.99, 987.77], // Vibrant Bsus4
        filterCutoff: 3200,
        q: 2.7,
      },
      sunset: {
        notes: [220.00, 293.66, 440.00, 587.33, 783.99], // Twilight Dsus2/A
        filterCutoff: 2600,
        q: 2.3,
      },
      nordic: {
        notes: [261.63, 392.00, 587.33, 783.99, 1174.66], // Crystal Gsus2
        filterCutoff: 3100,
        q: 2.1,
      },
      nebula: {
        notes: [220.00, 329.63, 493.88, 659.25, 987.77], // Plasma Bm11
        filterCutoff: 2850,
        q: 2.4,
      },
      solarpunk: {
        notes: [261.63, 329.63, 392.00, 523.25, 783.99], // Warm Amber C6
        filterCutoff: 2750,
        q: 2.3,
      },
      aquamarine: {
        notes: [329.63, 493.88, 659.25, 987.77, 1318.51], // Lagoon Emaj9
        filterCutoff: 3200,
        q: 2.2,
      },
      volcano: {
        notes: [220.00, 293.66, 440.00, 587.33, 880.00], // Molten Dm9
        filterCutoff: 2450,
        q: 2.5,
      },
      matrix: {
        notes: [246.94, 370.00, 493.88, 739.99, 987.77], // Emerald Bm9
        filterCutoff: 3000,
        q: 2.6,
      },
      dustypink: {
        notes: [261.63, 329.63, 392.00, 523.25, 659.25], // Cmaj9 soft powdery rose
        filterCutoff: 2700,
        q: 2.2,
      },
      lavender: {
        notes: [220.00, 293.66, 440.00, 587.33, 880.00], // Dsus2 velvet purple
        filterCutoff: 2900,
        q: 2.4,
      },
      deepocean: {
        notes: [196.00, 261.63, 392.00, 523.25, 783.99], // C5 deep marine resonance
        filterCutoff: 2500,
        q: 2.3,
      },
      caramel: {
        notes: [220.00, 277.18, 329.63, 440.00, 659.25], // A6 golden honey
        filterCutoff: 2600,
        q: 2.2,
      },
      sage: {
        notes: [196.00, 246.94, 293.66, 392.00, 587.33], // Gmaj7 matcha peace
        filterCutoff: 2400,
        q: 2.1,
      },
      cobalt: {
        notes: [220.00, 329.63, 440.00, 659.25, 880.00], // E5 crystalline cobalt
        filterCutoff: 3100,
        q: 2.6,
      },
      copper: {
        notes: [220.00, 293.66, 370.00, 554.37, 739.99], // Dmaj7 terra cotta
        filterCutoff: 2550,
        q: 2.3,
      },
      moonlight: {
        notes: [261.63, 392.00, 523.25, 659.25, 1046.50], // C pure silvery starlight
        filterCutoff: 3000,
        q: 2.5,
      },
      tokyo: {
        notes: [220.00, 329.63, 440.00, 659.25, 880.00], // Electric A neon shimmer
        filterCutoff: 3200,
        q: 2.7,
      },
      matcha: {
        notes: [196.00, 293.66, 392.00, 493.88, 587.33], // G garden tea calmness
        filterCutoff: 2400,
        q: 2.0,
      },
      cherry: {
        notes: [207.65, 311.13, 415.30, 523.25, 622.25], // Velvet bordeaux depth
        filterCutoff: 2500,
        q: 2.4,
      },
      oasis: {
        notes: [246.94, 370.00, 493.88, 587.33, 739.99], // Desert spring turquoise
        filterCutoff: 2850,
        q: 2.3,
      },
      amethyst: {
        notes: [220.00, 329.63, 440.00, 523.25, 783.99], // Regal crystal violet
        filterCutoff: 2950,
        q: 2.5,
      },
      eucalyptus: {
        notes: [220.00, 277.18, 329.63, 440.00, 554.37], // Cool misty teal breeze
        filterCutoff: 2450,
        q: 2.1,
      },
      sunburst: {
        notes: [261.63, 329.63, 392.00, 523.25, 659.25], // Warm radiant golden sunrise
        filterCutoff: 2900,
        q: 2.4,
      },
    };

    const config = themeChordMap[themeId] || themeChordMap.aurora;

    // Resonant master lowpass filter with smooth dynamic breath
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.Q.setValueAtTime(config.q, now);
    masterFilter.frequency.setValueAtTime(config.filterCutoff * 0.65, now);
    masterFilter.frequency.linearRampToValueAtTime(config.filterCutoff, now + 0.16);
    masterFilter.frequency.exponentialRampToValueAtTime(800, now + 2.3);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.9, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    masterFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Cascading harmonic voices with micro-detuning
    config.notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      osc.type = idx === config.notes.length - 1 ? 'triangle' : 'sine';

      // Micro-detuning for shimmer
      const detuneCents = (idx % 2 === 0 ? 1 : -1) * (idx * 1.3);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      const staggerStart = now + idx * 0.026;
      const duration = 2.1 - idx * 0.1;

      voiceGain.gain.setValueAtTime(0.0001, staggerStart);
      voiceGain.gain.linearRampToValueAtTime(0.25, staggerStart + 0.05);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, staggerStart + duration);

      osc.connect(voiceGain);
      voiceGain.connect(masterFilter);

      osc.start(staggerStart);
      osc.stop(staggerStart + duration + 0.1);
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Plays a delicate, whispering descending celestial shimmer as the notification smoothly exits.
 * Duration matches the 0.65s exit animation.
 */
export function playWeatherExitSound(themeId: ThemeId, volume = 0.15): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Descending harmonic triad tuned to theme root
    const themeExitPitches: Record<ThemeId, [number, number, number]> = {
      aurora: [830.61, 554.37, 415.30],
      synthwave: [659.25, 554.37, 440.00],
      cyber: [783.99, 659.25, 523.25],
      violet: [659.25, 523.25, 440.00],
      gold: [739.99, 622.25, 493.88],
      emerald: [659.25, 493.88, 392.00],
      monochrome: [659.25, 523.25, 440.00],
      crimson: [622.25, 523.25, 415.30],
      midnight: [554.37, 440.00, 370.00],
      sakura: [783.99, 659.25, 523.25],
      hyperlime: [739.99, 587.33, 493.88],
      sunset: [659.25, 587.33, 440.00],
      nordic: [783.99, 587.33, 392.00],
      nebula: [659.25, 493.88, 440.00],
      solarpunk: [659.25, 523.25, 392.00],
      aquamarine: [783.99, 659.25, 493.88],
      volcano: [587.33, 440.00, 370.00],
      matrix: [659.25, 493.88, 440.00],
      dustypink: [659.25, 523.25, 392.00],
      lavender: [783.99, 587.33, 440.00],
      deepocean: [587.33, 392.00, 261.63],
      caramel: [659.25, 554.37, 440.00],
      sage: [587.33, 493.88, 392.00],
      cobalt: [880.00, 659.25, 440.00],
      copper: [739.99, 554.37, 440.00],
      moonlight: [783.99, 659.25, 523.25],
      tokyo: [880.00, 659.25, 440.00],
      matcha: [587.33, 493.88, 392.00],
      cherry: [622.25, 523.25, 415.30],
      oasis: [739.99, 587.33, 493.88],
      amethyst: [783.99, 659.25, 440.00],
      eucalyptus: [659.25, 554.37, 440.00],
      sunburst: [659.25, 587.33, 523.25],
    };

    const pitches = themeExitPitches[themeId] || [659.25, 523.25, 440.00];

    // Smooth sweeping lowpass filter descending from warm to deep whisper
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(1.8, now);
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.65);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.7, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const start = now + idx * 0.045;
      const dur = 0.55 - idx * 0.04;

      voiceGain.gain.setValueAtTime(0.0001, start);
      voiceGain.gain.linearRampToValueAtTime(0.18, start + 0.04);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(voiceGain);
      voiceGain.connect(filter);

      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
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
  dustypink: {
    bpm: 52,
    pulseFreq: 58,
    chords: [
      [87.31, 130.81, 174.61, 261.63, 329.63],
      [65.41, 130.81, 196.0, 246.94, 329.63],
      [73.42, 110.0, 164.81, 220.0, 261.63],
      [58.27, 116.54, 174.61, 220.0, 293.66],
    ],
    filterCutoff: 1100,
  },
  lavender: {
    bpm: 54,
    pulseFreq: 60,
    chords: [
      [73.42, 110.0, 146.83, 220.0, 293.66],
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [58.27, 116.54, 174.61, 220.0, 293.66],
      [49.0, 98.0, 146.83, 196.0, 293.66],
    ],
    filterCutoff: 1200,
  },
  deepocean: {
    bpm: 50,
    pulseFreq: 52,
    chords: [
      [65.41, 98.0, 130.81, 196.0, 261.63],
      [58.27, 87.31, 116.54, 174.61, 233.08],
      [49.0, 73.42, 98.0, 146.83, 220.0],
      [55.0, 82.41, 110.0, 164.81, 220.0],
    ],
    filterCutoff: 1000,
  },
  caramel: {
    bpm: 54,
    pulseFreq: 62,
    chords: [
      [73.42, 110.0, 146.83, 185.0, 220.0],
      [65.41, 98.0, 130.81, 164.81, 196.0],
      [55.0, 82.41, 110.0, 146.83, 220.0],
      [49.0, 73.42, 98.0, 130.81, 196.0],
    ],
    filterCutoff: 1150,
  },
  sage: {
    bpm: 50,
    pulseFreq: 56,
    chords: [
      [49.0, 73.42, 98.0, 123.47, 146.83],
      [41.2, 61.74, 82.41, 110.0, 146.83],
      [55.0, 82.41, 110.0, 138.59, 164.81],
      [43.65, 65.41, 87.31, 116.54, 146.83],
    ],
    filterCutoff: 1050,
  },
  cobalt: {
    bpm: 58,
    pulseFreq: 64,
    chords: [
      [55.0, 110.0, 164.81, 220.0, 329.63],
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [49.0, 98.0, 146.83, 196.0, 293.66],
      [73.42, 110.0, 146.83, 220.0, 293.66],
    ],
    filterCutoff: 1320,
  },
  copper: {
    bpm: 52,
    pulseFreq: 58,
    chords: [
      [65.41, 130.81, 196.0, 246.94, 293.66],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [49.0, 98.0, 146.83, 196.0, 246.94],
      [43.65, 87.31, 130.81, 174.61, 220.0],
    ],
    filterCutoff: 1120,
  },
  moonlight: {
    bpm: 50,
    pulseFreq: 54,
    chords: [
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [49.0, 98.0, 146.83, 196.0, 246.94],
    ],
    filterCutoff: 1250,
  },
  tokyo: {
    bpm: 62,
    pulseFreq: 60,
    chords: [
      [55.0, 110.0, 164.81, 246.94, 329.63],
      [43.65, 87.31, 130.81, 196.0, 261.63],
      [49.0, 98.0, 146.83, 220.0, 293.66],
      [65.41, 130.81, 196.0, 261.63, 329.63],
    ],
    filterCutoff: 1400,
  },
  matcha: {
    bpm: 48,
    pulseFreq: 48,
    chords: [
      [49.0, 98.0, 146.83, 196.0, 246.94],
      [41.2, 82.41, 123.47, 164.81, 220.0],
      [65.41, 98.0, 130.81, 196.0, 246.94],
      [55.0, 82.41, 110.0, 164.81, 220.0],
    ],
    filterCutoff: 1000,
  },
  cherry: {
    bpm: 52,
    pulseFreq: 54,
    chords: [
      [51.91, 103.83, 155.56, 207.65, 261.63],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [55.0, 110.0, 164.81, 220.0, 261.63],
      [41.2, 82.41, 123.47, 164.81, 196.0],
    ],
    filterCutoff: 1050,
  },
  oasis: {
    bpm: 54,
    pulseFreq: 58,
    chords: [
      [61.74, 123.47, 185.0, 246.94, 329.63],
      [49.0, 98.0, 146.83, 196.0, 246.94],
      [55.0, 110.0, 164.81, 220.0, 293.66],
      [43.65, 87.31, 130.81, 174.61, 220.0],
    ],
    filterCutoff: 1200,
  },
  amethyst: {
    bpm: 54,
    pulseFreq: 56,
    chords: [
      [55.0, 110.0, 164.81, 220.0, 277.18],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [49.0, 98.0, 146.83, 196.0, 246.94],
    ],
    filterCutoff: 1180,
  },
  eucalyptus: {
    bpm: 50,
    pulseFreq: 52,
    chords: [
      [49.0, 73.42, 98.0, 146.83, 220.0],
      [41.2, 61.74, 82.41, 123.47, 164.81],
      [55.0, 82.41, 110.0, 164.81, 220.0],
      [43.65, 65.41, 87.31, 130.81, 174.61],
    ],
    filterCutoff: 1080,
  },
  sunburst: {
    bpm: 58,
    pulseFreq: 64,
    chords: [
      [65.41, 130.81, 196.0, 261.63, 329.63],
      [55.0, 110.0, 164.81, 220.0, 293.66],
      [43.65, 87.31, 130.81, 174.61, 220.0],
      [49.0, 98.0, 146.83, 196.0, 246.94],
    ],
    filterCutoff: 1300,
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

/**
 * Realistic acoustic paper page rustle / note placement sound.
 * Plays when a sticky note is created.
 */
export function playPaperPageSound(volume = 0.28): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 0.22;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate crisp paper rustle noise with micro-flutter
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const flutter = 1 + 0.35 * Math.sin(t * 120);
      data[i] = (Math.random() * 2 - 1) * flutter;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Resonant bandpass filter sweeping slightly downward (simulates sliding paper page)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2200, now);
    bandpass.frequency.exponentialRampToValueAtTime(1100, now + duration);
    bandpass.Q.setValueAtTime(2.2, now);

    // Highpass filter to keep it crisp and clear
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(600, now);

    // Dynamic amplitude envelope: quick gentle swell, fluttering decay
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.45, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Gentle tactile soft low tap (simulates adhesive contact with surface)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.06);

    oscGain.gain.setValueAtTime(volume * 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Realistic paper tear / ripping sound.
 * Simulates high-tension fiber fracture and rapid shearing friction when closing a sticky note.
 */
export function playPaperTearSound(volume = 0.35): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 0.32;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Paper tearing has irregular abrasive micro-bursts as fibers snap
    let ripEnv = 0.2;
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      if (i % 180 === 0) {
        ripEnv = 0.3 + Math.random() * 0.7;
      }
      const shape = progress < 0.15 
        ? progress / 0.15 
        : Math.pow(1 - progress, 1.4);
      data[i] = (Math.random() * 2 - 1) * ripEnv * shape;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Resonant bandpass to highlight gritty paper shred frequencies
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(3200, now);
    bandpass.frequency.linearRampToValueAtTime(1800, now + duration * 0.7);
    bandpass.frequency.exponentialRampToValueAtTime(900, now + duration);
    bandpass.Q.setValueAtTime(2.8, now);

    // Highpass to eliminate low rumble and make it sharp and papery
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(950, now);

    // Peaking filter for signature tearing rip resonance
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.setValueAtTime(2600, now);
    peak.gain.setValueAtTime(6, now);
    peak.Q.setValueAtTime(3.0, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.setValueAtTime(volume * 0.95, now + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(peak);
    peak.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Atmospheric soft rain sound with gentle acoustic droplet tings.
 * Plays when "Yağmur Teması" is selected.
 */
export function playRainThemeSound(volume = 0.24): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 1.6;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Soft rain noise buffer with natural fluctuation
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const wave = Math.sin(t * 15) * 0.2 + 0.8;
      data[i] = (Math.random() * 2 - 1) * wave;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Lowpass filter for warm, relaxing rain patter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.15);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);

    // A few gentle water droplet tings
    const dropPitches = [880, 1174, 1318, 987];
    dropPitches.forEach((freq, idx) => {
      const dropTime = now + 0.08 + idx * 0.16 + Math.random() * 0.05;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, dropTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, dropTime + 0.08);

      dropGain.gain.setValueAtTime(0.0001, dropTime);
      dropGain.gain.linearRampToValueAtTime(volume * 0.35, dropTime + 0.01);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.09);

      osc.connect(dropGain);
      dropGain.connect(ctx.destination);

      osc.start(dropTime);
      osc.stop(dropTime + 0.1);
    });
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Resonant liquid frosted glass bubble pop sound.
 * Plays when the liquid glass widget spawn menu opens on double-click.
 */
export function playLiquidPopSound(volume = 0.22): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Resonant water droplet bubble pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps swiftly upward like a liquid bubble expanding
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.025);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    // Subtle glass resonance harmonic
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(1480, now);
    harm.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    harmGain.gain.setValueAtTime(0.0001, now);
    harmGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.01);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    harm.connect(harmGain);
    harmGain.connect(ctx.destination);

    osc.start(now);
    harm.start(now);
    osc.stop(now + 0.17);
    harm.stop(now + 0.12);
  } catch {
    // Ignore audio permission errors
  }
}



