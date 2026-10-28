import { recordImplicitSignal } from './musicRecommendationEngine';
import { smartShuffleEngine } from './smartShuffleEngine';
import { type SongTrack, PRESET_SONGS } from './trackConstants';

export type { SongTrack };
export { PRESET_SONGS };

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
  private prevTrack: SongTrack | null = null;
  
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
      smartShuffleEngine.recordTrackFinished(this.currentTrack, this.prevTrack);
      for (const l of this.onTrackEndedListeners) {
        try { l(this.currentTrack); } catch {}
      }
    }

    if (this.isRepeat) {
      this.seek(0);
      this.resume();
    } else if (this.isShuffle) {
      // Karıştırma AÇIKSA: Akıllı karıştırma algoritmasıyla yeni şarkıya geçilir
      const nextTrack = smartShuffleEngine.pickNextTrack(this.currentTrack);
      this.play(nextTrack);
    } else {
      // KARIŞTIRMA KAPALIYSA: Şarkı durur, otomatik yeni şarkıya geçilmez
      this.pause();
      this.seek(0);
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

    this.prevTrack = this.currentTrack;
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
        smartShuffleEngine.recordTrackEarlySkip(this.currentTrack, this.prevTrack);
      } else if (this.currentTime >= 30) {
        recordImplicitSignal(this.currentTrack, 'late_skip');
      }
    }

    if (this.isShuffle) {
      const nextTrack = smartShuffleEngine.pickNextTrack(this.currentTrack);
      this.play(nextTrack);
      return;
    }

    const pool = smartShuffleEngine.getPool();
    const list = pool.length > 0 ? pool : PRESET_SONGS;
    const currentIndex = list.findIndex((s) => s.id === this.currentTrack?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    this.play(list[nextIndex]);
  }

  public previous() {
    if (this.currentTime > 4) {
      this.seek(0);
      return;
    }
    const pool = smartShuffleEngine.getPool();
    const list = pool.length > 0 ? pool : PRESET_SONGS;
    const currentIndex = list.findIndex((s) => s.id === this.currentTrack?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    this.play(list[prevIndex]);
  }

  public setActivePool(pool: SongTrack[]) {
    smartShuffleEngine.setPool(pool);
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
