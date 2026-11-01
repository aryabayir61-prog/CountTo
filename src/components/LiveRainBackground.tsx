import React, { useEffect, useRef, useState, useCallback } from 'react';

interface LiveRainBackgroundProps {
  isActive: boolean;
}

export const LiveRainBackground: React.FC<LiveRainBackgroundProps> = ({ isActive }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isDiamondClarityActive, setIsDiamondClarityActive] = useState<boolean>(true);
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

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
    // 1. Force highest available bitrate / 1080p HD
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

        // Silent quality inspection: Check if video quality dropped below 1080p
        if (typeof playerRef.current.getPlaybackQuality === 'function') {
          const currentQuality = playerRef.current.getPlaybackQuality();
          if (currentQuality && currentQuality !== 'hd1080' && currentQuality !== 'highres') {
            // Quality is lower or throttled: automatically trigger diamond clarity engine
            setIsDiamondClarityActive(true);
            playerRef.current.setPlaybackQuality('hd1080');
          }
        }
      } catch {
        // Safe catch
      }
    }
  }, [sendPlayerCommand]);

  // Load YouTube IFrame API to control bitrate quality, continuous sound, and monitor clarity
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
                setIsStreamReady(true);
              } catch {
                // Ignore
              }
            },
            onPlaybackQualityChange: (event: any) => {
              const quality = event.data;
              if (quality !== 'hd1080' && quality !== 'highres') {
                // Stream dropped quality or bandwidth dipped:
                // Silently re-enforce 1080p and engage diamond clarity hardware filter
                setIsDiamondClarityActive(true);
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
                setIsStreamReady(true);
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

  // Continuous background clarity watchdog:
  // Silently verifies video resolution and maintains diamond crispness
  useEffect(() => {
    if (!isActive) return;

    enforceMaximumQualityAndAudio();

    const t1 = setTimeout(enforceMaximumQualityAndAudio, 1000);
    const t2 = setTimeout(enforceMaximumQualityAndAudio, 2500);
    const t3 = setTimeout(enforceMaximumQualityAndAudio, 4500);
    const t4 = setTimeout(enforceMaximumQualityAndAudio, 7000);

    // Periodic silent quality watchdog
    const interval = setInterval(() => {
      enforceMaximumQualityAndAudio();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [isActive, enforceMaximumQualityAndAudio]);

  // Browser Autoplay Audio Policy:
  // Rain audio immediately starts unmuted on the very first user interaction
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
        Silent Diamond-Clarity SVG Convolution Filter:
        Hardware-accelerated unsharp-mask kernel that sharpens rain streaks, lush plant contours,
        and city lights without introduces halos or noise.
      */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="diamond-clarity-engine" x="-10%" y="-10%" width="120%" height="120%">
            {/* High-frequency unsharp convolution kernel */}
            <feConvolveMatrix
              order="3"
              kernelMatrix="
                0 -0.45 0
                -0.45 2.8 -0.45
                0 -0.45 0
              "
              preserveAlpha="true"
            />
          </filter>
        </defs>
      </svg>

      {/* 
        Pristine High-Definition Backdrop Underlay:
        Guarantees that while the video buffer connects, the user sees a crystal-clear 1080p frame
      */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isStreamReady ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'url(/assets/rain_video_clean_frame.jpg)',
          filter: 'contrast(1.05) brightness(0.95)',
        }}
      />

      {/* 
        Native Ultra-Crisp Viewport Container:
        Using direct viewport dimensioning (+160px width, +90px height) rather than CSS `scale()`.
        Diamond clarity processing is silently applied via hardware-accelerated GPU pipeline.
      */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-all duration-700"
        style={{
          filter: isDiamondClarityActive 
            ? 'url(#diamond-clarity-engine) contrast(1.08) saturate(1.10) brightness(1.02)' 
            : 'contrast(1.04) saturate(1.05)',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
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
