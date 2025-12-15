"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react"

interface YouTubeTaskPlayerProps {
  videoId: string
  taskId: string
  requiredWatchPercentage?: number
  onComplete: (verificationData: Record<string, unknown>) => void
}

export function YouTubeTaskPlayer({
  videoId,
  taskId,
  requiredWatchPercentage = 90,
  onComplete,
}: YouTubeTaskPlayerProps) {
  const playerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [watchProgress, setWatchProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [watchTime, setWatchTime] = useState(0)
  const [tabVisible, setTabVisible] = useState(true)
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    fastForwards: 0,
    playbackRateChanges: 0,
  })
  const startTimeRef = useRef(0)
  const lastPositionRef = useRef(0)

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player(`youtube-player-${taskId}`, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true)
            setVideoDuration(event.target.getDuration())
          },
          onStateChange: (event: any) => {
            // @ts-ignore
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              startTimeRef.current = Date.now()
            }
            // @ts-ignore
            else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false)
            }
          },
          onPlaybackRateChange: (event: any) => {
            const rate = event.target.getPlaybackRate()
            if (rate > 1.25) {
              setViolations((v) => ({ ...v, playbackRateChanges: v.playbackRateChanges + 1 }))
              toast.warning("Please watch at normal speed (max 1.25x)")
            }
          },
        },
      })
    }

    // Track tab visibility
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      setTabVisible(isVisible)
      if (!isVisible && isPlaying) {
        setViolations((v) => ({ ...v, tabSwitches: v.tabSwitches + 1 }))
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId, taskId])

  useEffect(() => {
    if (!isPlaying || !playerRef.current) return

    const interval = setInterval(() => {
      try {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        const playbackRate = playerRef.current.getPlaybackRate()

        // Detect large time jumps (fast forwarding)
        if (currentTime - lastPositionRef.current > 5 && playbackRate <= 1.25) {
          setViolations((v) => ({ ...v, fastForwards: v.fastForwards + 1 }))
        }

        lastPositionRef.current = currentTime

        // Update watch time (only count at normal speed)
        if (tabVisible && playbackRate <= 1.25) {
          setWatchTime((prev) => prev + 1)
        }

        const progress = (currentTime / duration) * 100
        setWatchProgress(progress)

        // Check if watch requirement met
        if (progress >= requiredWatchPercentage) {
          handleVideoCompleted()
        }
      } catch (error) {
        console.error("[v0] YouTube player error:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, tabVisible, requiredWatchPercentage])

  const handleVideoCompleted = () => {
    const fraudScore = calculateFraudScore()

    if (fraudScore > 50) {
      toast.error("Suspicious activity detected. Please watch the video properly.")
      return
    }

    const verificationData = {
      videoId,
      watchDuration: watchTime,
      requiredDuration: (videoDuration * requiredWatchPercentage) / 100,
      watchPercentage: watchProgress,
      violations,
      fraudScore,
      completedAt: new Date().toISOString(),
    }

    onComplete(verificationData)
    toast.success("Video watch verified! Submitting task...")
  }

  const calculateFraudScore = () => {
    let score = 0

    // Penalize tab switches
    score += violations.tabSwitches * 10

    // Penalize fast forwards
    score += violations.fastForwards * 15

    // Penalize playback rate changes
    score += violations.playbackRateChanges * 10

    // Penalize if watch time is too short
    const expectedWatchTime = (videoDuration * requiredWatchPercentage) / 100
    if (watchTime < expectedWatchTime * 0.8) {
      score += 30
    }

    return Math.min(score, 100)
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border">
      <CardContent className="p-6 space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <div id={`youtube-player-${taskId}`} className="w-full h-full" />
        </div>

        {/* Watch Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Watch Progress</span>
            <span className="font-medium text-foreground">{Math.round(watchProgress)}%</span>
          </div>
          <Progress value={watchProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Watch at least {requiredWatchPercentage}% to complete this task
          </p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            {tabVisible ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-red-500" />}
            <span className="text-muted-foreground">{tabVisible ? "Tab Visible" : "Tab Hidden"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {violations.tabSwitches > 3 ? (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <span className="text-muted-foreground">{violations.tabSwitches} tab switches</span>
          </div>
        </div>

        {watchProgress >= requiredWatchPercentage && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-500 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Video watch requirement completed!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
