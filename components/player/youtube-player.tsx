"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Bookmark, Clock } from "lucide-react";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            rel?: number;
            modestbranding?: number;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    __ytPlayerInstance?: YTPlayerInstance | null;
  }
}

interface YTPlayerInstance {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubePlayerProps {
  videoId: string;
  onEnded?: () => void;
}

export function YouTubePlayer({ videoId, onEnded }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setIsApiReady(true);
    };
  }, []);

  // 2. Initialize or update YouTube Player when API is ready and videoId changes
  useEffect(() => {
    if (!isApiReady || !containerRef.current) return;

    let isMounted = true;
    setIsLoading(true);

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(videoId);
        setIsLoading(false);
      } catch (err) {
        console.warn("Could not load video directly, re-instantiating player", err);
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    }

    if (!playerRef.current) {
      try {
        const playerDiv = document.createElement("div");
        playerDiv.className = "w-full h-full";
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(playerDiv);
        }

        const newPlayer = new window.YT.Player(playerDiv, {
          videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: () => {
              if (isMounted) {
                setIsLoading(false);
                window.__ytPlayerInstance = newPlayer;
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                onEnded?.();
              }
            },
            onError: (error) => {
              console.error("YouTube Player error:", error);
              if (isMounted) {
                setIsLoading(false);
              }
            },
          },
        });

        playerRef.current = newPlayer;
        window.__ytPlayerInstance = newPlayer;
      } catch (e) {
        console.error("Error instantiating YouTube Player:", e);
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isApiReady, videoId, onEnded]);

  // 3. Listen for global Seek events from Timestamp clicks in notes
  useEffect(() => {
    const handleSeek = (e: CustomEvent<{ seconds: number }>) => {
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(e.detail.seconds, true);
        try {
          playerRef.current.playVideo();
        } catch {}
      }
    };

    window.addEventListener("yt-seek-to", handleSeek as EventListener);
    return () => {
      window.removeEventListener("yt-seek-to", handleSeek as EventListener);
    };
  }, []);

  // 4. Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
        window.__ytPlayerInstance = null;
      }
    };
  }, []);

  return (
    <div className="relative border-2 border-stone-800 bg-stone-900 shadow-[4px_4px_0px_rgba(28,25,23,0.15)]">
      {/* Top Academic Header Tape */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-900 border-b border-stone-800 text-stone-300 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-red-600 rounded-none animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-white">LECTURE REEL // VIDEO ID: {videoId}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-400">
          <Clock className="h-3 w-3 text-amber-500" />
          <span>Interactive Timestamp Player</span>
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/90 z-10 text-stone-200">
            <div className="flex flex-col items-center gap-2.5 p-4 border border-stone-700 bg-stone-900">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <p className="text-xs font-mono uppercase tracking-widest text-stone-300">Loading lecture stream...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
