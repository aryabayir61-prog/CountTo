// Real-time Web Audio API acoustic clap transient detector & Turkish voice command controller

export type ClapSensitivity = 'high' | 'medium' | 'low';

export type DoubleClapAction = 'fullscreen' | 'celebrate' | 'pause';

export type VoiceCommandType =
  | 'clap'
  | 'celebrate'
  | 'fullscreen'
  | 'pause'
  | 'resume'
  | 'milliseconds';

export interface ClapDetectorCallbacks {
  onSingleClap: () => void;
  onDoubleClap: () => void;
  onLevelChange?: (level: number, isTriggered: boolean) => void;
  onVoiceCommand?: (command: VoiceCommandType, rawTranscript: string) => void;
  onError?: (errorMessage: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

const SENSITIVITY_PARAMS: Record<
  ClapSensitivity,
  { minRms: number; spikeRatio: number; minPeak: number; minHighBandRatio: number }
> = {
  high: {
    minRms: 0.04,
    spikeRatio: 2.5,
    minPeak: 0.13,
    minHighBandRatio: 0.55,
  },
  medium: {
    minRms: 0.068,
    spikeRatio: 3.1,
    minPeak: 0.21,
    minHighBandRatio: 0.65,
  },
  low: {
    minRms: 0.12,
    spikeRatio: 3.9,
    minPeak: 0.34,
    minHighBandRatio: 0.72,
  },
};

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export class ClapAndVoiceController {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private rafId: number | null = null;
  private isRunning = false;

  private sensitivity: ClapSensitivity = 'medium';
  private voiceEnabled = false;
  private recognition: SpeechRecognitionLike | null = null;

  private noiseFloor = 0.015;
  private lastClapImpulseAt = 0;
  private pendingSingleClapTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTriggeredVisualUntil = 0;

  private callbacks: ClapDetectorCallbacks;

  constructor(callbacks: ClapDetectorCallbacks) {
    this.callbacks = callbacks;
  }

  public updateCallbacks(callbacks: ClapDetectorCallbacks) {
    this.callbacks = callbacks;
  }

  public setSensitivity(sensitivity: ClapSensitivity) {
    this.sensitivity = sensitivity;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!this.isRunning) return;
    if (enabled) {
      this.startSpeechRecognition();
    } else {
      this.stopSpeechRecognition();
    }
  }

  public getActive(): boolean {
    return this.isRunning;
  }

  public async start(sensitivity: ClapSensitivity, voiceEnabled: boolean): Promise<boolean> {
    this.sensitivity = sensitivity;
    this.voiceEnabled = voiceEnabled;

    if (this.isRunning) {
      if (voiceEnabled) {
        this.startSpeechRecognition();
      } else {
        this.stopSpeechRecognition();
      }
      return true;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      this.callbacks.onError?.(
        'Tarayıcınız mikrofon erişimini desteklemiyor veya güvenli bağlantı (HTTPS) gerekiyor.'
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.18;

      source.connect(analyser);

      this.mediaStream = stream;
      this.audioCtx = ctx;
      this.analyser = analyser;
      this.noiseFloor = 0.015;
      this.lastClapImpulseAt = 0;
      this.isRunning = true;

      this.callbacks.onStateChange?.(true);
      this.runAnalysisLoop();

      if (this.voiceEnabled) {
        this.startSpeechRecognition();
      }

      return true;
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Mikrofon izni reddedildi. Tarayıcı adres çubuğundan mikrofon izni verebilirsiniz.'
          : 'Mikrofon başlatılamadı. Lütfen bağlı bir mikrofon olduğundan emin olun.';
      this.callbacks.onError?.(message);
      this.stop();
      return false;
    }
  }

  private runAnalysisLoop = () => {
    if (!this.isRunning || !this.analyser || !this.audioCtx) return;

    const timeData = new Float32Array(this.analyser.fftSize);
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    const sampleRate = this.audioCtx.sampleRate || 48000;
    const binHz = sampleRate / this.analyser.fftSize;

    // Bin ranges for transient clap detection (~900Hz - 5200Hz vs sub-bass < 350Hz)
    const lowEndBin = Math.max(2, Math.floor(350 / binHz));
    const clapStartBin = Math.max(lowEndBin + 1, Math.floor(900 / binHz));
    const clapEndBin = Math.min(freqData.length - 1, Math.floor(5200 / binHz));

    const tick = () => {
      if (!this.isRunning || !this.analyser) return;

      this.analyser.getFloatTimeDomainData(timeData);
      this.analyser.getByteFrequencyData(freqData);

      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < timeData.length; i++) {
        const s = timeData[i];
        const abs = Math.abs(s);
        if (abs > peak) peak = abs;
        sumSquares += s * s;
      }

      const rms = Math.sqrt(sumSquares / timeData.length);
      const params = SENSITIVITY_PARAMS[this.sensitivity];

      // Compute average spectral energy in clap frequency band vs low rumble band
      let clapBandSum = 0;
      let clapBandCount = 0;
      for (let b = clapStartBin; b <= clapEndBin; b++) {
        clapBandSum += freqData[b];
        clapBandCount++;
      }
      const clapBandAvg = clapBandCount > 0 ? clapBandSum / clapBandCount : 0;

      let lowBandSum = 0;
      let lowBandCount = 0;
      for (let b = 1; b <= lowEndBin; b++) {
        lowBandSum += freqData[b];
        lowBandCount++;
      }
      const lowBandAvg = lowBandCount > 0 ? lowBandSum / lowBandCount : 0;

      const highToLowRatio = clapBandAvg / Math.max(12, lowBandAvg);
      const crestFactor = peak / Math.max(0.002, rms);

      const now = performance.now();
      const dynamicThreshold = Math.max(params.minRms, this.noiseFloor * params.spikeRatio);

      // Update slow adaptive noise floor only during non-spike frames
      if (rms < dynamicThreshold * 0.85) {
        this.noiseFloor = this.noiseFloor * 0.96 + rms * 0.04;
      }

      const isSharpTransient =
        rms >= dynamicThreshold &&
        peak >= params.minPeak &&
        crestFactor >= 2.35 &&
        highToLowRatio >= params.minHighBandRatio;

      if (isSharpTransient && now - this.lastClapImpulseAt > 140) {
        this.lastClapImpulseAt = now;
        this.lastTriggeredVisualUntil = now + 260;
        this.handleDetectedClapImpulse();
      }

      const normalizedLevel = Math.min(1, rms / Math.max(0.18, params.minRms * 3.2));
      this.callbacks.onLevelChange?.(normalizedLevel, now < this.lastTriggeredVisualUntil);

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  };

  private handleDetectedClapImpulse() {
    if (this.pendingSingleClapTimer) {
      clearTimeout(this.pendingSingleClapTimer);
      this.pendingSingleClapTimer = null;
      this.callbacks.onDoubleClap();
      return;
    }

    this.pendingSingleClapTimer = setTimeout(() => {
      this.pendingSingleClapTimer = null;
      this.callbacks.onSingleClap();
    }, 360);
  }

  private startSpeechRecognition() {
    if (this.recognition || !isSpeechRecognitionSupported()) return;

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
      const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!RecognitionCtor) return;

      const recognition = new RecognitionCtor();
      recognition.lang = 'tr-TR';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result.isFinal) continue;
          const transcript = (result[0]?.transcript || '').toLocaleLowerCase('tr-TR').trim();
          if (!transcript) continue;

          if (
            transcript.includes('alkış') ||
            transcript.includes('bravo') ||
            transcript.includes('harika')
          ) {
            this.callbacks.onVoiceCommand?.('clap', transcript);
          } else if (transcript.includes('konfeti') || transcript.includes('kutla')) {
            this.callbacks.onVoiceCommand?.('celebrate', transcript);
          } else if (transcript.includes('tam ekran') || transcript.includes('büyüt')) {
            this.callbacks.onVoiceCommand?.('fullscreen', transcript);
          } else if (
            transcript.includes('durdur') ||
            transcript.includes('beklet') ||
            transcript === 'dur'
          ) {
            this.callbacks.onVoiceCommand?.('pause', transcript);
          } else if (
            transcript.includes('başlat') ||
            transcript.includes('devam') ||
            transcript.includes('sürdür')
          ) {
            this.callbacks.onVoiceCommand?.('resume', transcript);
          } else if (transcript.includes('salise')) {
            this.callbacks.onVoiceCommand?.('milliseconds', transcript);
          }
        }
      };

      recognition.onerror = () => {
        // Ignore transient speech recognition no-speech events
      };

      recognition.onend = () => {
        if (this.isRunning && this.voiceEnabled && this.recognition) {
          try {
            this.recognition.start();
          } catch {
            // Ignore restart race
          }
        }
      };

      recognition.start();
      this.recognition = recognition;
    } catch {
      // Speech recognition unavailable or blocked
    }
  }

  private stopSpeechRecognition() {
    if (this.recognition) {
      const rec = this.recognition;
      this.recognition = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        // Ignore
      }
    }
  }

  public stop() {
    this.isRunning = false;
    this.stopSpeechRecognition();

    if (this.pendingSingleClapTimer) {
      clearTimeout(this.pendingSingleClapTimer);
      this.pendingSingleClapTimer = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      const ctx = this.audioCtx;
      this.audioCtx = null;
      ctx.close().catch(() => {});
    }

    this.analyser = null;
    this.callbacks.onLevelChange?.(0, false);
    this.callbacks.onStateChange?.(false);
  }
}
