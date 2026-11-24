import { recordImplicitSignal } from './musicRecommendationEngine';
import { smartShuffleEngine } from './smartShuffleEngine';
import { type SongTrack, PRESET_SONGS } from './trackConstants';

export type { SongTrack };
export { PRESET_SONGS };

function foldTurkish(str: string): string {
  return str
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&/\\#,+()$~%.'":*?<>{}\[\]|\-_!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTrackNoise(str: string): string {
  return str
    .replace(/\((?:feat|ft|with|featuring)[^)]*\)/gi, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s*-\s*(?:single|album|ep|remastered|radio edit|version).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSignificant(str: string): string[] {
  const folded = foldTurkish(stripTrackNoise(str));
  if (!folded) return [];
  const raw = folded.split(' ').filter(Boolean);
  const filtered = raw.filter(
    (w) => w.length >= 2 && !['feat', 'ft', 'the', 'and', 've', 'ile'].includes(w)
  );
  return filtered.length > 0 ? filtered : raw;
}

// Known broken/404 or mismatched legacy YouTube IDs that may linger in localStorage caches
const KNOWN_INVALID_YOUTUBE_IDS = new Set([
  'g2cT_Kz43m4',
  '9vU6B9qE1fA',
  'c1oH1tHn8fI',
  '2bI3C5L8M5k',
  'xP89mCq741U',
  'a_4_O-823qE',
  '1f32qfJgqQY',
  'yDq1nB5y2G4',
  'U2hF6y1V0nE',
]);

// In-browser instant dictionary for popular artists & hits (0ms lookup, Turkish-normalized keys)
const CLIENT_TRACK_CATALOG: Record<string, string> = {
  // Hileli - Manifest & Ajda Pekkan
  'hileli manifest': 'kXKhNI4DLHM',
  'manifest hileli': 'kXKhNI4DLHM',
  'hileli ajda pekkan': 'kXKhNI4DLHM',
  'ajda pekkan hileli': 'kXKhNI4DLHM',
  'hileli manifest ajda pekkan': 'kXKhNI4DLHM',
  'manifest ajda pekkan hileli': 'kXKhNI4DLHM',

  // Ajda Pekkan
  'ajda pekkan arada sirada': '5Vc6tvr9aRg',
  'arada sirada ajda pekkan': '5Vc6tvr9aRg',
  'ajda pekkan yakar gecerim': 'Xpp_y2Os5Co',
  'yakar gecerim ajda pekkan': 'Xpp_y2Os5Co',
  'ajda pekkan o benim dunyam': 'aAPuhE7G58E',
  'o benim dunyam ajda pekkan': 'aAPuhE7G58E',
  'ajda pekkan resim': '6uCsExNeu88',
  'resim ajda pekkan': '6uCsExNeu88',

  // Manifest
  'manifest tralala': '0rW7Fbm4S7g',
  'tralala manifest': '0rW7Fbm4S7g',
  'toz pembe manifest': '0pg0raFMNIU',
  'manifest toz pembe': '0pg0raFMNIU',

  // Popular Turkish & Global hits
  'askin olayim simge': 'VREnTCTeS4k',
  'simge askin olayim': 'VREnTCTeS4k',
  'antidepresan mert demir': 'i6CSvLvSNZ4',
  'mert demir antidepresan': 'i6CSvLvSNZ4',
  'antidepresan mert demir mabel matiz': 'i6CSvLvSNZ4',
  'mert demir mabel matiz antidepresan': 'i6CSvLvSNZ4',
  'atese dustum mert demir': 'RQmXet6kZ-Y',
  'mert demir atese dustum': 'RQmXet6kZ-Y',
  'sezen aksu vazgectim': '83PXWOoucDU',
  'vazgectim sezen aksu': '83PXWOoucDU',
  'tarkan kuzu kuzu': 'NAHRpEqgcL4',
  'kuzu kuzu tarkan': 'NAHRpEqgcL4',
  'tarkan simarik': 'cpp69ghR1IM',
  'simarik tarkan': 'cpp69ghR1IM',
  'ezhel geceler': 'XokJGO8ALVs',
  'geceler ezhel': 'XokJGO8ALVs',
  'birds of a feather billie eilish': 'V9PVRfjEBTI',
  'billie eilish birds of a feather': 'V9PVRfjEBTI',
  'runaway aurora': 'd_HlPboLRL8',
  'aurora runaway': 'd_HlPboLRL8',
  'as it was harry styles': 'H5v3kku4y6Q',
  'harry styles as it was': 'H5v3kku4y6Q',
  'taylor swift cruel summer': 'ic8j13piAhQ',
  'cruel summer taylor swift': 'ic8j13piAhQ',
  'the weeknd blinding lights': 'fHI8X4OXluQ',
  'blinding lights the weeknd': 'fHI8X4OXluQ',
  'starboy the weeknd': '34Na4j8AVgA',
  'the weeknd starboy': '34Na4j8AVgA',
  'fascist cerpow': 'KR7QDK4saas',
  'cerpow fascist': 'KR7QDK4saas',
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
  private pendingTrack: { track: SongTrack; sessionId: number } | null = null;
  private containerId = 'contto-silent-audio-anchor';
  private progressInterval: number | null = null;
  private safetyTimer: number | null = null;
  private prevTrack: SongTrack | null = null;

  // Concurrency & transition guards to eliminate wrong-song playback races
  private playSessionId: number = 0;
  private isLoadingTrack: boolean = false;
  private isPausedByUser: boolean = false;
  private expectedVideoId: string | null = null;
  private trackLoadStartedAt: number = 0;
  private resolvedVideoCache: Map<string, { videoId: string | null; audioUrl?: string | null }> = new Map();

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
      if (this.activeEngine !== 'html5' || this.isPausedByUser) return;
      this.isLoadingTrack = false;
      this.isPlaying = true;
      if (this.html5Audio && this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
        this.duration = this.html5Audio.duration;
      }
      this.startProgressTracker();
      this.emit();
    });

    this.html5Audio.addEventListener('pause', () => {
      if (this.activeEngine === 'html5' && !this.isLoadingTrack) {
        this.isPlaying = false;
        this.stopProgressTracker();
        this.emit();
      }
    });

    this.html5Audio.addEventListener('timeupdate', () => {
      if (this.activeEngine === 'html5' && this.html5Audio && !this.isLoadingTrack) {
        this.currentTime = this.html5Audio.currentTime;
        if (this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
          this.duration = this.html5Audio.duration;
        }
        this.emit();
      }
    });

    this.html5Audio.addEventListener('ended', () => {
      if (this.activeEngine === 'html5' && !this.isLoadingTrack) {
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
      const currentOrigin =
        typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://localhost';

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
            if (this.pendingTrack && this.pendingTrack.sessionId === this.playSessionId && !this.isPausedByUser) {
              const queued = this.pendingTrack.track;
              this.pendingTrack = null;
              this.loadYouTubeVideo(queued, queued.youtubeId, this.playSessionId);
            } else {
              this.pendingTrack = null;
            }
          },
          onStateChange: (event: any) => {
            const loadedVideoId = this.player?.getVideoData?.()?.video_id;
            if (this.expectedVideoId && loadedVideoId && loadedVideoId !== this.expectedVideoId) {
              // Ignore stale events belonging to a previously unloaded video
              return;
            }

            if (event.data === 1) {
              // Playing
              if (this.safetyTimer) {
                clearTimeout(this.safetyTimer);
                this.safetyTimer = null;
              }
              if (this.isPausedByUser) {
                try {
                  this.player.pauseVideo();
                } catch {}
                return;
              }
              if (this.html5Audio) {
                try {
                  this.html5Audio.pause();
                } catch {}
              }
              this.activeEngine = 'youtube';
              this.isLoadingTrack = false;
              this.isPlaying = true;
              const ytDuration = this.player?.getDuration?.();
              if (typeof ytDuration === 'number' && !isNaN(ytDuration) && ytDuration > 0) {
                this.duration = ytDuration;
              } else {
                this.duration = this.currentTrack?.durationSec || 180;
              }
              try {
                this.player.setVolume?.(100);
              } catch {}
              this.startProgressTracker();
              this.emit();
            } else if (event.data === 3) {
              // Buffering: Video is loading full track, clear timeout
              if (this.safetyTimer) {
                clearTimeout(this.safetyTimer);
                this.safetyTimer = null;
              }
            } else if (event.data === 2) {
              // Paused: Ignore transient pause events emitted right during loadVideoById
              if (this.isLoadingTrack || Date.now() - this.trackLoadStartedAt < 1200) {
                return;
              }
              if (this.activeEngine === 'youtube') {
                this.isPlaying = false;
                this.stopProgressTracker();
                this.emit();
              }
            } else if (event.data === 0) {
              // Ended: Ignore stale ENDED events while switching tracks
              if (this.isLoadingTrack || Date.now() - this.trackLoadStartedAt < 1500) {
                return;
              }
              if (this.activeEngine === 'youtube') {
                this.handleTrackEnded();
              }
            }
          },
          onError: () => {
            if (this.safetyTimer) {
              clearTimeout(this.safetyTimer);
              this.safetyTimer = null;
            }
            if (this.currentTrack && !this.isPausedByUser && this.activeEngine === 'youtube') {
              this.fallbackToHtml5Audio(this.currentTrack, this.playSessionId);
            }
          },
        },
      });
    } catch {
      // Ignore YT init errors
    }
  }

  private handleTrackEnded() {
    this.stopProgressTracker();

    if (this.currentTrack) {
      recordImplicitSignal(this.currentTrack, 'complete');
      smartShuffleEngine.recordTrackFinished(this.currentTrack, this.prevTrack);
      for (const l of this.onTrackEndedListeners) {
        try {
          l(this.currentTrack);
        } catch {}
      }
    }

    if (this.isRepeat && this.currentTrack) {
      this.seek(0);
      this.resume();
    } else if (this.isShuffle) {
      const nextTrack = smartShuffleEngine.pickNextTrack(this.currentTrack);
      this.play(nextTrack);
    } else {
      // Repeat & shuffle off: stop cleanly at 0:00 without calling YT seekTo(0) (which can auto-replay)
      this.isPlaying = false;
      this.isPausedByUser = true;
      this.currentTime = 0;
      if (this.html5Audio) {
        try {
          this.html5Audio.pause();
          this.html5Audio.currentTime = 0;
        } catch {}
      }
      this.emit();
    }
  }

  private async resolveItunesPreview(track: SongTrack): Promise<string | null> {
    const cleanTitle = stripTrackNoise(track.name);
    const query = `${cleanTitle} ${track.artist}`.trim();
    const titleTokens = tokenizeSignificant(cleanTitle || track.name);
    const artistTokens = tokenizeSignificant(track.artist);

    const searchCountry = async (country: string): Promise<any[]> => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6&country=${country}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.results) ? data.results : [];
      } catch {
        return [];
      }
    };

    let results = await searchCountry('tr');
    if (results.length === 0) {
      results = await searchCountry('us');
    }

    let bestUrl: string | null = null;
    let bestScore = -Infinity;

    for (const r of results) {
      if (!r?.previewUrl) continue;
      const tName = foldTurkish(r.trackName || '');
      const aName = foldTurkish(r.artistName || '');
      let score = 0;

      if (titleTokens.length > 0) {
        const matchedT = titleTokens.filter((t) => tName.includes(t)).length;
        const tRatio = matchedT / titleTokens.length;
        if (tRatio < 0.5) continue;
        score += tRatio * 50;
      }

      if (artistTokens.length > 0) {
        const matchedA = artistTokens.filter((a) => aName.includes(a)).length;
        if (matchedA === 0) continue;
        score += (matchedA / artistTokens.length) * 40;
      }

      if (score > bestScore) {
        bestScore = score;
        bestUrl = r.previewUrl;
      }
    }

    return bestUrl;
  }

  private async fallbackToHtml5Audio(track: SongTrack, sessionId: number) {
    if (sessionId !== this.playSessionId || this.isPausedByUser) return;

    // Pause YouTube player so dual playback can never occur
    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch {}
    }

    if (!this.html5Audio) {
      this.isPlaying = false;
      this.isLoadingTrack = false;
      this.stopProgressTracker();
      this.emit();
      return;
    }

    let audioSrc = track.audioUrl || null;

    if (!audioSrc) {
      audioSrc = await this.resolveItunesPreview(track);
      if (sessionId !== this.playSessionId || this.isPausedByUser) return;
    }

    if (audioSrc) {
      try {
        this.activeEngine = 'html5';
        this.expectedVideoId = null;
        this.html5Audio.src = audioSrc;
        this.html5Audio.currentTime = 0;
        this.html5Audio.volume = 1;
        await this.html5Audio.play();
        if (sessionId !== this.playSessionId || this.isPausedByUser) {
          this.html5Audio.pause();
          return;
        }
        this.isLoadingTrack = false;
        this.isPlaying = true;
        this.duration =
          this.html5Audio.duration && !isNaN(this.html5Audio.duration)
            ? this.html5Audio.duration
            : track.durationSec || 180;
        this.startProgressTracker();
        this.emit();
        return;
      } catch {
        // Fall through to clean stop state
      }
    }

    // No playable stream succeeded: stop vinyl & lift tonearm cleanly instead of faking playback
    if (sessionId === this.playSessionId) {
      this.isLoadingTrack = false;
      this.isPlaying = false;
      this.stopProgressTracker();
      this.emit();
    }
  }

  public subscribe(
    cb: (state: {
      isPlaying: boolean;
      currentTime: number;
      duration: number;
      track: SongTrack | null;
      isShuffle: boolean;
      isRepeat: boolean;
    }) => void
  ) {
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

  private normalizePresetTrack(track: SongTrack): SongTrack {
    const byId = PRESET_SONGS.find((p) => p.id === track.id);
    if (byId) {
      return { ...byId };
    }
    const trackKey = `${foldTurkish(track.name)}::${foldTurkish(track.artist)}`;
    const byMeta = PRESET_SONGS.find(
      (p) => `${foldTurkish(p.name)}::${foldTurkish(p.artist)}` === trackKey
    );
    if (byMeta) {
      return { ...track, youtubeId: byMeta.youtubeId, albumCover: track.albumCover || byMeta.albumCover };
    }
    if (track.youtubeId && KNOWN_INVALID_YOUTUBE_IDS.has(track.youtubeId)) {
      return { ...track, youtubeId: '' };
    }
    return { ...track };
  }

  private lookupCatalogVideoId(track: SongTrack): string | null {
    const cleanTitle = foldTurkish(stripTrackNoise(track.name));
    const cleanArtist = foldTurkish(track.artist);
    const fullName = foldTurkish(track.name);

    const candidates = [
      `${cleanTitle} ${cleanArtist}`.trim(),
      `${cleanArtist} ${cleanTitle}`.trim(),
      `${fullName} ${cleanArtist}`.trim(),
      `${cleanArtist} ${fullName}`.trim(),
    ];

    for (const key of candidates) {
      if (key && CLIENT_TRACK_CATALOG[key]) {
        return CLIENT_TRACK_CATALOG[key];
      }
    }
    return null;
  }

  private loadYouTubeVideo(track: SongTrack, vid: string, sessionId: number) {
    if (sessionId !== this.playSessionId || this.isPausedByUser) return;

    if (!this.player || !this.player.loadVideoById) {
      this.pendingTrack = { track: { ...track, youtubeId: vid }, sessionId };
      this.emit();
      return;
    }

    try {
      this.activeEngine = 'youtube';
      this.expectedVideoId = vid;
      this.isLoadingTrack = true;
      this.trackLoadStartedAt = Date.now();
      if (this.html5Audio) {
        try {
          this.html5Audio.pause();
        } catch {}
      }
      try {
        this.player.setVolume?.(100);
      } catch {}
      this.player.loadVideoById({
        videoId: vid,
        startSeconds: 0,
      });
      this.player.playVideo();
    } catch {
      this.fallbackToHtml5Audio(track, sessionId);
      return;
    }

    // Safety fallback: only if YouTube completely stalled after 8s
    this.safetyTimer = window.setTimeout(() => {
      if (
        sessionId === this.playSessionId &&
        !this.isPausedByUser &&
        this.isLoadingTrack &&
        this.activeEngine === 'youtube'
      ) {
        const state = this.player?.getPlayerState ? this.player.getPlayerState() : -1;
        if (state !== 1 && state !== 3 && state !== 5) {
          this.fallbackToHtml5Audio(track, sessionId);
        }
      }
    }, 8000);
  }

  public async play(rawTrack: SongTrack) {
    const sessionId = ++this.playSessionId;
    const track = this.normalizePresetTrack(rawTrack);

    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    this.stopProgressTracker();

    // Stop any previous playback immediately so outgoing audio never bleeds into the new track
    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch {}
    }
    if (this.html5Audio) {
      try {
        this.html5Audio.pause();
      } catch {}
    }

    this.prevTrack = this.currentTrack;
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.durationSec || 180;
    this.isPausedByUser = false;
    this.isLoadingTrack = true;
    this.expectedVideoId = null;
    this.trackLoadStartedAt = Date.now();
    this.isPlaying = true;
    this.emit();

    let vid = track.youtubeId || null;
    const cacheKey = foldTurkish(`${track.name}::${track.artist}`);

    if (!vid) {
      const cached = this.resolvedVideoCache.get(cacheKey);
      if (cached) {
        vid = cached.videoId || null;
        if (cached.audioUrl && !track.audioUrl) {
          track.audioUrl = cached.audioUrl;
        }
      }
    }

    if (!vid) {
      vid = this.lookupCatalogVideoId(track);
    }

    // Resolve via backend API with both title and artist for strict matching
    if (!vid) {
      try {
        const cleanTitle = stripTrackNoise(track.name);
        const query = `${cleanTitle || track.name} ${track.artist}`.trim();
        const params = new URLSearchParams({
          q: query,
          title: track.name,
          artist: track.artist,
        });
        const res = await fetch(`/api/resolve-track?${params.toString()}`);
        if (sessionId !== this.playSessionId || this.isPausedByUser) return;

        if (res.ok) {
          const data = await res.json();
          if (data?.videoId) {
            vid = data.videoId;
          }
          if (data?.audioUrl && !track.audioUrl) {
            track.audioUrl = data.audioUrl;
          }
          if (vid || track.audioUrl) {
            this.resolvedVideoCache.set(cacheKey, {
              videoId: vid || null,
              audioUrl: track.audioUrl || null,
            });
          }
        }
      } catch {
        // Network error -> fall through to HTML5 fallback
      }
    }

    if (sessionId !== this.playSessionId || this.isPausedByUser) return;

    if (!vid) {
      await this.fallbackToHtml5Audio(track, sessionId);
      return;
    }

    this.loadYouTubeVideo(track, vid, sessionId);
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.isPausedByUser = true;
    this.isPlaying = false;
    this.stopProgressTracker();
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }

    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch {}
    }
    if (this.html5Audio) {
      try {
        this.html5Audio.pause();
      } catch {}
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

    this.isPausedByUser = false;

    if (this.activeEngine === 'youtube') {
      if (!this.expectedVideoId && !this.isLoadingTrack) {
        // Track previously failed or never loaded a YouTube video -> re-run full play
        this.play(this.currentTrack);
        return;
      }
      if (this.player && this.player.playVideo) {
        this.isPlaying = true;
        try {
          const state = this.player.getPlayerState?.();
          if (state === 0 && this.currentTime === 0 && this.player.seekTo) {
            this.player.seekTo(0, true);
          }
          this.player.playVideo();
        } catch {}
        this.startProgressTracker();
        this.emit();
        return;
      }
    } else if (this.activeEngine === 'html5' && this.html5Audio && this.html5Audio.src) {
      this.isPlaying = true;
      this.html5Audio.play().catch(() => {
        this.isPlaying = false;
        this.stopProgressTracker();
        this.emit();
      });
      this.startProgressTracker();
      this.emit();
      return;
    }

    this.play(this.currentTrack);
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(this.duration || 180, seconds));
    if (this.currentTrack && clamped < this.currentTime - 4) {
      recordImplicitSignal(this.currentTrack, 'rewind');
    }
    this.currentTime = clamped;

    if (this.activeEngine === 'youtube' && this.player && this.player.seekTo && !this.isLoadingTrack) {
      try {
        this.player.seekTo(clamped, true);
      } catch {}
    }
    if (this.activeEngine === 'html5' && this.html5Audio && this.html5Audio.src) {
      try {
        this.html5Audio.currentTime = clamped;
      } catch {}
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
      if (!this.isPlaying || this.isLoadingTrack) return;

      if (this.activeEngine === 'youtube') {
        const state = this.player?.getPlayerState?.();
        if (state !== 1) return; // Never read stale currentTime while buffering/unstarted/transitioning

        const loadedVideoId = this.player?.getVideoData?.()?.video_id;
        if (this.expectedVideoId && loadedVideoId && loadedVideoId !== this.expectedVideoId) {
          return;
        }

        try {
          const t = this.player.getCurrentTime();
          const d = this.player.getDuration();
          if (typeof t === 'number' && !isNaN(t) && t >= 0) {
            this.currentTime = t;
          }
          if (typeof d === 'number' && !isNaN(d) && d > 0) {
            this.duration = d;
          }
        } catch {}
      } else if (this.activeEngine === 'html5' && this.html5Audio) {
        this.currentTime = this.html5Audio.currentTime;
        if (this.html5Audio.duration && !isNaN(this.html5Audio.duration)) {
          this.duration = this.html5Audio.duration;
        }
      }

      if (
        !this.isLoadingTrack &&
        this.duration > 5 &&
        this.currentTime >= 2 &&
        this.currentTime >= this.duration - 0.25
      ) {
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
