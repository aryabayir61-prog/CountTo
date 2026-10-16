import { ThemeId } from '../types/countdown';
import { startAmbientMusic, stopAmbientMusic } from './audio';

export type AmbientStationId = 'chillhop' | 'night' | 'rain' | 'cosmic';

export interface AmbientStation {
  id: AmbientStationId;
  name: string;
  tagline: string;
  url?: string;
  backupUrl?: string;
  isSynth?: boolean;
}

export const AMBIENT_STATIONS: Record<AmbientStationId, AmbientStation> = {
  chillhop: {
    id: 'chillhop',
    name: 'Lo-Fi Chillhop (24/7 Canlı)',
    tagline: 'Sıcacık analog beatler, caz piyano ve çalışma melodileri',
    url: 'https://ilm.stream35.radiohost.de/ilm_ilovechillhop_mp3-192',
    backupUrl: 'https://live.hunter.fm/lofi_high',
  },
  night: {
    id: 'night',
    name: 'Gece Lo-Fi (Mellow Beats)',
    tagline: 'Gece yarısı sakinliği, derin baslar ve lo-fi tınılar',
    url: 'https://live.hunter.fm/lofi_high',
    backupUrl: 'https://lofi.stream.laut.fm/lofi',
  },
  rain: {
    id: 'rain',
    name: 'Yağmurlu Lo-Fi (Rain & Chill)',
    tagline: 'Pencereye vuran yağmur damlaları ve dingin lo-fi akışı',
    url: 'https://lofi.stream.laut.fm/lofi',
    backupUrl: 'https://ilm.stream35.radiohost.de/ilm_ilovechillhop_mp3-192',
  },
  cosmic: {
    id: 'cosmic',
    name: 'Kozmik Tematik Akorlar',
    tagline: 'Seçili temanın kısık sesli, uzun ve süzülen synthesizer akışı',
    isSynth: true,
  },
};

const STORAGE_STATION_KEY = 'countto_ambient_station_v2';
const STORAGE_VOLUME_KEY = 'countto_ambient_volume_v2';

let audioPlayer: HTMLAudioElement | null = null;
let currentActiveStation: AmbientStationId = 'chillhop';
let currentVolume = 0.45;
let isPlaying = false;
let currentTheme: ThemeId = 'aurora';
let stateListeners: Array<(state: { isPlaying: boolean; station: AmbientStationId; volume: number }) => void> = [];

// Initialize stored values
if (typeof window !== 'undefined') {
  try {
    const savedStation = localStorage.getItem(STORAGE_STATION_KEY) as AmbientStationId;
    if (savedStation && AMBIENT_STATIONS[savedStation]) {
      currentActiveStation = savedStation;
    }
    const savedVol = localStorage.getItem(STORAGE_VOLUME_KEY);
    if (savedVol) {
      currentVolume = Math.max(0.05, Math.min(1.0, parseFloat(savedVol)));
    }
  } catch {
    // Ignore storage errors
  }
}

function notifyListeners() {
  const state = {
    isPlaying,
    station: currentActiveStation,
    volume: currentVolume,
  };
  stateListeners.forEach((listener) => listener(state));
}

export function subscribeToAmbientState(
  listener: (state: { isPlaying: boolean; station: AmbientStationId; volume: number }) => void
): () => void {
  stateListeners.push(listener);
  listener({
    isPlaying,
    station: currentActiveStation,
    volume: currentVolume,
  });
  return () => {
    stateListeners = stateListeners.filter((l) => l !== listener);
  };
}

export function setAmbientTheme(theme: ThemeId) {
  currentTheme = theme;
  if (isPlaying && currentActiveStation === 'cosmic') {
    startAmbientMusic(theme, currentVolume * 0.12);
  }
}

export function setAmbientStation(stationId: AmbientStationId) {
  if (!AMBIENT_STATIONS[stationId]) return;
  const changed = currentActiveStation !== stationId;
  currentActiveStation = stationId;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_STATION_KEY, stationId);
    } catch {
      // Ignore
    }
  }

  if (isPlaying && changed) {
    // Smooth transition
    playAmbient();
  } else {
    notifyListeners();
  }
}

export function setAmbientVolume(vol: number) {
  currentVolume = Math.max(0.05, Math.min(1.0, vol));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(currentVolume));
    } catch {
      // Ignore
    }
  }

  if (audioPlayer) {
    audioPlayer.volume = currentVolume;
  }

  if (isPlaying && currentActiveStation === 'cosmic') {
    startAmbientMusic(currentTheme, currentVolume * 0.12);
  }

  notifyListeners();
}

export function playAmbient(stationId?: AmbientStationId) {
  if (stationId && AMBIENT_STATIONS[stationId]) {
    currentActiveStation = stationId;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_STATION_KEY, stationId);
      } catch {
        // Ignore
      }
    }
  }

  const station = AMBIENT_STATIONS[currentActiveStation];

  // Stop any existing stream
  if (audioPlayer) {
    try {
      audioPlayer.pause();
      audioPlayer.src = '';
      audioPlayer = null;
    } catch {
      // Ignore
    }
  }
  stopAmbientMusic(0.8);

  if (station.isSynth) {
    startAmbientMusic(currentTheme, currentVolume * 0.12);
    isPlaying = true;
    notifyListeners();
    return;
  }

  // Play real audio stream
  try {
    const audio = new Audio();
    audio.src = station.url || '';
    audio.volume = currentVolume;
    audio.crossOrigin = 'anonymous';

    audio.addEventListener('error', () => {
      // Try backup stream url if available
      if (station.backupUrl && audio.src !== station.backupUrl) {
        audio.src = station.backupUrl;
        audio.play().catch(() => {
          // Fallback to cosmic synth if stream fails completely
          startAmbientMusic(currentTheme, currentVolume * 0.12);
        });
      }
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioPlayer = audio;
          isPlaying = true;
          notifyListeners();
        })
        .catch(() => {
          // Autoplay policy or network error, fallback to synth
          startAmbientMusic(currentTheme, currentVolume * 0.12);
          isPlaying = true;
          notifyListeners();
        });
    }
  } catch {
    startAmbientMusic(currentTheme, currentVolume * 0.12);
    isPlaying = true;
    notifyListeners();
  }
}

export function stopAmbient() {
  if (audioPlayer) {
    try {
      // Gentle fade out
      const fadeSteps = 8;
      const initialVol = audioPlayer.volume;
      let step = 0;
      const fadeTimer = setInterval(() => {
        step++;
        if (audioPlayer) {
          audioPlayer.volume = Math.max(0, initialVol * (1 - step / fadeSteps));
        }
        if (step >= fadeSteps) {
          clearInterval(fadeTimer);
          if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.src = '';
            audioPlayer = null;
          }
        }
      }, 50);
    } catch {
      audioPlayer.pause();
      audioPlayer = null;
    }
  }

  stopAmbientMusic(1.2);
  isPlaying = false;
  notifyListeners();
}

export function toggleAmbient(): boolean {
  if (isPlaying) {
    stopAmbient();
    return false;
  } else {
    playAmbient();
    return true;
  }
}

export function getAmbientState() {
  return {
    isPlaying,
    station: currentActiveStation,
    volume: currentVolume,
  };
}
