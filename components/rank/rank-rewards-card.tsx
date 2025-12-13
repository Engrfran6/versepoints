"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RankName } from "@/lib/types/phase2"
import { RANK_COLORS, RANK_THRESHOLDS } from "@/lib/constants"
import { RankBadge } from "./rank-badge"
import { Zap, Users, Gift, Lock, Check, Star, Sparkles } from "lucide-react"
import { useState } from "react"

interface RankRewardsCardProps {
  rank: RankName
  currentRank: RankName
  miningBoost: number
  referralMultiplier: number
  dailyReward: number
  features: string[]
  className?: string
}

const RANK_ORDER: RankName[] = ["rookie", "silver", "gold", "diamond", "citizen"]

const RANK_BENEFITS = {
  rookie: {
    perks: ["Basic mining access", "Referral links", "Basic dashboard"],
    exclusiveFeatures: ["Daily mining", "Point tracking"],
  },
  silver: {
    perks: ["10% mining boost", "Priority support", "Silver badge"],
    exclusiveFeatures: ["Task bonuses", "Leaderboard highlight", "Silver NFT access"],
  },
  gold: {
    perks: ["25% mining boost", "2x referral bonus", "Gold badge"],
    exclusiveFeatures: ["Exclusive tasks", "Gold NFT access", "Early feature access"],
  },
  diamond: {
    perks: ["50% mining boost", "3x referral bonus", "Diamond badge"],
    exclusiveFeatures: ["Diamond NFT access", "VIP support", "Governance voting"],
  },
  citizen: {
    perks: ["100% mining boost", "5x referral bonus", "Citizen badge"],
    exclusiveFeatures: ["All NFT access", "Admin features", "Revenue sharing", "DAO membership"],
  },
}

export function RankRewardsCard({
  rank,
  currentRank,
  miningBoost,
  referralMultiplier,
  dailyReward,
  features,
  className,
}: RankRewardsCardProps) {
  const colors = RANK_COLORS[rank]
  const isUnlocked = RANK_ORDER.indexOf(currentRank) >= RANK_ORDER.indexOf(rank)
  const isCurrent = currentRank === rank
  const [isHovered, setIsHovered] = useState(false)
  const benefits = RANK_BENEFITS[rank]
  const pointsRequired = RANK_THRESHOLDS[rank]

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 group",
        isUnlocked ? colors.border : "border-border/50",
        isCurrent && `glow-${rank}`,
        "hover:scale-[1.02] hover:shadow-xl",
        !isUnlocked && "hover:border-primary/30",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn("absolute inset-0 opacity-0 transition-opacity duration-500", isHovered && "opacity-100")}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.hex}15 0%, transparent 70%)`,
        }}
      />

      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:bg-background/40">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-500",
              colors.bg,
              isHovered && "scale-110 animate-pulse",
            )}
          >
            <Lock className={cn("w-6 h-6", colors.text)} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Unlock at {pointsRequired.toLocaleString()} VP</p>
          <p className="text-xs text-muted-foreground text-center">Keep mining to unlock these rewards!</p>

          <div className="mt-4 space-y-1 w-full px-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Preview Benefits:
            </p>
            {benefits.perks.slice(0, 2).map((perk, i) => (
              <p key={i} className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Star className="w-2 h-2" /> {perk}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Current badge with animation */}
      {isCurrent && (
        <div
          className={cn(
            "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold animate-pulse",
            colors.bg,
            colors.text,
          )}
        >
          Current
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={cn("transition-transform duration-500", isHovered && "scale-110")}>
            <RankBadge rank={rank} size="md" showLabel={false} showGlow={isUnlocked} />
          </div>
          <div>
            <CardTitle className={cn("uppercase", colors.text)}>{rank}</CardTitle>
            <p className="text-xs text-muted-foreground">{pointsRequired.toLocaleString()} VP required</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats with animations */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={cn(
              "text-center p-2 rounded-lg bg-muted/50 transition-all duration-300",
              isHovered && "bg-muted/80 scale-105",
            )}
          >
            <Zap
              className={cn(
                "w-4 h-4 mx-auto mb-1 transition-all duration-300",
                colors.text,
                isHovered && "animate-pulse",
              )}
            />
            <p className="text-lg font-bold text-foreground">+{miningBoost}%</p>
            <p className="text-xs text-muted-foreground">Mining Boost</p>
          </div>
          <div
            className={cn(
              "text-center p-2 rounded-lg bg-muted/50 transition-all duration-300",
              isHovered && "bg-muted/80 scale-105",
            )}
            style={{ transitionDelay: "50ms" }}
          >
            <Users
              className={cn(
                "w-4 h-4 mx-auto mb-1 transition-all duration-300",
                colors.text,
                isHovered && "animate-pulse",
              )}
            />
            <p className="text-lg font-bold text-foreground">x{referralMultiplier}</p>
            <p className="text-xs text-muted-foreground">Referral</p>
          </div>
          <div
            className={cn(
              "text-center p-2 rounded-lg bg-muted/50 transition-all duration-300",
              isHovered && "bg-muted/80 scale-105",
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <Gift
              className={cn(
                "w-4 h-4 mx-auto mb-1 transition-all duration-300",
                colors.text,
                isHovered && "animate-pulse",
              )}
            />
            <p className="text-lg font-bold text-foreground">{dailyReward}</p>
            <p className="text-xs text-muted-foreground">Daily VP</p>
          </div>
        </div>

        {/* Features with staggered animations */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-1">
            <Sparkles className={cn("w-3 h-3", colors.text)} />
            Exclusive Features:
          </p>
          <ul className="space-y-1">
            {benefits.exclusiveFeatures.map((feature, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300",
                  isHovered && "translate-x-1",
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <Check className={cn("w-3 h-3", colors.text)} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Perks section */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Perks:</p>
          <div className="flex flex-wrap gap-1">
            {benefits.perks.map((perk, i) => (
              <span
                key={i}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full transition-all duration-300",
                  colors.bg,
                  colors.text,
                  isHovered && "scale-105",
                )}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
