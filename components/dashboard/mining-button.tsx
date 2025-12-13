"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pickaxe, Loader2, CheckCircle2, AlertCircle, Sparkles, Flame, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { MINING_CONSTANTS } from "@/lib/constants"

interface MiningButtonProps {
  lastMiningAt: string | null
  currentStreak?: number
  onMine: () => Promise<{ success: boolean; points?: number; streak?: number; multiplier?: number; error?: string }>
  onSuccess?: () => void
}

export function MiningButton({ lastMiningAt, currentStreak = 0, onMine, onSuccess }: MiningButtonProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [canMine, setCanMine] = useState(false)
  const [isMining, setIsMining] = useState(false)
  const [miningResult, setMiningResult] = useState<{
    success: boolean
    message: string
    streak?: number
    multiplier?: number
  } | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const getStreakMultiplier = (streak: number): number => {
    const thresholds = Object.entries(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS)
      .map(([days, mult]) => ({ days: Number.parseInt(days), mult }))
      .sort((a, b) => b.days - a.days)

    for (const { days, mult } of thresholds) {
      if (streak >= days) return mult
    }
    return 1.0
  }

  const streakMultiplier = getStreakMultiplier(currentStreak)
  const effectivePoints = Math.floor(MINING_CONSTANTS.POINTS_PER_MINE * streakMultiplier)

  const calculateTimeLeft = useCallback(() => {
    if (!lastMiningAt) {
      setCanMine(true)
      setTimeLeft(0)
      return
    }

    const lastMining = new Date(lastMiningAt).getTime()
    const cooldownMs = MINING_CONSTANTS.MINING_COOLDOWN_HOURS * 60 * 60 * 1000
    const nextMining = lastMining + cooldownMs
    const now = Date.now()
    const remaining = nextMining - now

    if (remaining <= 0) {
      setCanMine(true)
      setTimeLeft(0)
    } else {
      setCanMine(false)
      setTimeLeft(remaining)
    }
  }, [lastMiningAt])

  useEffect(() => {
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [calculateTimeLeft])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      life: number
      maxLife: number
    }> = []

    const colors = ["#22d3ee", "#06b6d4", "#0891b2", "#67e8f9", "#a5f3fc"]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new particles when mining or ready
      if ((isMining || canMine) && Math.random() > 0.7) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 2
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 60 + Math.random() * 40,
        })
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++

        const alpha = 1 - p.life / p.maxLife
        const particleRadius = Math.max(0.1, p.size * alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2)
        ctx.fillStyle =
          p.color +
          Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
        }
      }

      // Draw center glow
      const progress =
        timeLeft > 0
          ? (MINING_CONSTANTS.MINING_COOLDOWN_HOURS * 60 * 60 * 1000 - timeLeft) /
            (MINING_CONSTANTS.MINING_COOLDOWN_HOURS * 60 * 60 * 1000)
          : 1

      const baseGlow = 40 + progress * 20
      const pulseOffset = canMine ? Math.sin(Date.now() / 200) * 5 : 0
      const glowSize = Math.max(1, baseGlow + pulseOffset)

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        glowSize,
      )
      gradient.addColorStop(0, `rgba(34, 211, 238, ${canMine ? 0.4 : 0.2 * progress})`)
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${canMine ? 0.2 : 0.1 * progress})`)
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)")

      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMining, canMine, timeLeft])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMine = async () => {
    if (!canMine || isMining) return

    setIsMining(true)
    setMiningResult(null)
    setShowParticles(true)

    try {
      const result = await onMine()
      if (result.success) {
        setMiningResult({
          success: true,
          message: `+${result.points || effectivePoints} VersePoints!`,
          streak: result.streak,
          multiplier: result.multiplier,
        })
        setCanMine(false)
        onSuccess?.()
      } else {
        setMiningResult({ success: false, message: result.error || "Mining failed" })
      }
    } catch {
      setMiningResult({ success: false, message: "An error occurred" })
    } finally {
      setIsMining(false)
      setTimeout(() => setShowParticles(false), 2000)
    }
  }

  // Progress percentage for countdown
  const totalCooldown = MINING_CONSTANTS.MINING_COOLDOWN_HOURS * 60 * 60 * 1000
  const progress = timeLeft > 0 ? ((totalCooldown - timeLeft) / totalCooldown) * 100 : 100

  return (
    <div className="flex flex-col items-center gap-4">
      {currentStreak > 0 && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Badge
            variant="outline"
            className={cn(
              "gap-1 px-3 py-1",
              currentStreak >= 30
                ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                : currentStreak >= 14
                  ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                  : currentStreak >= 7
                    ? "border-green-500/50 text-green-400 bg-green-500/10"
                    : currentStreak >= 3
                      ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                      : "border-orange-500/50 text-orange-400 bg-orange-500/10",
            )}
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="font-bold">{currentStreak} Day Streak</span>
            {streakMultiplier > 1 && <span className="text-xs opacity-80">({streakMultiplier}x)</span>}
          </Badge>
        </div>
      )}

      {/* Mining Button with Canvas */}
      <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-muted/40 p-8 rounded-3xl border border-border/50 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="absolute inset-0 pointer-events-none -translate-x-[20px] -translate-y-[20px]"
        />

        {showParticles && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-primary rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  animation: `particle-burst 1s ease-out forwards`,
                  animationDelay: `${i * 50}ms`,
                  transform: `rotate(${i * 22.5}deg) translateY(-60px)`,
                }}
              />
            ))}
          </div>
        )}

        <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 3.14} 314`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className={cn(
            "absolute -inset-1 rounded-full transition-all duration-500",
            canMine ? "animate-pulse opacity-80" : "opacity-30",
          )}
          style={{
            background: `conic-gradient(from 180deg, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%)`,
          }}
        />

        <Button
          onClick={handleMine}
          disabled={!canMine || isMining}
          className={cn(
            "relative w-40 h-40 rounded-full text-lg font-bold transition-all duration-300 overflow-hidden",
            canMine && !isMining
              ? "bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground scale-100 hover:scale-105 shadow-lg shadow-primary/50"
              : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground cursor-not-allowed",
          )}
        >
          {canMine && !isMining && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          )}

          <div className="flex flex-col items-center gap-1 relative z-10">
            {isMining ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-sm">Mining...</span>
                <Sparkles className="w-4 h-4 absolute -top-2 -right-2 animate-pulse text-yellow-400" />
              </>
            ) : canMine ? (
              <>
                <Pickaxe className="w-10 h-10 animate-bounce" />
                <span>Mine Now</span>
                <span className="text-xs opacity-90 flex items-center gap-1">
                  +{effectivePoints} VP
                  {streakMultiplier > 1 && <Zap className="w-3 h-3 text-yellow-300" />}
                </span>
              </>
            ) : (
              <>
                <Pickaxe className="w-8 h-8 opacity-50" />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
                <span className="text-xs opacity-60">{Math.round(progress)}% ready</span>
              </>
            )}
          </div>
        </Button>
      </div>

      {miningResult && (
        <div
          className={cn(
            "flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-500",
            miningResult.success
              ? "bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border border-green-500/30"
              : "bg-destructive/10 text-destructive border border-destructive/30",
          )}
        >
          {miningResult.success ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-400 animate-bounce" />
                <span className="font-bold text-lg text-green-400">{miningResult.message}</span>
                <Sparkles className="w-5 h-5 animate-spin text-yellow-400" />
              </div>
              {miningResult.streak && miningResult.streak > 1 && (
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span>{miningResult.streak} day streak!</span>
                  {miningResult.multiplier && miningResult.multiplier > 1 && (
                    <Badge variant="outline" className="text-xs border-orange-500/50">
                      {miningResult.multiplier}x bonus
                    </Badge>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{miningResult.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      <p className="text-sm text-muted-foreground text-center">
        {canMine ? (
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            Click to mine and earn {effectivePoints} VersePoints!
            {streakMultiplier > 1 && <span className="text-yellow-400">({streakMultiplier}x streak bonus)</span>}
          </span>
        ) : (
          "Come back when the timer reaches zero"
        )}
      </p>
    </div>
  )
}
