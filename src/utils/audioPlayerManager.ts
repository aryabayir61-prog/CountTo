import { SpotifyTrack } from '../types/music';
import { resolveAudioStream } from './audioStreamService';

type PlaybackListener = (state: {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
}) => void;

class AudioPlayerManager {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: SpotifyTrack | null = null;
  private isPlaying = false;
  private isBuffering = false;
  private currentTime = 0;
  private duration = 0;
  private volume = 0.8;
  private isMuted = false;
  private isLooping = false;
  private listeners: Set<PlaybackListener> = new Set();
  private onTrackEndedCallback?: () => void;
  private iframePlayer: HTMLIFrameElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.isBuffering = false;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.notify();
    });

    this.audio.addEventListener('playing', () => {
      this.isBuffering = false;
      this.notify();
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration || (this.currentTrack ? this.currentTrack.durationMs / 1000 : 0);
        this.notify();
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.duration = this.audio.duration;
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.isLooping) {
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().catch(() => {});
        }
      } else if (this.onTrackEndedCallback) {
        this.onTrackEndedCallback();
      }
    });

    this.audio.addEventListener('error', () => {
      this.isBuffering = false;
      // If direct audio element errors, try hidden iframe fallback if youtubeId exists
      if (this.currentTrack?.youtubeId) {
        this.playViaHiddenIframe(this.currentTrack.youtubeId);
      }
      this.notify();
    });
  }

  private playViaHiddenIframe(youtubeId: string) {
    if (typeof document === 'undefined') return;
    let iframe = document.getElementById('countto-music-stream-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'countto-music-stream-iframe';
      iframe.style.position = 'fixed';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      iframe.style.left = '-9999px';
      iframe.style.bottom = '-9999px';
      iframe.allow = 'autoplay';
      document.body.appendChild(iframe);
    }
    iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;
    this.iframePlayer = iframe;
    this.isPlaying = true;
    this.isBuffering = false;
    this.notify();
  }

  private stopIframe() {
    if (this.iframePlayer) {
      this.iframePlayer.src = 'about:blank';
    }
  }

  public setOnTrackEnded(callback: () => void) {
    this.onTrackEndedCallback = callback;
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState() {
    return {
      track: this.currentTrack,
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isLooping: this.isLooping,
    };
  }

  /**
   * Crossfade: Smoothly fades volume out before changing track, and fades in after.
   */
  private async fadeVolume(from: number, to: number, durationMs = 350): Promise<void> {
    if (!this.audio) return;
    const steps = 10;
    const stepTime = durationMs / steps;
    const diff = to - from;
    for (let i = 1; i <= steps; i++) {
      if (this.audio) {
        this.audio.volume = Math.max(0, Math.min(1, from + diff * (i / steps)));
      }
      await new Promise((r) => setTimeout(r, stepTime));
    }
  }

  public async playTrack(track: SpotifyTrack) {
    // Crossfade out previous track if playing
    if (this.isPlaying && this.audio) {
      await this.fadeVolume(this.audio.volume, 0, 350);
    }

    this.currentTrack = track;
    this.isBuffering = true;
    this.currentTime = 0;
    this.duration = track.durationMs ? track.durationMs / 1000 : 180;
    this.stopIframe();
    this.notify();

    if (!this.audio) {
      this.initAudio();
    }

    // 1. Direct streamUrl if provided on track
    if (track.streamUrl) {
      try {
        if (this.audio) {
          this.audio.src = track.streamUrl;
          await this.audio.play();
          this.isPlaying = true;
          this.isBuffering = false;
          this.fadeVolume(0, this.volume, 350);
          this.notify();
          return;
        }
      } catch {
        // Fallback to Piped stream resolution
      }
    }

    // 2. Resolve via Piped / Invidious API
    const ytId = track.youtubeId || (track.id.startsWith('yt-') ? track.id.replace('yt-', '') : null);

    if (ytId) {
      const streamUrl = await resolveAudioStream(ytId);
      if (streamUrl && this.audio) {
        try {
          this.audio.src = streamUrl;
          await this.audio.play();
          this.isPlaying = true;
          this.isBuffering = false;
          this.notify();
          return;
        } catch {
          // If browser blocked play or stream failed, use hidden fallback
        }
      }

      // 3. Fallback: Hidden seamless background stream
      this.playViaHiddenIframe(ytId);
      return;
    }

    // 4. Fallback: Preview audio if available
    if (track.previewUrl && this.audio) {
      try {
        this.audio.src = track.previewUrl;
        await this.audio.play();
        this.isPlaying = true;
        this.isBuffering = false;
        this.notify();
      } catch {
        this.isPlaying = false;
        this.isBuffering = false;
        this.notify();
      }
    }
  }

  public togglePlay() {
    if (!this.currentTrack) return;

    if (this.isPlaying) {
      if (this.audio) {
        this.audio.pause();
      }
      this.stopIframe();
      this.isPlaying = false;
    } else {
      if (this.audio && this.audio.src && this.audio.src !== 'about:blank') {
        this.audio.play().catch(() => {
          if (this.currentTrack?.youtubeId) {
            this.playViaHiddenIframe(this.currentTrack.youtubeId);
          }
        });
        this.isPlaying = true;
      } else if (this.currentTrack) {
        this.playTrack(this.currentTrack);
      }
    }
    this.notify();
  }

  public seek(seconds: number) {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.currentTime = seconds;
      this.notify();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : clamped;
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    this.notify();
  }

  public toggleLoop() {
    this.isLooping = !this.isLooping;
    if (this.audio) {
      this.audio.loop = this.isLooping;
    }
    this.notify();
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopIframe();
    this.currentTrack = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.currentTime = 0;
    this.duration = 0;
    this.notify();
  }
}

export const audioPlayer = new AudioPlayerManager();
