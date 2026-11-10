import { CountdownEvent, ThemeConfig, TimeRemaining } from '../types/countdown';
import { formatLocaleDate } from './time';

type PiPChangeListener = (isActive: boolean) => void;

class PiPService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private isPiPActive: boolean = false;
  private listeners: Set<PiPChangeListener> = new Set();
  private docPiPWindow: Window | null = null;

  // Cached state for canvas drawing
  private currentEvent: CountdownEvent | null = null;
  private currentTime: TimeRemaining | null = null;
  private currentTheme: ThemeConfig | null = null;
  private showMilliseconds: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initCanvasAndVideo();
    }
  }

  private initCanvasAndVideo() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 360;
    this.ctx = this.canvas.getContext('2d');

    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.autoplay = true;
    this.video.style.position = 'fixed';
    this.video.style.top = '-9999px';
    this.video.style.left = '-9999px';
    this.video.style.opacity = '0';
    this.video.style.pointerEvents = 'none';
    this.video.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.video);

    this.video.addEventListener('leavepictureinpicture', () => {
      this.isPiPActive = false;
      this.notifyListeners(false);
      this.stopRenderLoop();
    });
  }

  public subscribe(listener: PiPChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.isPiPActive);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isActive: boolean) {
    this.isPiPActive = isActive;
    this.listeners.forEach((l) => l(isActive));
  }

  public getIsActive(): boolean {
    return this.isPiPActive;
  }

  public updateState(
    event: CountdownEvent,
    time: TimeRemaining,
    theme: ThemeConfig,
    showMilliseconds = false
  ) {
    this.currentEvent = event;
    this.currentTime = time;
    this.currentTheme = theme;
    this.showMilliseconds = showMilliseconds;

    // If Document PiP is open, update DOM content
    if (this.docPiPWindow && !this.docPiPWindow.closed) {
      this.updateDocPiPWindow();
    }
  }

  private drawCanvasFrame() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const theme = this.currentTheme || { primary: '#06b6d4', secondary: '#3b82f6', bgGradient: '#0a0d14', glow: 'rgba(6,182,212,0.4)', id: 'aurora', name: 'Aurora', cardBg: '#111827', cardBorder: '#1f2937', textAccent: '#06b6d4', numberColor: '#fff', labelColor: '#94a3b8', ringColor: '#06b6d4' };
    const defaultEvent: CountdownEvent = {
      id: 'pip-default',
      title: 'CountTo · Canlı Sayaç',
      targetDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      style: 'countTo',
      theme: 'aurora'
    };
    const defaultTime: TimeRemaining = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      totalMs: 0,
      isPast: false,
      progressPercent: 0
    };
    const event = this.currentEvent || defaultEvent;
    const time = this.currentTime || defaultTime;

    // Background: Deep obsidian glass
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, w, h);

    // Subtle atmospheric ambient radial glow
    const radial = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.5);
    radial.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    radial.addColorStop(0.6, 'rgba(8, 10, 15, 0.95)');
    radial.addColorStop(1, '#05070a');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    // Glowing border frame
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.globalAlpha = 1;

    // Top Header: Live pulsing indicator & Title
    ctx.beginPath();
    ctx.arc(42, 46, 5, 0, Math.PI * 2);
    ctx.fillStyle = theme.primary;
    ctx.fill();

    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Truncate title if long
    let titleText = event.title || 'CountTo · Canlı Zaman';
    if (ctx.measureText(titleText).width > 420) {
      while (ctx.measureText(titleText + '...').width > 420 && titleText.length > 5) {
        titleText = titleText.slice(0, -1);
      }
      titleText += '...';
    }
    ctx.fillText(titleText, 58, 46);

    // Brand tag on top right
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme.primary;
    ctx.textAlign = 'right';
    ctx.fillText('CountTo PiP', w - 32, 46);

    // Middle: Big Numbers
    const isClock = event.id === 'preset-current-time';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (time.isPast && !isClock) {
      ctx.font = '900 44px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = theme.primary;
      ctx.fillText('ZAMAN DOLDU 🎉', w / 2, h / 2 + 10);
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Etkinlik Tamamlandı', w / 2, h / 2 + 65);
    } else if (isClock) {
      // Live Clock Display: HH : MM : SS
      const hStr = String(time.hours).padStart(2, '0');
      const mStr = String(time.minutes).padStart(2, '0');
      const sStr = String(time.seconds).padStart(2, '0');

      ctx.font = '900 78px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      
      const timeStr = `${hStr}:${mStr}:${sStr}`;
      ctx.fillText(timeStr, w / 2, h / 2 + 10);

      // Subtitle: Today's date
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const todayStr = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());
      ctx.fillText(todayStr, w / 2, h / 2 + 76);
    } else {
      // Countdown Display
      const hasDays = (time.days || 0) > 0;
      ctx.font = '900 66px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.fillStyle = '#ffffff';

      let digits = '';
      if (hasDays) {
        digits = `${time.days}g ${String(time.hours).padStart(2, '0')}s ${String(time.minutes).padStart(2, '0')}d ${String(time.seconds).padStart(2, '0')}`;
      } else {
        digits = `${String(time.hours).padStart(2, '0')} : ${String(time.minutes).padStart(2, '0')} : ${String(time.seconds).padStart(2, '0')}`;
      }
      ctx.fillText(digits, w / 2, h / 2 + 8);

      // Target date subtitle
      ctx.font = '17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const targetStr = event.targetDate ? formatLocaleDate(event.targetDate) : 'Hedef Zaman';
      ctx.fillText(`Hedef: ${targetStr}`, w / 2, h / 2 + 74);
    }

    // Bottom subtle indicator bar
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(32, h - 24, w - 64, 4);
    ctx.fillStyle = theme.primary;
    const progressWidth = ((Date.now() % 1000) / 1000) * (w - 64);
    ctx.fillRect(32, h - 24, progressWidth, 4);
  }

  private startRenderLoop() {
    this.stopRenderLoop();
    const render = () => {
      this.drawCanvasFrame();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private stopRenderLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateDocPiPWindow() {
    if (!this.docPiPWindow || this.docPiPWindow.closed) return;
    const time = this.currentTime;
    const event = this.currentEvent;
    const theme = this.currentTheme;
    if (!time || !event || !theme) return;

    const digitsEl = this.docPiPWindow.document.getElementById('pip-digits');
    const titleEl = this.docPiPWindow.document.getElementById('pip-title');
    const subtitleEl = this.docPiPWindow.document.getElementById('pip-subtitle');
    const container = this.docPiPWindow.document.getElementById('pip-container');

    if (container) {
      container.style.borderColor = theme.primary;
    }

    if (titleEl) {
      titleEl.textContent = event.title || 'CountTo';
    }

    if (digitsEl) {
      const isClock = event.id === 'preset-current-time';
      if (time.isPast && !isClock) {
        digitsEl.textContent = 'TAMAMLANDI 🎉';
      } else if (isClock) {
        digitsEl.textContent = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
      } else {
        const hasDays = (time.days || 0) > 0;
        if (hasDays) {
          digitsEl.textContent = `${time.days}g ${String(time.hours).padStart(2, '0')}s ${String(time.minutes).padStart(2, '0')}d ${String(time.seconds).padStart(2, '0')}`;
        } else {
          digitsEl.textContent = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
        }
      }
    }

    if (subtitleEl) {
      const isClock = event.id === 'preset-current-time';
      if (isClock) {
        subtitleEl.textContent = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());
      } else {
        subtitleEl.textContent = event.targetDate ? `Hedef: ${formatLocaleDate(event.targetDate)}` : 'CountTo';
      }
    }
  }

  public async togglePictureInPicture(
    event: CountdownEvent,
    time: TimeRemaining,
    theme: ThemeConfig,
    showMilliseconds = false
  ): Promise<boolean> {
    this.updateState(event, time, theme, showMilliseconds);

    // If currently active, close it
    if (this.isPiPActive) {
      await this.exitPictureInPicture();
      return false;
    }

    // Try modern Document Picture-in-Picture API first (Chrome 116+)
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const docPiP = (window as any).documentPictureInPicture;
        const pipWindow = await docPiP.requestWindow({
          width: 440,
          height: 190,
          disallowReturnToOpener: false,
        });

        this.docPiPWindow = pipWindow;

        // Copy styles to new window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = pipWindow.document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch {
            const link = pipWindow.document.createElement('link');
            if (styleSheet.href) {
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        // Set title
        pipWindow.document.title = `${event.title || 'CountTo'} · Yüzen Pencere`;

        // Render minimal, sleek dark HTML
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.padding = '0';
        pipWindow.document.body.style.backgroundColor = '#07090e';
        pipWindow.document.body.style.color = '#ffffff';
        pipWindow.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        pipWindow.document.body.style.overflow = 'hidden';
        pipWindow.document.body.style.userSelect = 'none';

        pipWindow.document.body.innerHTML = `
          <div id="pip-container" style="
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            padding: 16px 20px;
            background: radial-gradient(circle at 50% 20%, #111827 0%, #06080d 100%);
            border: 2px solid ${theme.primary};
            box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.primary}; box-shadow: 0 0 10px ${theme.primary};"></span>
                <span id="pip-title" style="font-size: 13px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
                  ${event.title || 'CountTo'}
                </span>
              </div>
              <span style="font-size: 11px; font-weight: 800; color: ${theme.primary}; letter-spacing: 0.5px;">CountTo PiP</span>
            </div>

            <div id="pip-digits" style="
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 38px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #ffffff;
              text-shadow: 0 2px 14px rgba(0,0,0,0.9);
              margin: 4px 0 6px 0;
            ">
              00:00:00
            </div>

            <div id="pip-subtitle" style="font-size: 11px; font-weight: 500; color: #94a3b8;">
              ${event.id === 'preset-current-time' ? 'Canlı Saat' : 'Geri Sayım'}
            </div>
          </div>
        `;

        this.updateDocPiPWindow();

        pipWindow.addEventListener('pagehide', () => {
          this.docPiPWindow = null;
          this.notifyListeners(false);
        });

        this.notifyListeners(true);
        return true;
      } catch {
        // Fallback to video canvas PiP
      }
    }

    // Standard Video Element PiP Fallback (Works on Safari, Firefox, Chrome)
    if (!this.canvas || !this.video) {
      this.initCanvasAndVideo();
    }

    if (!this.canvas || !this.video) return false;

    try {
      this.drawCanvasFrame();
      this.startRenderLoop();

      // Create stream if not attached
      if (!this.video.srcObject) {
        const stream = (this.canvas as any).captureStream ? (this.canvas as any).captureStream(30) : null;
        if (!stream) return false;
        this.video.srcObject = stream;
      }

      await this.video.play();

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }

      await this.video.requestPictureInPicture();
      this.notifyListeners(true);
      return true;
    } catch {
      this.stopRenderLoop();
      this.notifyListeners(false);
      return false;
    }
  }

  public async exitPictureInPicture(): Promise<void> {
    if (this.docPiPWindow && !this.docPiPWindow.closed) {
      try {
        this.docPiPWindow.close();
      } catch {
        // Ignore
      }
      this.docPiPWindow = null;
    }

    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // Ignore
      }
    }

    this.stopRenderLoop();
    this.notifyListeners(false);
  }
}

export const pipService = new PiPService();
