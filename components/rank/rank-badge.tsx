"use client"

import { cn } from "@/lib/utils"
import { Shield, ShieldPlus, Award, Gem, Crown } from "lucide-react"
import type { RankName } from "@/lib/types/phase2"
import { RANK_COLORS } from "@/lib/constants"

const RANK_ICONS = {
  rookie: Shield,
  silver: ShieldPlus,
  gold: Award,
  diamond: Gem,
  citizen: Crown,
}

interface RankBadgeProps {
  rank: RankName
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
  showGlow?: boolean
  className?: string
}

export function RankBadge({ rank, size = "md", showLabel = true, showGlow = true, className }: RankBadgeProps) {
  const Icon = RANK_ICONS[rank]
  const colors = RANK_COLORS[rank]

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const labelSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          sizeClasses[size],
          colors.bg,
          colors.border,
          "border-2 rounded-xl flex items-center justify-center relative",
          showGlow && `glow-${rank}`,
          "transition-all duration-300 hover:scale-110",
        )}
      >
        <Icon className={cn(iconSizes[size], colors.text, "animate-glow-rank")} />

        {/* Shimmer effect for higher ranks */}
        {(rank === "gold" || rank === "diamond" || rank === "citizen") && (
          <div
            className="absolute inset-0 rounded-xl opacity-30 animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.hex}40, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </div>

      {showLabel && (
        <span className={cn(labelSizes[size], colors.text, "font-bold uppercase tracking-wider")}>{rank}</span>
      )}
    </div>
  )
}
