// Background Full-Song Audio Engine (Real Authentic Album Covers, Zero Watermarks, Full Tracks)
import { recordImplicitSignal } from './musicRecommendationEngine';

export interface SongTrack {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
  colors: [string, string]; // Dynamic color mixing palette for ambient liquid glass
  youtubeId: string;
  durationSec: number;
  audioUrl?: string; // Direct fallback audio stream
}

export const PRESET_SONGS: SongTrack[] = [
  {
    id: 'ajda-pekkan-arada',
    name: 'Arada Sırada',
    artist: 'Ajda Pekkan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4a/01/62/4a016259-22a3-f01e-7b70-1fc4200787a7/886443144880.jpg/600x600bb.jpg',
    colors: ['#4a0e4e', '#c026d3'],
    youtubeId: 'g2cT_Kz43m4',
    durationSec: 245,
  },
  {
    id: 'ajda-pekkan-yakar',
    name: 'Yakar Geçerim',
    artist: 'Ajda Pekkan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/71/67/20/716720e7-3db1-a751-6efc-9745c117d337/886443144903.jpg/600x600bb.jpg',
    colors: ['#831843', '#f43f5e'],
    youtubeId: '9vU6B9qE1fA',
    durationSec: 218,
  },
  {
    id: 'tralala-manifest',
    name: 'Tralala',
    artist: 'Manifest',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/09/65/49/09654984-bdf6-05a1-d77c-745aef128688/cover.jpg/600x600bb.jpg',
    colors: ['#4a0e4e', '#c026d3'],
    youtubeId: '0rW7Fbm4S7g',
    durationSec: 180,
  },
  {
    id: 'toz-pembe-nalan',
    name: 'Toz Pembe',
    artist: 'Nalan',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6b/c4/1b/6bc41bb6-2481-229b-e0f1-4dbcf4e72c5b/cover.jpg/600x600bb.jpg',
    colors: ['#831843', '#f43f5e'],
    youtubeId: '0pg0raFMNIU',
    durationSec: 236,
  },
  {
    id: 'birds-of-a-feather',
    name: 'Birds Of A Feather',
    artist: 'Billie Eilish',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg',
    colors: ['#0c2a5e', '#1d4ed8'],
    youtubeId: 'V9PVRfjEBTI',
    durationSec: 198,
  },
  {
    id: 'runaway-aurora',
    name: 'Runaway',
    artist: 'AURORA',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b7/5f/76/b75f7659-c7ac-36d8-e01f-2f6d02f5ef34/5056167160632.jpg/600x600bb.jpg',
    colors: ['#0f3928', '#166534'],
    youtubeId: 'd_HlPboLRL8',
    durationSec: 252,
  },
  {
    id: 'as-it-was',
    name: 'As It Was',
    artist: 'Harry Styles',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg',
    colors: ['#58200b', '#d97706'],
    youtubeId: 'H5v3kku4y6Q',
    durationSec: 167,
  },
  {
    id: 'askin-olayim',
    name: 'Aşkın Olayım',
    artist: 'Simge',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/be/25/5fbe25a2-6307-005b-5faf-a967f0b62ba9/cover.jpg/600x600bb.jpg',
    colors: ['#4c0519', '#be123c'],
    youtubeId: 'VREnTCTeS4k',
    durationSec: 251,
  },
  {
    id: 'antidepresan-mert',
    name: 'Antidepresan',
    artist: 'Mert Demir, Mabel Matiz',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/cd/6a/fb/cd6afb23-3442-e7ab-3b39-46f458bcad40/196922249655_Cover.jpg/600x600bb.jpg',
    colors: ['#2e1065', '#7e22ce'],
    youtubeId: 'i6CSvLvSNZ4',
    durationSec: 232,
  },
  {
    id: 'fascist-cerpow',
    name: 'Fascist',
    artist: 'Cerpow',
    albumCover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1e/02/d3/1e02d334-fa9c-5524-a80b-c1dc28735632/7caac8d3-814e-41ff-833b-189ead2ac233.jpg/600x600bb.jpg',
    colors: ['#7c2d12', '#ea580c'],
    youtubeId: 'KR7QDK4saas',
    durationSec: 162,
  },
];

// In-browser instant dictionary for popular artists & hits (0ms lookup)
const CLIENT_TRACK_CATALOG: Record<string, string> = {
  'ajda pekkan arada sirada': 'g2cT_Kz43m4',
  'arada sirada ajda pekkan': 'g2cT_Kz43m4',
  'arada sirada': 'g2cT_Kz43m4',
  'ajda pekkan yakar gecerim': '9vU6B9qE1fA',
  'yakar gecerim ajda pekkan': '9vU6B9qE1fA',
  'yakar gecerim': '9vU6B9qE1fA',
  'ajda pekkan': 'g2cT_Kz43m4',
  'ajda pekkan o benim dunyam': 'c1oH1tHn8fI',
  'ajda pekkan resim': '2bI3C5L8M5k',
  'manifest tralala': '0rW7Fbm4S7g',
  'tralala manifest': '0rW7Fbm4S7g',
  'tralala': '0rW7Fbm4S7g',
  'toz pembe nalan': '0pg0raFMNIU',
  'toz pembe': '0pg0raFMNIU',
  'askin olayim simge': 'VREnTCTeS4k',
  'simge askin olayim': 'VREnTCTeS4k',
  'askin olayim': 'VREnTCTeS4k',
  'antidepresan mert demir': 'i6CSvLvSNZ4',
  'mert demir antidepresan': 'i6CSvLvSNZ4',
  'antidepresan': 'i6CSvLvSNZ4',
  'atese dustum mert demir': 'xP89mCq741U',
  'sezen aksu vazgectim': 'a_4_O-823qE',
  'sezen aksu': 'a_4_O-823qE',
  'tarkan kuzu kuzu': '1f32qfJgqQY',
  'tarkan simarik': 'yDq1nB5y2G4',
  'tarkan': '1f32qfJgqQY',
  'ezhel geceler': 'U2hF6y1V0nE',
  'birds of a feather billie eilish': 'V9PVRfjEBTI',
  'billie eilish birds of a feather': 'V9PVRfjEBTI',
  'birds of a feather': 'V9PVRfjEBTI',
  'runaway aurora': 'd_HlPboLRL8',
  'aurora runaway': 'd_HlPboLRL8',
  'as it was harry styles': 'H5v3kku4y6Q',
  'harry styles as it was': 'H5v3kku4y6Q',
  'as it was': 'H5v3kku4y6Q',
  'taylor swift cruel summer': 'ic8j13piAhQ',
  'cruel summer': 'ic8j13piAhQ',
  'the weeknd blinding lights': 'fHI8X4OXluQ',
  'blinding lights': 'fHI8X4OXluQ',
  'starboy the weeknd': '34Na4j8AVgA',
  'fascist cerpow': 'KR7QDK4saas',
  'cerpow fascist': 'KR7QDK4saas',
  'fascist': 'KR7QDK4saas',
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

class HiddenMusicAudioEngine {
  private player: any = null;
  private isApiReady: boolean = false;
  private pendingTrack: SongTrack | null = null;
  private containerId = 'contto-silent-audio-anchor';
  private progressInterval: number | null = null;
  private safetyTimer: number | null = null;
  
  // HTML5 Fallback Audio player
  private html5Audio: HTMLAudioElement | null = null;
  private activeEngine: 'youtube' | 'html5' = 'youtube';

  private listeners: Set<(state: { 
    isPlaying: boolean; 
    currentTime: number; 
    duration: number; 
    track: SongTrack | null;
    isShuffle: boolean;
    isRepeat: boolean;
  }) => void> = new Set();
  private onTrackEndedListeners: Set<(track: SongTrack) => void> = new Set();
  
  public currentTrack: SongTrack | null = null;
  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public duration: number = 180;
  public isShuffle: boolean = false;
  public isRepeat: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initHtml5Audio();
      this.initApi();
    }
  }

  private initHtml5Audio() {
    if (typeof Audio === 'undefined') return;
    this.html5Audio = new Audio();
    this.html5Audio.preload = 'auto';

    this.html5Audio.addEventListener('playing', () => {
      this.activeEngine = 'html5';
      this.isPlaying = true;
      if (this.html5Audio && this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
        this.duration = this.html5Audio.duration;
      }
      this.startProgressTracker();
      this.emit();
    });

    this.html5Audio.addEventListener('pause', () => {
      if (this.activeEngine === 'html5') {
        this.isPlaying = false;
        this.emit();
      }
    });

    this.html5Audio.addEventListener('timeupdate', () => {
      if (this.activeEngine === 'html5' && this.html5Audio) {
        this.currentTime = this.html5Audio.currentTime;
        if (this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
          this.duration = this.html5Audio.duration;
        }
        this.emit();
      }
    });

    this.html5Audio.addEventListener('ended', () => {
      if (this.activeEngine === 'html5') {
        this.handleTrackEnded();
      }
    });
  }

  public onTrackCompleted(cb: (track: SongTrack) => void) {
    this.onTrackEndedListeners.add(cb);
    return () => {
      this.onTrackEndedListeners.delete(cb);
    };
  }

  private initApi() {
    if (window.YT && window.YT.Player) {
      this.isApiReady = true;
      this.createPlayer();
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      this.isApiReady = true;
      this.createPlayer();
    };

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }

  private createPlayer() {
    if (!this.isApiReady || this.player || typeof document === 'undefined') return;

    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      // Fixed positioning inside active viewport (200x200 with 0.001 opacity) avoids Chrome throttling
      container.style.position = 'fixed';
      container.style.bottom = '0px';
      container.style.right = '0px';
      container.style.width = '200px';
      container.style.height = '200px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }

    try {
      const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://localhost';

      this.player = new window.YT.Player(this.containerId, {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: currentOrigin,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            if (this.pendingTrack) {
              this.play(this.pendingTrack);
              this.pendingTrack = null;
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              // Playing
              this.activeEngine = 'youtube';
              this.isPlaying = true;
              if (this.safetyTimer) {
                clearTimeout(this.safetyTimer);
                this.safetyTimer = null;
              }
              // Pause html5 audio if it was running
              if (this.html5Audio) {
                try { this.html5Audio.pause(); } catch {}
              }
              this.duration = this.player?.getDuration() || this.currentTrack?.durationSec || 180;
              this.startProgressTracker();
              this.emit();
            } else if (event.data === 2) {
              // Paused
              if (this.activeEngine === 'youtube') {
                this.isPlaying = false;
                this.stopProgressTracker();
                this.emit();
              }
            } else if (event.data === 0) {
              // Ended
              this.handleTrackEnded();
            }
          },
          onError: () => {
            // YouTube embed blocked or error -> Fallback immediately to HTML5 Audio!
            if (this.currentTrack) {
              this.fallbackToHtml5Audio(this.currentTrack);
            }
          },
        },
      });
    } catch {
      // Ignore
    }
  }

  private handleTrackEnded() {
    if (this.currentTrack) {
      recordImplicitSignal(this.currentTrack, 'complete');
      for (const l of this.onTrackEndedListeners) {
        try { l(this.currentTrack); } catch {}
      }
    }
    if (this.isRepeat) {
      this.seek(0);
      this.resume();
    } else {
      this.next();
    }
  }

  private async fallbackToHtml5Audio(track: SongTrack) {
    if (!this.html5Audio) return;

    let audioSrc = track.audioUrl;

    // If audioUrl is not available, query iTunes search API directly in browser
    if (!audioSrc) {
      try {
        const query = `${track.name} ${track.artist}`.trim();
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`);
        const data = await res.json();
        if (data && data.results && data.results[0] && data.results[0].previewUrl) {
          audioSrc = data.results[0].previewUrl;
          track.audioUrl = audioSrc;
        }
      } catch {}
    }

    if (audioSrc) {
      try {
        this.activeEngine = 'html5';
        this.html5Audio.src = audioSrc;
        this.html5Audio.currentTime = 0;
        this.html5Audio.volume = 1;
        await this.html5Audio.play();
        this.isPlaying = true;
        this.duration = track.durationSec || 180;
        this.startProgressTracker();
        this.emit();
      } catch {}
    }
  }

  public subscribe(cb: (state: { 
    isPlaying: boolean; 
    currentTime: number; 
    duration: number; 
    track: SongTrack | null;
    isShuffle: boolean;
    isRepeat: boolean;
  }) => void) {
    this.listeners.add(cb);
    cb({ 
      isPlaying: this.isPlaying, 
      currentTime: this.currentTime, 
      duration: this.duration, 
      track: this.currentTrack,
      isShuffle: this.isShuffle,
      isRepeat: this.isRepeat,
    });
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit() {
    for (const listener of this.listeners) {
      listener({
        isPlaying: this.isPlaying,
        currentTime: this.currentTime,
        duration: this.duration,
        track: this.currentTrack,
        isShuffle: this.isShuffle,
        isRepeat: this.isRepeat,
      });
    }
  }

  private async crossfadeVolume(from: number, to: number, durationMs = 250): Promise<void> {
    const steps = 6;
    const stepTime = durationMs / steps;
    const diff = to - from;
    for (let i = 1; i <= steps; i++) {
      const vol = Math.round(from + diff * (i / steps));
      if (this.player && this.player.setVolume) {
        try { this.player.setVolume(vol); } catch {}
      }
      if (this.html5Audio) {
        try { this.html5Audio.volume = Math.max(0, Math.min(1, vol / 100)); } catch {}
      }
      await new Promise((r) => setTimeout(r, stepTime));
    }
  }

  public async play(track: SongTrack) {
    // Clear safety timer if any
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }

    // Crossfade out previous track
    if (this.isPlaying) {
      await this.crossfadeVolume(100, 0, 200);
    }

    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.durationSec || 180;
    this.isPlaying = true;
    this.emit();

    let vid = track.youtubeId;

    // Check client built-in catalog first for instant 0ms response
    if (!vid) {
      const cleanKey = `${track.name} ${track.artist}`.toLowerCase().trim();
      const songKey = track.name.toLowerCase().trim();
      if (CLIENT_TRACK_CATALOG[cleanKey]) {
        vid = CLIENT_TRACK_CATALOG[cleanKey];
        track.youtubeId = vid;
      } else if (CLIENT_TRACK_CATALOG[songKey]) {
        vid = CLIENT_TRACK_CATALOG[songKey];
        track.youtubeId = vid;
      } else {
        for (const [k, v] of Object.entries(CLIENT_TRACK_CATALOG)) {
          if (cleanKey.includes(k) || k.includes(cleanKey)) {
            vid = v;
            track.youtubeId = vid;
            break;
          }
        }
      }
    }

    // Resolve via API if still no videoId
    if (!vid) {
      try {
        const query = `${track.name} ${track.artist}`.trim();
        const res = await fetch(`/api/resolve-track?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.videoId) {
            vid = data.videoId;
            track.youtubeId = vid;
          }
          if (data && data.audioUrl && !track.audioUrl) {
            track.audioUrl = data.audioUrl;
          }
        }
      } catch {
        // Network or 404
      }
    }

    // Secondary resolve attempt with song name only
    if (!vid) {
      try {
        const res = await fetch(`/api/resolve-track?q=${encodeURIComponent(track.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.videoId) {
            vid = data.videoId;
            track.youtubeId = vid;
          }
          if (data && data.audioUrl && !track.audioUrl) {
            track.audioUrl = data.audioUrl;
          }
        }
      } catch {}
    }

    // If still no YouTube videoId, fallback to direct HTML5 Audio stream
    if (!vid) {
      await this.fallbackToHtml5Audio(track);
      return;
    }

    // If YouTube Player is not ready yet, queue track
    if (!this.player || !this.player.loadVideoById) {
      this.pendingTrack = { ...track, youtubeId: vid };
      this.startProgressTracker();
      this.emit();
      return;
    }

    try {
      this.activeEngine = 'youtube';
      this.player.loadVideoById({
        videoId: vid,
        startSeconds: 0,
      });
      this.player.playVideo();
      this.crossfadeVolume(0, 100, 250);
    } catch {
      this.fallbackToHtml5Audio(track);
    }

    // Safety fallback: If YouTube doesn't start playing within 3 seconds, fire HTML5 audio!
    this.safetyTimer = window.setTimeout(() => {
      if (this.currentTrack?.id === track.id && this.currentTime === 0 && this.activeEngine === 'youtube') {
        const state = this.player?.getPlayerState ? this.player.getPlayerState() : -1;
        if (state !== 1) { // 1 = playing
          this.fallbackToHtml5Audio(track);
        }
      }
    }, 3200);

    this.startProgressTracker();
    this.emit();
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.stopProgressTracker();
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }

    if (this.player && this.player.pauseVideo) {
      try { this.player.pauseVideo(); } catch {}
    }
    if (this.html5Audio) {
      try { this.html5Audio.pause(); } catch {}
    }
    this.emit();
  }

  public resume() {
    if (!this.currentTrack) {
      if (PRESET_SONGS.length > 0) {
        this.play(PRESET_SONGS[0]);
      }
      return;
    }

    this.isPlaying = true;
    if (this.activeEngine === 'youtube' && this.player && this.player.playVideo) {
      try { this.player.playVideo(); } catch {}
    } else if (this.activeEngine === 'html5' && this.html5Audio) {
      try { this.html5Audio.play(); } catch {}
    }

    this.startProgressTracker();
    this.emit();
  }

  public seek(seconds: number) {
    if (this.currentTrack && seconds < this.currentTime - 4) {
      recordImplicitSignal(this.currentTrack, 'rewind');
    }
    this.currentTime = seconds;

    if (this.activeEngine === 'youtube' && this.player && this.player.seekTo) {
      try { this.player.seekTo(seconds, true); } catch {}
    }
    if (this.activeEngine === 'html5' && this.html5Audio) {
      try { this.html5Audio.currentTime = seconds; } catch {}
    }
    this.emit();
  }

  public next() {
    if (this.currentTrack) {
      if (this.currentTime < 5) {
        recordImplicitSignal(this.currentTrack, 'early_skip');
      } else if (this.currentTime >= 30) {
        recordImplicitSignal(this.currentTrack, 'late_skip');
      }
    }

    const list = PRESET_SONGS;
    if (this.isShuffle) {
      const otherTracks = list.filter((t) => t.id !== this.currentTrack?.id);
      const randomTrack = otherTracks[Math.floor(Math.random() * otherTracks.length)] || list[0];
      this.play(randomTrack);
      return;
    }
    const currentIndex = list.findIndex((s) => s.id === this.currentTrack?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    this.play(list[nextIndex]);
  }

  public previous() {
    if (this.currentTime > 4) {
      this.seek(0);
      return;
    }
    const list = PRESET_SONGS;
    const currentIndex = list.findIndex((s) => s.id === this.currentTrack?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    this.play(list[prevIndex]);
  }

  public toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.emit();
  }

  public toggleRepeat() {
    this.isRepeat = !this.isRepeat;
    if (this.isRepeat && this.currentTrack) {
      recordImplicitSignal(this.currentTrack, 'repeat');
    }
    this.emit();
  }

  private startProgressTracker() {
    this.stopProgressTracker();
    this.progressInterval = window.setInterval(() => {
      if (!this.isPlaying) return;

      if (this.activeEngine === 'youtube') {
        if (this.player && this.player.getCurrentTime) {
          try {
            const t = this.player.getCurrentTime();
            const d = this.player.getDuration();
            if (typeof t === 'number' && !isNaN(t)) {
              this.currentTime = t;
            }
            if (typeof d === 'number' && !isNaN(d) && d > 0) {
              this.duration = d;
            }
          } catch {
            this.currentTime += 0.5;
          }
        } else {
          this.currentTime += 0.5;
        }
      } else if (this.activeEngine === 'html5' && this.html5Audio) {
        this.currentTime = this.html5Audio.currentTime;
        if (this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
          this.duration = this.html5Audio.duration;
        }
      }

      if (this.currentTime >= this.duration && this.duration > 0) {
        this.handleTrackEnded();
      } else {
        this.emit();
      }
    }, 500);
  }

  private stopProgressTracker() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const musicAudioEngine = new HiddenMusicAudioEngine();
