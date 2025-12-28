"use client";

import {useEffect, useRef, useState} from "react";
import {Progress} from "@/components/ui/progress";

interface Props {
  videoId: string;
  taskId: string;
  requiredWatchPercentage: number;
  onComplete: (data: {taskId: string}) => void;
  onProgress?: (percent: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubeTaskPlayer({
  videoId,
  taskId,
  requiredWatchPercentage,
  onComplete,
  onProgress,
}: Props) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const [progress, setProgress] = useState(0);

  /** -----------------------------------------
   * Load YouTube API ONCE
   ------------------------------------------ */
  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => resolve();
    });
  };

  /** -----------------------------------------
   * Create player
   ------------------------------------------ */
  const createPlayer = async () => {
    if (!containerRef.current) return;

    await loadYouTubeAPI();

    // Destroy old player if exists
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    completedRef.current = false;
    setProgress(0);

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => startTracking(),
      },
    });
  };

  /** -----------------------------------------
   * Progress tracking
   ------------------------------------------ */
  const startTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getDuration) return;

      const duration = player.getDuration();
      const current = player.getCurrentTime();
      if (!duration) return;

      const percent = Math.min(100, Math.floor((current / duration) * 100));

      setProgress(percent);
      onProgress?.(percent);

      if (percent >= requiredWatchPercentage && !completedRef.current) {
        completedRef.current = true;
        clearInterval(intervalRef.current!);
        onComplete({taskId});
      }
    }, 1000);
  };

  /** -----------------------------------------
   * Init & cleanup
   ------------------------------------------ */
  useEffect(() => {
    createPlayer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      <Progress value={progress} />

      <p className="text-sm text-muted-foreground text-center">
        Watched {progress}% / {requiredWatchPercentage}% required
      </p>
    </div>
  );
}
