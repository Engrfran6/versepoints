export {};

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    class Player {
      constructor(
        elementId: string | HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: PlayerEvent) => void;
            onStateChange?: (event: OnStateChangeEvent) => void;
            onPlaybackRateChange?: (event: PlayerEvent) => void;
          };
        }
      );

      destroy(): void;
      getCurrentTime(): number;
      getDuration(): number;
      getPlaybackRate(): number;
    }

    interface PlayerEvent {
      target: Player;
      data?: number;
    }

    interface OnStateChangeEvent extends PlayerEvent {
      data: number;
    }

    const PlayerState: {
      UNSTARTED: -1;
      ENDED: 0;
      PLAYING: 1;
      PAUSED: 2;
      BUFFERING: 3;
      CUED: 5;
    };
  }
}
