export type AcousticSpaceId = 'pure' | 'studio' | 'concert' | 'car';
export type OrbitMode = 'auto' | 'manual';
export type OrbitSpeed = 'slow' | 'balanced' | 'fast';

export interface SpatialAudioState {
  spatialEnabled: boolean;
  orbitMode: OrbitMode;
  orbitSpeed: OrbitSpeed;
  azimuthDeg: number; // -180 .. 180 (0 = front, 90 = right, -90 = left, ±180 = behind)
  elevationDeg: number; // -45 .. 65
  acousticSpace: AcousticSpaceId;
  hasRealDsp: boolean;
}

export interface AudioTelemetry {
  bass: number; // 0..1
  mid: number; // 0..1
  high: number; // 0..1
  energy: number; // 0..1
  azimuthDeg: number;
  elevationDeg: number;
  isRealFft: boolean;
}

type StateListener = (state: SpatialAudioState) => void;
type TelemetryListener = (telemetry: AudioTelemetry) => void;

const SPEED_DEG_PER_SEC: Record<OrbitSpeed, number> = {
  slow: 28,
  balanced: 46,
  fast: 78,
};

class SpatialAudioProcessor {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;

  private lowFilter: BiquadFilterNode | null = null;
  private highFilter: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private panner: PannerNode | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  private impulseCache = new Map<AcousticSpaceId, AudioBuffer>();

  private state: SpatialAudioState = {
    spatialEnabled: false,
    orbitMode: 'auto',
    orbitSpeed: 'balanced',
    azimuthDeg: 0,
    elevationDeg: 10,
    acousticSpace: 'pure',
    hasRealDsp: false,
  };

  private telemetry: AudioTelemetry = {
    bass: 0,
    mid: 0,
    high: 0,
    energy: 0,
    azimuthDeg: 0,
    elevationDeg: 10,
    isRealFft: false,
  };

  private stateListeners = new Set<StateListener>();
  private telemetryListeners = new Set<TelemetryListener>();
  private rafId: number | null = null;
  private lastTickTime = 0;
  private isPlayingAudio = false;
  private isHtml5Active = false;

  public getState(): SpatialAudioState {
    return { ...this.state };
  }

  public getTelemetry(): AudioTelemetry {
    return { ...this.telemetry };
  }

  public subscribeState(cb: StateListener) {
    this.stateListeners.add(cb);
    cb(this.getState());
    return () => {
      this.stateListeners.delete(cb);
    };
  }

  public subscribeTelemetry(cb: TelemetryListener) {
    this.telemetryListeners.add(cb);
    cb(this.getTelemetry());
    return () => {
      this.telemetryListeners.delete(cb);
    };
  }

  private emitState() {
    const snap = this.getState();
    this.stateListeners.forEach((cb) => cb(snap));
  }

  private emitTelemetry() {
    const snap = this.getTelemetry();
    this.telemetryListeners.forEach((cb) => cb(snap));
  }

  public attachAudioElement(audioEl: HTMLAudioElement) {
    if (typeof window === 'undefined') return;
    if (this.attachedElement === audioEl && this.sourceNode) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (!this.sourceNode) {
        this.sourceNode = this.ctx.createMediaElementSource(audioEl);
        this.attachedElement = audioEl;

        this.lowFilter = this.ctx.createBiquadFilter();
        this.lowFilter.type = 'lowshelf';
        this.lowFilter.frequency.value = 135;

        this.highFilter = this.ctx.createBiquadFilter();
        this.highFilter.type = 'lowpass';
        this.highFilter.frequency.value = 20000;

        this.dryGain = this.ctx.createGain();
        this.wetGain = this.ctx.createGain();
        this.convolver = this.ctx.createConvolver();

        this.panner = this.ctx.createPanner();
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
        this.panner.refDistance = 1;
        this.panner.maxDistance = 10;
        this.panner.rolloffFactor = 0.9;
        this.panner.coneInnerAngle = 360;
        this.panner.coneOuterAngle = 360;

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.78;
        this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1;

        // Wire graph: source -> lowFilter -> highFilter -> [dryGain & convolver->wetGain] -> panner -> analyser -> masterGain -> destination
        this.sourceNode.connect(this.lowFilter);
        this.lowFilter.connect(this.highFilter);

        this.highFilter.connect(this.dryGain);
        this.highFilter.connect(this.convolver);
        this.convolver.connect(this.wetGain);

        this.dryGain.connect(this.panner);
        this.wetGain.connect(this.panner);

        this.panner.connect(this.analyser);
        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.state.hasRealDsp = true;
        this.applyAcousticSpace();
        this.applySpatialPosition();
        this.emitState();
      }
    } catch {
      this.state.hasRealDsp = false;
      this.emitState();
    }
  }

  public async resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignore
      }
    }
  }

  public setPlaybackStatus(isPlaying: boolean, isHtml5: boolean) {
    this.isPlayingAudio = isPlaying;
    this.isHtml5Active = isHtml5;
    if (isPlaying) {
      this.resumeContext();
      this.startLoop();
    } else {
      this.stopLoop();
      this.telemetry = {
        ...this.telemetry,
        bass: 0,
        mid: 0,
        high: 0,
        energy: 0,
      };
      this.emitTelemetry();
    }
  }

  public setSpatialEnabled(enabled: boolean) {
    this.state.spatialEnabled = enabled;
    if (!enabled) {
      this.state.azimuthDeg = 0;
      this.state.elevationDeg = 0;
    } else {
      this.state.elevationDeg = 12;
    }
    this.applySpatialPosition();
    this.applyAcousticSpace();
    this.emitState();
  }

  public toggleSpatial() {
    this.setSpatialEnabled(!this.state.spatialEnabled);
  }

  public setOrbitMode(mode: OrbitMode) {
    this.state.orbitMode = mode;
    this.emitState();
  }

  public setOrbitSpeed(speed: OrbitSpeed) {
    this.state.orbitSpeed = speed;
    this.emitState();
  }

  public setManualPosition(azimuthDeg: number, elevationDeg: number) {
    const wrappedAz = ((((azimuthDeg + 180) % 360) + 360) % 360) - 180;
    const clampedEl = Math.max(-45, Math.min(65, elevationDeg));
    this.state.azimuthDeg = wrappedAz;
    this.state.elevationDeg = clampedEl;
    if (!this.state.spatialEnabled) {
      this.state.spatialEnabled = true;
    }
    this.applySpatialPosition();
    this.emitState();
  }

  public setAcousticSpace(space: AcousticSpaceId) {
    this.state.acousticSpace = space;
    this.applyAcousticSpace();
    this.emitState();
  }

  private getOrCreateImpulse(space: AcousticSpaceId): AudioBuffer | null {
    if (!this.ctx || space === 'pure') return null;
    if (this.impulseCache.has(space)) {
      return this.impulseCache.get(space)!;
    }

    const rate = this.ctx.sampleRate;
    const duration = space === 'concert' ? 2.3 : space === 'studio' ? 0.65 : 0.38;
    const decay = space === 'concert' ? 2.4 : space === 'studio' ? 3.8 : 4.5;
    const length = Math.floor(rate * duration);
    const buffer = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        const white = (Math.random() * 2 - 1) * env;
        // Darker warm damping for car & studio
        const damp = space === 'car' ? 0.68 : space === 'studio' ? 0.42 : 0.25;
        prev = prev * damp + white * (1 - damp);
        data[i] = prev;
      }
    }

    this.impulseCache.set(space, buffer);
    return buffer;
  }

  private applyAcousticSpace() {
    if (!this.ctx || !this.lowFilter || !this.highFilter || !this.dryGain || !this.wetGain || !this.convolver) {
      return;
    }

    const now = this.ctx.currentTime;
    const space = this.state.acousticSpace;

    if (space === 'pure') {
      this.lowFilter.gain.setTargetAtTime(0, now, 0.08);
      this.highFilter.frequency.setTargetAtTime(20000, now, 0.08);
      this.dryGain.gain.setTargetAtTime(1.0, now, 0.08);
      this.wetGain.gain.setTargetAtTime(this.state.spatialEnabled ? 0.14 : 0, now, 0.08);
      if (this.state.spatialEnabled) {
        const ir = this.getOrCreateImpulse('studio');
        if (ir) this.convolver.buffer = ir;
      }
      return;
    }

    const ir = this.getOrCreateImpulse(space);
    if (ir) {
      this.convolver.buffer = ir;
    }

    if (space === 'studio') {
      this.lowFilter.gain.setTargetAtTime(2.5, now, 0.08);
      this.highFilter.frequency.setTargetAtTime(16500, now, 0.08);
      this.dryGain.gain.setTargetAtTime(0.86, now, 0.08);
      this.wetGain.gain.setTargetAtTime(0.28, now, 0.08);
    } else if (space === 'concert') {
      this.lowFilter.gain.setTargetAtTime(4.0, now, 0.08);
      this.highFilter.frequency.setTargetAtTime(14500, now, 0.08);
      this.dryGain.gain.setTargetAtTime(0.72, now, 0.08);
      this.wetGain.gain.setTargetAtTime(0.56, now, 0.08);
    } else if (space === 'car') {
      this.lowFilter.gain.setTargetAtTime(7.5, now, 0.08);
      this.highFilter.frequency.setTargetAtTime(7200, now, 0.08);
      this.dryGain.gain.setTargetAtTime(0.88, now, 0.08);
      this.wetGain.gain.setTargetAtTime(0.24, now, 0.08);
    }
  }

  private applySpatialPosition() {
    if (!this.ctx || !this.panner) return;
    const now = this.ctx.currentTime;

    if (!this.state.spatialEnabled) {
      this.panner.positionX.setTargetAtTime(0, now, 0.06);
      this.panner.positionY.setTargetAtTime(0, now, 0.06);
      this.panner.positionZ.setTargetAtTime(-0.5, now, 0.06);
      return;
    }

    const azRad = (this.state.azimuthDeg * Math.PI) / 180;
    const elRad = (this.state.elevationDeg * Math.PI) / 180;
    const radius = 2.1;

    // Web Audio coords: +X right, +Y up, -Z forward
    const x = radius * Math.cos(elRad) * Math.sin(azRad);
    const y = radius * Math.sin(elRad);
    const z = -radius * Math.cos(elRad) * Math.cos(azRad);

    this.panner.positionX.setTargetAtTime(x, now, 0.04);
    this.panner.positionY.setTargetAtTime(y, now, 0.04);
    this.panner.positionZ.setTargetAtTime(z, now, 0.04);
  }

  private startLoop() {
    if (this.rafId !== null) return;
    this.lastTickTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - this.lastTickTime) / 1000);
      this.lastTickTime = now;

      if (this.isPlayingAudio) {
        // Update 8D orbit angle smoothly if enabled & auto
        if (this.state.spatialEnabled && this.state.orbitMode === 'auto') {
          const degPerSec = SPEED_DEG_PER_SEC[this.state.orbitSpeed];
          const nextAz = this.state.azimuthDeg + degPerSec * dt;
          this.state.azimuthDeg = nextAz > 180 ? nextAz - 360 : nextAz;
          this.state.elevationDeg = Math.sin((this.state.azimuthDeg * Math.PI) / 180) * 14 + 6;
          this.applySpatialPosition();
        }

        // Read real FFT data if HTML5 Web Audio DSP is active & producing signal
        let bass = 0;
        let mid = 0;
        let high = 0;
        let isRealFft = false;

        if (this.analyser && this.freqData && this.isHtml5Active) {
          this.analyser.getByteFrequencyData(this.freqData);
          const len = this.freqData.length;
          if (len > 0) {
            let bSum = 0;
            let mSum = 0;
            let hSum = 0;
            const bEnd = Math.max(4, Math.floor(len * 0.14));
            const mEnd = Math.max(bEnd + 4, Math.floor(len * 0.48));

            for (let i = 0; i < bEnd; i++) bSum += this.freqData[i];
            for (let i = bEnd; i < mEnd; i++) mSum += this.freqData[i];
            for (let i = mEnd; i < len; i++) hSum += this.freqData[i];

            bass = bSum / (bEnd * 255);
            mid = mSum / ((mEnd - bEnd) * 255);
            high = hSum / ((len - mEnd) * 255);
            if (bass + mid + high > 0.015) {
              isRealFft = true;
            }
          }
        }

        // Smooth organic fallback if stream is still buffering or playing via cross-origin YouTube iframe
        if (!isRealFft) {
          const t = now * 0.001;
          const beat = Math.pow(0.5 + 0.5 * Math.sin(t * 4.1), 3.2);
          bass = 0.22 + beat * 0.42 + Math.sin(t * 1.7) * 0.08;
          mid = 0.18 + Math.abs(Math.sin(t * 2.9)) * 0.28;
          high = 0.12 + Math.abs(Math.cos(t * 5.3)) * 0.22;
        }

        const energy = Math.min(1, bass * 0.55 + mid * 0.3 + high * 0.15);

        this.telemetry = {
          bass: Math.min(1, Math.max(0, bass)),
          mid: Math.min(1, Math.max(0, mid)),
          high: Math.min(1, Math.max(0, high)),
          energy,
          azimuthDeg: this.state.azimuthDeg,
          elevationDeg: this.state.elevationDeg,
          isRealFft,
        };
        this.emitTelemetry();
      }

      if (this.isPlayingAudio) {
        this.rafId = window.requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = window.requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const spatialAudioProcessor = new SpatialAudioProcessor();
