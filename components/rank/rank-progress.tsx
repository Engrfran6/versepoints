"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { RankName } from "@/lib/types/phase2"
import { RANK_THRESHOLDS, RANK_COLORS } from "@/lib/constants"
import { RankBadge } from "./rank-badge"
import { Progress } from "@/components/ui/progress"

interface RankProgressProps {
  currentRank: RankName
  totalPoints: number
  className?: string
}

const RANK_ORDER: RankName[] = ["rookie", "silver", "gold", "diamond", "citizen"]

export function RankProgress({ currentRank, totalPoints, className }: RankProgressProps) {
  const { progress, nextRank, pointsToNext, pointsInCurrentTier } = useMemo(() => {
    const currentIndex = RANK_ORDER.indexOf(currentRank)
    const nextRankName = currentIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentIndex + 1] : null

    if (!nextRankName) {
      return { progress: 100, nextRank: null, pointsToNext: 0, pointsInCurrentTier: 0 }
    }

    const currentThreshold = RANK_THRESHOLDS[currentRank]
    const nextThreshold = RANK_THRESHOLDS[nextRankName]
    const pointsInTier = totalPoints - currentThreshold
    const tierRange = nextThreshold - currentThreshold
    const progressPercent = Math.min((pointsInTier / tierRange) * 100, 100)

    return {
      progress: progressPercent,
      nextRank: nextRankName,
      pointsToNext: nextThreshold - totalPoints,
      pointsInCurrentTier: pointsInTier,
    }
  }, [currentRank, totalPoints])

  const currentColors = RANK_COLORS[currentRank]
  const nextColors = nextRank ? RANK_COLORS[nextRank] : null

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Rank Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RankBadge rank={currentRank} size="lg" showLabel={false} />
          <div>
            <p className="text-sm text-muted-foreground">Current Rank</p>
            <p className={cn("text-xl font-bold uppercase", currentColors.text)}>{currentRank}</p>
          </div>
        </div>

        {nextRank && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-sm text-muted-foreground">Next Rank</p>
              <p className={cn("text-xl font-bold uppercase", nextColors?.text)}>{nextRank}</p>
            </div>
            <RankBadge rank={nextRank} size="lg" showLabel={false} showGlow={false} className="opacity-50" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextRank && (
        <div className="space-y-2">
          <div className="relative">
            <Progress value={progress} className="h-4 bg-muted" />
            <div
              className="absolute inset-0 h-4 rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${currentColors.hex}, ${nextColors?.hex})`,
                width: `${progress}%`,
                transition: "width 0.5s ease-out",
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{totalPoints.toLocaleString()} VP</span>
            <span className={cn("font-medium", nextColors?.text)}>
              {pointsToNext.toLocaleString()} VP to {nextRank}
            </span>
          </div>
        </div>
      )}

      {/* Max Rank Message */}
      {!nextRank && (
        <div className="text-center py-4">
          <p className={cn("text-lg font-bold", currentColors.text)}>Maximum Rank Achieved!</p>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve reached the highest tier. Congratulations, Citizen!
          </p>
        </div>
      )}
    </div>
  )
}
