import React, { useEffect, useRef, useCallback } from 'react';

interface LiveRainBackgroundProps {
  isActive: boolean;
}

export const LiveRainBackground: React.FC<LiveRainBackgroundProps> = ({ isActive }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);

  // Send player commands to embedded ambient stream
  const sendPlayerCommand = useCallback((func: string, args: unknown[] = []) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch {
      // Cross-origin safe ignore
    }
  }, []);

  // Force maximum 1080p visual sharpness & unmuted rain sound
  const enforceMaximumQualityAndAudio = useCallback(() => {
    // 1. Quality enforcement (1080p HD / highest available bitrate)
    sendPlayerCommand('setPlaybackQuality', ['hd1080']);
    sendPlayerCommand('setPlaybackQuality', ['highres']);

    // 2. Audio enforcement: Rain sound must always be active and audible
    sendPlayerCommand('unMute');
    sendPlayerCommand('setVolume', [100]);
    sendPlayerCommand('playVideo');

    if (playerRef.current) {
      try {
        if (typeof playerRef.current.setPlaybackQuality === 'function') {
          playerRef.current.setPlaybackQuality('hd1080');
        }
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(100);
        }
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch {
        // Safe catch
      }
    }
  }, [sendPlayerCommand]);

  // Load YouTube IFrame API to control bitrate quality and continuous sound
  useEffect(() => {
    if (!isActive) return;

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }

    const initPlayer = () => {
      if (!window.YT?.Player || !iframeRef.current) return;
      try {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: (event: any) => {
              try {
                event.target.setPlaybackQuality('hd1080');
                event.target.unMute();
                event.target.setVolume(100);
                event.target.playVideo();
              } catch {
                // Ignore
              }
            },
            onPlaybackQualityChange: (event: any) => {
              if (event.data !== 'hd1080' && event.data !== 'highres') {
                try {
                  event.target.setPlaybackQuality('hd1080');
                } catch {
                  // Ignore
                }
              }
            },
            onStateChange: (event: any) => {
              // Whenever playing starts or changes, re-enforce 1080p and unmuted audio
              if (event.data === 1 /* PLAYING */) {
                try {
                  event.target.setPlaybackQuality('hd1080');
                  event.target.unMute();
                  event.target.setVolume(100);
                } catch {
                  // Ignore
                }
              }
            },
          },
        });
      } catch {
        // Fallback to postMessage
      }
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore
        }
        playerRef.current = null;
      }
    };
  }, [isActive]);

  // Continuous sound and quality sync:
  // Runs immediately and after short intervals when stream connection stabilizes
  useEffect(() => {
    if (!isActive) return;

    enforceMaximumQualityAndAudio();

    const t1 = setTimeout(enforceMaximumQualityAndAudio, 1000);
    const t2 = setTimeout(enforceMaximumQualityAndAudio, 2500);
    const t3 = setTimeout(enforceMaximumQualityAndAudio, 4500);
    const t4 = setTimeout(enforceMaximumQualityAndAudio, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isActive, enforceMaximumQualityAndAudio]);

  // Browser Autoplay Audio Policy:
  // Browsers require a user gesture if the tab had no prior interaction.
  // Rain audio immediately starts unmuted on the very first user click, touch, or key.
  useEffect(() => {
    if (!isActive) return;

    const handleFirstGesture = () => {
      enforceMaximumQualityAndAudio();
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [isActive, enforceMaximumQualityAndAudio]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-1000 opacity-100"
      aria-hidden="true"
    >
      {/* 
        Native Ultra-Crisp Viewport Container:
        Using direct viewport dimensioning (+160px width, +90px height) rather than CSS `scale()`.
        This forces YouTube to allocate a true 1080p/highres texture buffer, preventing bilinear blur
        while flawlessly clipping all player borders and branding.
      */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <iframe
          ref={iframeRef}
          id="live-rain-iframe"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 'calc(max(100vw, 177.78vh) + 160px)',
            height: 'calc(max(100vh, 56.25vw) + 90px)',
            transform: 'translate(-50%, -50%) translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            border: 0,
            pointerEvents: 'none',
          }}
          src="https://www.youtube-nocookie.com/embed/vYIYIVmOo3Q?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=vYIYIVmOo3Q&playsinline=1&enablejsapi=1&vq=hd1080&hd=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
          title="Canlı Yağmurlu Şehir Ambiyansı"
        />
      </div>

      {/* 
        Cinematic High-Definition Vignette:
        Clear, vibrant and luminous so every rain droplet and cozy window shines sharp,
        while maintaining perfect contrast and readability for the countdown numbers.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
    </div>
  );
};
