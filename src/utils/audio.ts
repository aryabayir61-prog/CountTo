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
 * Unified Lush Cosmic Ambient Pad Engine (Theme selection preview):
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
    }
  } catch {
    // Ignore audio permission errors
  }
}

/* ===================================================================================
   COUNTTO EXCLUSIVE SIGNATURE RELAXING AMBIENT SOUNDSCAPE
   - Sıfır gürültü patlaması, sıfır çınlama (Zero noise, zero ringing, zero jumpscares)
   - İpeksi 3.5 saniyelik kadife açılış (Ultra-smooth 3.5s fade-in)
   - Güvenlik Kompresörü & 1000Hz Alçak Geçiren Filtre (Kulağı asla yormayan yumuşak frekanslar)
   - Uzun ve kesintisiz 4 akorlu meditatif süzülüş (Brian Eno & Max Richter tarzı derin huzur)
   =================================================================================== */

// =======================================================================
// Turkish Airlines Boarding Music (2026) - Acoustic Guitar Ambient Engine
// Tempo: 88 BPM, 4/4 Time Signature, Key: E Major / C# minor (4 Sharps)
// Faithful note-by-note transcription with warm acoustic continuation & loop
// =======================================================================

const GUITAR_FREQS = {
  // Bass register
  E2: 82.41,
  Fs2: 92.50,
  Gs2: 103.83,
  A2: 110.00,
  B2: 123.47,
  Cs3: 138.59,
  D3: 146.83,
  Ds3: 155.56,
  E3: 164.81,
  Fs3: 185.00,
  Gs3: 207.65,
  A3: 220.00,
  B3: 246.94,
  // Mid register
  Cs4: 277.18,
  D4: 293.66,
  Ds4: 311.13,
  E4: 329.63,
  Fs4: 369.99,
  Gs4: 415.30,
  A4: 440.00,
  B4: 493.88,
  // High melodic register
  Cs5: 554.37,
  D5: 587.33,
  Ds5: 622.25,
  E5: 659.25,
  Fs5: 739.99,
  Gs5: 830.61,
  A5: 880.00,
  B5: 987.77,
  // Upper acoustic harmonics
  Cs6: 1108.73,
  D6: 1174.66,
  E6: 1318.51,
};

interface GuitarScoreStep {
  step: number; // 0 to 127 (16 measures of 8 eighth-notes)
  notes: {
    freq: number;
    velocity?: number;
    duration?: number;
    pan?: number;
    isHarmonic?: boolean;
  }[];
}

// Complete 16-measure score: Measures 1-12 strictly match the sheet music,
// and Measures 13-16 bring the continuation & soothing resolution.
const TK_BOARDING_GUITAR_SCORE: GuitarScoreStep[] = [
  // Measure 1: Opening peaceful breath / resonance
  { step: 0, notes: [{ freq: GUITAR_FREQS.A2, velocity: 0.18, duration: 2.8, pan: -0.2 }] },

  // Measure 2: 5 9 4 5 12 9 4 12 (with bass A)
  { step: 8, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.22, duration: 2.4, pan: -0.2 },
    { freq: GUITAR_FREQS.A4, velocity: 0.26, duration: 1.8, pan: 0.05 }
  ]},
  { step: 9, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.24, duration: 1.7, pan: 0.1 }] },
  { step: 10, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.23, duration: 1.6, pan: 0.0 }] },
  { step: 11, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.25, duration: 1.7, pan: 0.05 }] },
  { step: 12, notes: [
    { freq: GUITAR_FREQS.Cs3, velocity: 0.20, duration: 2.2, pan: -0.15 },
    { freq: GUITAR_FREQS.E5, velocity: 0.28, duration: 1.9, pan: 0.15 }
  ]},
  { step: 13, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 14, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.6, pan: 0.0 }] },
  { step: 15, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.26, duration: 1.8, pan: 0.15 }] },

  // Measure 3: 12 9 4 5 12 9 4 12 (with bass E / G#)
  { step: 16, notes: [
    { freq: GUITAR_FREQS.E3, velocity: 0.22, duration: 2.4, pan: -0.2 },
    { freq: GUITAR_FREQS.Gs3, velocity: 0.18, duration: 2.0, pan: -0.1 },
    { freq: GUITAR_FREQS.E5, velocity: 0.27, duration: 1.8, pan: 0.15 }
  ]},
  { step: 17, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 18, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.6, pan: 0.0 }] },
  { step: 19, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.24, duration: 1.7, pan: 0.05 }] },
  { step: 20, notes: [
    { freq: GUITAR_FREQS.B2, velocity: 0.20, duration: 2.2, pan: -0.18 },
    { freq: GUITAR_FREQS.E5, velocity: 0.26, duration: 1.8, pan: 0.15 }
  ]},
  { step: 21, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.6, pan: 0.1 }] },
  { step: 22, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.6, pan: 0.0 }] },
  { step: 23, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.25, duration: 1.8, pan: 0.15 }] },

  // Measure 4: 5 9 4 5 10 9 21 12 (with bass F# / D)
  { step: 24, notes: [
    { freq: GUITAR_FREQS.Fs2, velocity: 0.22, duration: 2.4, pan: -0.22 },
    { freq: GUITAR_FREQS.A4, velocity: 0.25, duration: 1.8, pan: 0.05 }
  ]},
  { step: 25, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 26, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.6, pan: 0.0 }] },
  { step: 27, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.24, duration: 1.7, pan: 0.05 }] },
  { step: 28, notes: [
    { freq: GUITAR_FREQS.D3, velocity: 0.20, duration: 2.2, pan: -0.15 },
    { freq: GUITAR_FREQS.D5, velocity: 0.26, duration: 1.8, pan: 0.12 }
  ]},
  { step: 29, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 30, notes: [{ freq: GUITAR_FREQS.Cs6, velocity: 0.26, duration: 2.2, pan: 0.22, isHarmonic: true }] },
  { step: 31, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.24, duration: 1.7, pan: 0.15 }] },

  // Measure 5: 24 7 2 5 10 7 2 10 (High E6 with F#m chord)
  { step: 32, notes: [
    { freq: GUITAR_FREQS.Fs2, velocity: 0.23, duration: 2.6, pan: -0.25 },
    { freq: GUITAR_FREQS.Fs4, velocity: 0.18, duration: 2.0, pan: -0.05 },
    { freq: GUITAR_FREQS.A4, velocity: 0.18, duration: 2.0, pan: 0.05 },
    { freq: GUITAR_FREQS.Gs5, velocity: 0.20, duration: 2.0, pan: 0.15 },
    { freq: GUITAR_FREQS.E6, velocity: 0.28, duration: 2.5, pan: 0.25, isHarmonic: true }
  ]},
  { step: 33, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 34, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.21, duration: 1.6, pan: -0.05 }] },
  { step: 35, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.23, duration: 1.7, pan: 0.05 }] },
  { step: 36, notes: [
    { freq: GUITAR_FREQS.D3, velocity: 0.21, duration: 2.2, pan: -0.15 },
    { freq: GUITAR_FREQS.D5, velocity: 0.25, duration: 1.8, pan: 0.12 }
  ]},
  { step: 37, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 38, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.20, duration: 1.6, pan: -0.05 }] },
  { step: 39, notes: [{ freq: GUITAR_FREQS.D5, velocity: 0.24, duration: 1.8, pan: 0.12 }] },

  // Measure 6: 22 7 21 5 19 17 16 14 (Melodic run: D6, B4, C#6, A4, B5, A5, G#5, F#5)
  { step: 40, notes: [
    { freq: GUITAR_FREQS.B2, velocity: 0.22, duration: 2.5, pan: -0.2 },
    { freq: GUITAR_FREQS.Fs4, velocity: 0.18, duration: 2.0, pan: -0.05 },
    { freq: GUITAR_FREQS.A4, velocity: 0.18, duration: 2.0, pan: 0.05 },
    { freq: GUITAR_FREQS.D6, velocity: 0.27, duration: 2.2, pan: 0.24 }
  ]},
  { step: 41, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 42, notes: [{ freq: GUITAR_FREQS.Cs6, velocity: 0.26, duration: 1.8, pan: 0.22 }] },
  { step: 43, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 44, notes: [
    { freq: GUITAR_FREQS.E3, velocity: 0.20, duration: 2.2, pan: -0.18 },
    { freq: GUITAR_FREQS.B5, velocity: 0.25, duration: 1.7, pan: 0.20 }
  ]},
  { step: 45, notes: [{ freq: GUITAR_FREQS.A5, velocity: 0.24, duration: 1.7, pan: 0.18 }] },
  { step: 46, notes: [{ freq: GUITAR_FREQS.Gs5, velocity: 0.23, duration: 1.7, pan: 0.15 }] },
  { step: 47, notes: [{ freq: GUITAR_FREQS.Fs5, velocity: 0.22, duration: 1.8, pan: 0.12 }] },

  // Measure 7: 12 9 12 5 12 9 4 12
  { step: 48, notes: [
    { freq: GUITAR_FREQS.Cs3, velocity: 0.22, duration: 2.4, pan: -0.15 },
    { freq: GUITAR_FREQS.E5, velocity: 0.26, duration: 1.8, pan: 0.15 }
  ]},
  { step: 49, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 50, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.25, duration: 1.8, pan: 0.15 }] },
  { step: 51, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 52, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.21, duration: 2.3, pan: -0.2 },
    { freq: GUITAR_FREQS.E5, velocity: 0.25, duration: 1.8, pan: 0.15 }
  ]},
  { step: 53, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.6, pan: 0.1 }] },
  { step: 54, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.6, pan: 0.0 }] },
  { step: 55, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.24, duration: 1.8, pan: 0.15 }] },

  // Measure 8: 5 9 4 5 10 9 9 12
  { step: 56, notes: [
    { freq: GUITAR_FREQS.Fs2, velocity: 0.22, duration: 2.4, pan: -0.22 },
    { freq: GUITAR_FREQS.A4, velocity: 0.24, duration: 1.7, pan: 0.05 }
  ]},
  { step: 57, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 58, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.21, duration: 1.6, pan: 0.0 }] },
  { step: 59, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.23, duration: 1.7, pan: 0.05 }] },
  { step: 60, notes: [
    { freq: GUITAR_FREQS.D3, velocity: 0.21, duration: 2.2, pan: -0.15 },
    { freq: GUITAR_FREQS.D5, velocity: 0.25, duration: 1.8, pan: 0.12 }
  ]},
  { step: 61, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.6, pan: 0.1 }] },
  { step: 62, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.6, pan: 0.1 }] },
  { step: 63, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.25, duration: 1.8, pan: 0.15 }] },

  // Measure 9: 12 7 2 5 10 7 2 10
  { step: 64, notes: [
    { freq: GUITAR_FREQS.E2, velocity: 0.23, duration: 2.6, pan: -0.25 },
    { freq: GUITAR_FREQS.Gs3, velocity: 0.18, duration: 2.0, pan: -0.1 },
    { freq: GUITAR_FREQS.E5, velocity: 0.26, duration: 1.8, pan: 0.15 }
  ]},
  { step: 65, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 66, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.20, duration: 1.6, pan: -0.05 }] },
  { step: 67, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.22, duration: 1.7, pan: 0.05 }] },
  { step: 68, notes: [
    { freq: GUITAR_FREQS.B2, velocity: 0.20, duration: 2.2, pan: -0.18 },
    { freq: GUITAR_FREQS.D5, velocity: 0.24, duration: 1.8, pan: 0.12 }
  ]},
  { step: 69, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.21, duration: 1.6, pan: 0.05 }] },
  { step: 70, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.20, duration: 1.6, pan: -0.05 }] },
  { step: 71, notes: [{ freq: GUITAR_FREQS.D5, velocity: 0.24, duration: 1.8, pan: 0.12 }] },

  // Measure 10: 10 9 7 5 4 7 2 4 (Sweet resolution descent)
  { step: 72, notes: [
    { freq: GUITAR_FREQS.Cs3, velocity: 0.22, duration: 2.4, pan: -0.15 },
    { freq: GUITAR_FREQS.D5, velocity: 0.25, duration: 1.8, pan: 0.12 }
  ]},
  { step: 73, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 74, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 75, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 76, notes: [
    { freq: GUITAR_FREQS.E2, velocity: 0.20, duration: 2.2, pan: -0.22 },
    { freq: GUITAR_FREQS.Gs4, velocity: 0.23, duration: 1.8, pan: 0.0 }
  ]},
  { step: 77, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.21, duration: 1.6, pan: 0.05 }] },
  { step: 78, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.20, duration: 1.6, pan: -0.05 }] },
  { step: 79, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.23, duration: 1.8, pan: 0.0 }] },

  // Measure 11: 5 9 19 5 21 9 4 24 (Ascending to high E6 harmonic bell)
  { step: 80, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.23, duration: 2.4, pan: -0.2 },
    { freq: GUITAR_FREQS.A4, velocity: 0.24, duration: 1.7, pan: 0.05 }
  ]},
  { step: 81, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.6, pan: 0.1 }] },
  { step: 82, notes: [{ freq: GUITAR_FREQS.B5, velocity: 0.26, duration: 1.9, pan: 0.20 }] },
  { step: 83, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.22, duration: 1.6, pan: 0.05 }] },
  { step: 84, notes: [{ freq: GUITAR_FREQS.Cs6, velocity: 0.27, duration: 2.0, pan: 0.22 }] },
  { step: 85, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.6, pan: 0.1 }] },
  { step: 86, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.21, duration: 1.6, pan: 0.0 }] },
  { step: 87, notes: [{ freq: GUITAR_FREQS.E6, velocity: 0.28, duration: 3.2, pan: 0.25, isHarmonic: true }] },

  // Measure 12: Score Conclusion - Amaj9 Acoustic Chord Resonance
  { step: 88, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.25, duration: 3.5, pan: -0.25 },
    { freq: GUITAR_FREQS.E3, velocity: 0.20, duration: 3.2, pan: -0.15 },
    { freq: GUITAR_FREQS.Cs4, velocity: 0.20, duration: 3.0, pan: 0.0 },
    { freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 3.2, pan: 0.1 },
    { freq: GUITAR_FREQS.E6, velocity: 0.25, duration: 3.5, pan: 0.25, isHarmonic: true }
  ]},

  // =========================================================================
  // Measures 13-16: Harmonious Ambient Continuation (Uyumlu Devamı & Döngü)
  // Gentle acoustic arpeggios that glide seamlessly back into Measure 1
  // =========================================================================

  // Measure 13: Emaj9 Arpeggio
  { step: 96, notes: [
    { freq: GUITAR_FREQS.E2, velocity: 0.22, duration: 2.5, pan: -0.25 },
    { freq: GUITAR_FREQS.Gs3, velocity: 0.18, duration: 2.0, pan: -0.1 }
  ]},
  { step: 97, notes: [{ freq: GUITAR_FREQS.B2, velocity: 0.19, duration: 1.8, pan: -0.18 }] },
  { step: 98, notes: [{ freq: GUITAR_FREQS.Ds4, velocity: 0.20, duration: 1.8, pan: -0.05 }] },
  { step: 99, notes: [{ freq: GUITAR_FREQS.Fs4, velocity: 0.21, duration: 1.8, pan: 0.05 }] },
  { step: 100, notes: [
    { freq: GUITAR_FREQS.E3, velocity: 0.20, duration: 2.2, pan: -0.15 },
    { freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 1.8, pan: 0.1 }
  ]},
  { step: 101, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.8, pan: 0.12 }] },
  { step: 102, notes: [{ freq: GUITAR_FREQS.Ds5, velocity: 0.23, duration: 1.8, pan: 0.15 }] },
  { step: 103, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.24, duration: 2.0, pan: 0.18 }] },

  // Measure 14: C#m9 Serene Flow
  { step: 104, notes: [
    { freq: GUITAR_FREQS.Cs3, velocity: 0.22, duration: 2.5, pan: -0.18 },
    { freq: GUITAR_FREQS.E4, velocity: 0.19, duration: 2.0, pan: -0.05 }
  ]},
  { step: 105, notes: [{ freq: GUITAR_FREQS.Gs3, velocity: 0.19, duration: 1.8, pan: -0.12 }] },
  { step: 106, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.21, duration: 1.8, pan: 0.08 }] },
  { step: 107, notes: [{ freq: GUITAR_FREQS.Ds5, velocity: 0.22, duration: 1.8, pan: 0.14 }] },
  { step: 108, notes: [
    { freq: GUITAR_FREQS.Gs3, velocity: 0.20, duration: 2.2, pan: -0.12 },
    { freq: GUITAR_FREQS.E5, velocity: 0.23, duration: 1.8, pan: 0.16 }
  ]},
  { step: 109, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.21, duration: 1.7, pan: 0.08 }] },
  { step: 110, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.20, duration: 1.7, pan: 0.02 }] },
  { step: 111, notes: [{ freq: GUITAR_FREQS.E4, velocity: 0.20, duration: 1.8, pan: -0.05 }] },

  // Measure 15: Aadd9 Warm Acoustic Breath
  { step: 112, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.22, duration: 2.5, pan: -0.22 },
    { freq: GUITAR_FREQS.Cs4, velocity: 0.19, duration: 2.0, pan: -0.05 }
  ]},
  { step: 113, notes: [{ freq: GUITAR_FREQS.E3, velocity: 0.19, duration: 1.8, pan: -0.15 }] },
  { step: 114, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.21, duration: 1.8, pan: 0.05 }] },
  { step: 115, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.8, pan: 0.1 }] },
  { step: 116, notes: [
    { freq: GUITAR_FREQS.A2, velocity: 0.20, duration: 2.2, pan: -0.2 },
    { freq: GUITAR_FREQS.Cs5, velocity: 0.23, duration: 1.8, pan: 0.12 }
  ]},
  { step: 117, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.24, duration: 1.8, pan: 0.15 }] },
  { step: 118, notes: [{ freq: GUITAR_FREQS.Cs5, velocity: 0.22, duration: 1.7, pan: 0.12 }] },
  { step: 119, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.21, duration: 1.8, pan: 0.05 }] },

  // Measure 16: Bsus4 -> B7 Acoustic Harmonics Resolution
  { step: 120, notes: [
    { freq: GUITAR_FREQS.B2, velocity: 0.22, duration: 2.8, pan: -0.2 },
    { freq: GUITAR_FREQS.Fs3, velocity: 0.19, duration: 2.2, pan: -0.1 }
  ]},
  { step: 121, notes: [{ freq: GUITAR_FREQS.Ds4, velocity: 0.20, duration: 1.8, pan: -0.05 }] },
  { step: 122, notes: [{ freq: GUITAR_FREQS.A4, velocity: 0.21, duration: 1.8, pan: 0.05 }] },
  { step: 123, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 1.9, pan: 0.1 }] },
  { step: 124, notes: [{ freq: GUITAR_FREQS.E4, velocity: 0.22, duration: 2.2, pan: 0.12, isHarmonic: true }] },
  { step: 125, notes: [{ freq: GUITAR_FREQS.B4, velocity: 0.22, duration: 2.2, pan: 0.14, isHarmonic: true }] },
  { step: 126, notes: [{ freq: GUITAR_FREQS.Gs4, velocity: 0.22, duration: 2.4, pan: 0.16, isHarmonic: true }] },
  { step: 127, notes: [{ freq: GUITAR_FREQS.E5, velocity: 0.24, duration: 2.6, pan: 0.20, isHarmonic: true }] },
];

interface AmbientGuitarSession {
  theme: ThemeId;
  masterGain: GainNode;
  compressor: DynamicsCompressorNode;
  bodyResonator: BiquadFilterNode;
  delayNode: DelayNode;
  delayGain: GainNode;
  intervalId: NodeJS.Timeout;
}

let activeGuitarSession: AmbientGuitarSession | null = null;

/**
 * Synthesizes an organic plucked acoustic guitar string.
 * Features pluck attack impulse, wooden soundboard body resonance,
 * frequency-dependent exponential decay, and stereo acoustic placement.
 */
function playAcousticGuitarString(
  ctx: AudioContext,
  destination: AudioNode,
  time: number,
  freq: number,
  velocity = 0.25,
  duration = 2.0,
  pan = 0.0,
  isHarmonic = false
) {
  try {
    // 1. Fundamental string oscillator
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    // Natural subtle pitch release on initial pluck (3 cents downward ramp)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq * 1.002, time);
    osc1.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

    // 2. 2nd Harmonic (string body overtone)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = isHarmonic ? 'sine' : 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // 3. 3rd Harmonic (high sparkle)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, time);

    // Pluck transient click/burst (simulates finger/pick on steel/nylon)
    const pluckBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.012), ctx.sampleRate);
    const pluckData = pluckBuffer.getChannelData(0);
    for (let i = 0; i < pluckData.length; i++) {
      pluckData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (pluckData.length * 0.25));
    }
    const pluckSource = ctx.createBufferSource();
    pluckSource.buffer = pluckBuffer;

    const pluckFilter = ctx.createBiquadFilter();
    pluckFilter.type = 'bandpass';
    pluckFilter.frequency.setValueAtTime(Math.min(freq * 1.8, 3800), time);
    pluckFilter.Q.setValueAtTime(2.0, time);

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(velocity * 0.12, time);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.012);

    pluckSource.connect(pluckFilter);
    pluckFilter.connect(pluckGain);

    // String envelopes: snappy attack (~5ms) and long organic exponential decays
    const effectiveVol = velocity * (isHarmonic ? 0.9 : 1.0);
    gain1.gain.setValueAtTime(0.0001, time);
    gain1.gain.linearRampToValueAtTime(effectiveVol, time + 0.006);
    gain1.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    gain2.gain.setValueAtTime(0.0001, time);
    gain2.gain.linearRampToValueAtTime(effectiveVol * 0.42, time + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.65);

    gain3.gain.setValueAtTime(0.0001, time);
    gain3.gain.linearRampToValueAtTime(effectiveVol * 0.18, time + 0.004);
    gain3.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.38);

    // Stereo Panning (guitarist in room perspective)
    let panner: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === 'function') {
      try {
        panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-0.6, Math.min(0.6, pan)), time);
      } catch {}
    }

    // Connect node graph
    const stringBus = ctx.createGain();
    stringBus.gain.setValueAtTime(1.0, time);

    osc1.connect(gain1);
    gain1.connect(stringBus);

    osc2.connect(gain2);
    gain2.connect(stringBus);

    osc3.connect(gain3);
    gain3.connect(stringBus);

    pluckGain.connect(stringBus);

    if (panner) {
      stringBus.connect(panner);
      panner.connect(destination);
    } else {
      stringBus.connect(destination);
    }

    // Play oscillators
    osc1.start(time);
    osc1.stop(time + duration + 0.1);

    osc2.start(time);
    osc2.stop(time + duration * 0.65 + 0.1);

    osc3.start(time);
    osc3.stop(time + duration * 0.38 + 0.1);

    pluckSource.start(time);
    pluckSource.stop(time + 0.02);
  } catch {}
}

/**
 * Start CountTo's signature Turkish Airlines Boarding Music acoustic guitar ambient loop.
 * Faithfully follows the score note-by-note at 88 BPM, with continuous harmonious cycling,
 * warm wooden body resonance, whisper-quiet volume, and zero audio spikes.
 */
export function startAmbientMusic(theme: ThemeId = 'aurora', targetVolume = 0.048) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // If already playing this theme session, maintain uninterrupted playback
    if (activeGuitarSession && activeGuitarSession.theme === theme) {
      return;
    }

    // Fade out previous session gracefully if any
    if (activeGuitarSession) {
      const old = activeGuitarSession;
      clearInterval(old.intervalId);
      old.masterGain.gain.setValueAtTime(old.masterGain.gain.value, now);
      old.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.6);
      setTimeout(() => {
        try {
          old.masterGain.disconnect();
        } catch {}
      }, 1700);
      activeGuitarSession = null;
    }

    // 1. Dynamics Compressor (Prevents any sudden peak, keeps volume ultra-gentle)
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-22, now);
    compressor.knee.setValueAtTime(24, now);
    compressor.ratio.setValueAtTime(10, now);
    compressor.attack.setValueAtTime(0.02, now);
    compressor.release.setValueAtTime(0.25, now);

    // 2. Wooden Guitar Soundboard Resonator (210 Hz body air & top plate mode)
    const bodyResonator = ctx.createBiquadFilter();
    bodyResonator.type = 'lowpass';
    bodyResonator.frequency.setValueAtTime(2400, now);
    bodyResonator.Q.setValueAtTime(0.8, now);

    // 3. Room Ambience Delay / Soft Acoustic Diffusion
    const delayNode = ctx.createDelay();
    delayNode.delayTime.setValueAtTime(0.28, now);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.22, now);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1200, now);

    delayNode.connect(delayFilter);
    delayFilter.connect(delayGain);
    delayGain.connect(delayNode); // feedback loop
    delayGain.connect(compressor);

    // 4. Master Volume with a peaceful 2.5s fade-in (Never jumpscares!)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetVolume, now + 2.5);

    // Chain: Instrument -> Body Filter -> Compressor + Delay -> Master Gain -> Destination
    bodyResonator.connect(compressor);
    bodyResonator.connect(delayNode);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Score Timeline Sequencer (88 BPM = 0.340909s per eighth-note step)
    const stepDuration = 60 / (88 * 2); // ~0.340909 seconds
    const totalCycleSteps = 128; // 16 measures * 8 steps = 43.636 seconds per loop
    const cycleDuration = totalCycleSteps * stepDuration;

    let cycleStartTime = now + 0.15;
    let nextStepIndex = 0;

    // Step-by-step note map for quick lookup
    const scoreMap = new Map<number, GuitarScoreStep['notes']>();
    TK_BOARDING_GUITAR_SCORE.forEach((s) => {
      scoreMap.set(s.step, s.notes);
    });

    const scheduleScore = () => {
      try {
        const currentTime = ctx.currentTime;
        const lookaheadTime = currentTime + 0.45; // 450ms scheduling lookahead

        while (true) {
          const stepTime = cycleStartTime + nextStepIndex * stepDuration;
          if (stepTime > lookaheadTime) break;

          const notesToPlay = scoreMap.get(nextStepIndex);
          if (notesToPlay && notesToPlay.length > 0) {
            notesToPlay.forEach((n) => {
              playAcousticGuitarString(
                ctx,
                bodyResonator,
                stepTime,
                n.freq,
                n.velocity ?? 0.25,
                n.duration ?? 2.0,
                n.pan ?? 0.0,
                n.isHarmonic ?? false
              );
            });
          }

          nextStepIndex++;
          if (nextStepIndex >= totalCycleSteps) {
            nextStepIndex = 0;
            cycleStartTime += cycleDuration;
          }
        }
      } catch {}
    };

    scheduleScore();
    const intervalId = setInterval(scheduleScore, 90);

    activeGuitarSession = {
      theme,
      masterGain,
      compressor,
      bodyResonator,
      delayNode,
      delayGain,
      intervalId,
    };
  } catch {}
}

/**
 * Smoothly stop acoustic guitar ambient music with a gentle fade-out.
 */
export function stopAmbientMusic(fadeSeconds = 1.6) {
  try {
    if (!activeGuitarSession) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const session = activeGuitarSession;
    clearInterval(session.intervalId);

    session.masterGain.gain.setValueAtTime(session.masterGain.gain.value, now);
    session.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);

    setTimeout(() => {
      try {
        session.masterGain.disconnect();
      } catch {}
    }, (fadeSeconds + 0.1) * 1000);

    activeGuitarSession = null;
  } catch {}
}

// =======================================================================
// User-Uploaded Custom MP3 / Audio Track Player
// =======================================================================
let customAudioEl: HTMLAudioElement | null = null;
let customFadeTimer: NodeJS.Timeout | null = null;

/**
 * Start playing user-uploaded custom MP3 track with smooth fade-in
 */
export function startCustomAudio(url: string, targetVolume = 0.35, loop = true): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (customFadeTimer) {
        clearInterval(customFadeTimer);
        customFadeTimer = null;
      }

      // If already playing the same source, just ensure volume and playing
      if (customAudioEl && customAudioEl.src === url && !customAudioEl.paused) {
        customAudioEl.volume = targetVolume;
        resolve();
        return;
      }

      if (customAudioEl) {
        customAudioEl.pause();
        customAudioEl = null;
      }

      const audio = new Audio();
      audio.src = url;
      audio.loop = loop;
      audio.volume = 0.01;

      audio.oncanplay = () => {
        audio.play().then(() => {
          // Smooth 1.5s fade-in
          let currentVol = 0.01;
          const step = (targetVolume - 0.01) / 15;
          customFadeTimer = setInterval(() => {
            currentVol = Math.min(targetVolume, currentVol + step);
            if (audio) {
              audio.volume = Math.max(0, Math.min(1, currentVol));
            }
            if (currentVol >= targetVolume && customFadeTimer) {
              clearInterval(customFadeTimer);
              customFadeTimer = null;
            }
          }, 100);
          resolve();
        }).catch(() => {
          // Playback might be blocked without user interaction
          resolve();
        });
      };

      audio.onerror = () => {
        resolve();
      };

      customAudioEl = audio;
    } catch {
      resolve();
    }
  });
}

/**
 * Smoothly stop custom uploaded MP3 audio
 */
export function stopCustomAudio(fadeSeconds = 1.0) {
  try {
    if (customFadeTimer) {
      clearInterval(customFadeTimer);
      customFadeTimer = null;
    }

    if (!customAudioEl) return;
    const el = customAudioEl;

    const startVol = el.volume;
    const steps = 10;
    const stepTime = (fadeSeconds * 1000) / steps;
    const volStep = startVol / steps;
    let stepCount = 0;

    customFadeTimer = setInterval(() => {
      stepCount++;
      const nextVol = Math.max(0, startVol - volStep * stepCount);
      el.volume = nextVol;

      if (stepCount >= steps || nextVol <= 0.01) {
        if (customFadeTimer) {
          clearInterval(customFadeTimer);
          customFadeTimer = null;
        }
        el.pause();
        el.currentTime = 0;
        if (customAudioEl === el) {
          customAudioEl = null;
        }
      }
    }, stepTime);
  } catch {}
}

/**
 * Adjust volume of custom MP3 in real-time
 */
export function setCustomAudioVolume(volume: number) {
  try {
    if (customAudioEl) {
      customAudioEl.volume = Math.max(0, Math.min(1, volume));
    }
  } catch {}
}
