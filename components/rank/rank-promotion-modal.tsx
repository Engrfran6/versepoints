"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RankName } from "@/lib/types/phase2"
import { RANK_COLORS } from "@/lib/constants"
import { RankBadge } from "./rank-badge"
import { Sparkles, Zap, Users, Gift } from "lucide-react"
import confetti from "canvas-confetti"

interface RankPromotionModalProps {
  isOpen: boolean
  onClose: () => void
  fromRank: RankName
  toRank: RankName
  rewards: {
    miningBoost?: number
    referralMultiplier?: number
    dailyReward?: number
    features?: string[]
  }
}

export function RankPromotionModal({ isOpen, onClose, fromRank, toRank, rewards }: RankPromotionModalProps) {
  const [showContent, setShowContent] = useState(false)
  const colors = RANK_COLORS[toRank]

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [colors.hex, "#ffffff", "#fbbf24"],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [colors.hex, "#ffffff", "#fbbf24"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Delay content reveal
      setTimeout(() => setShowContent(true), 500)
    } else {
      setShowContent(false)
    }
  }, [isOpen, colors.hex])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2" style={{ borderColor: colors.hex }}>
        <DialogTitle className="sr-only">Rank Promotion</DialogTitle>

        <div className="text-center py-6">
          {/* Animated Badge */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping opacity-30">
              <RankBadge rank={toRank} size="xl" showLabel={false} showGlow={false} />
            </div>
            <div className="animate-rank-up">
              <RankBadge rank={toRank} size="xl" showLabel={false} />
            </div>
          </div>

          {/* Title */}
          <div
            className={cn(
              "transition-all duration-500",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className={cn("w-5 h-5", colors.text)} />
              <h2 className="text-2xl font-bold text-foreground">Rank Up!</h2>
              <Sparkles className={cn("w-5 h-5", colors.text)} />
            </div>

            <p className="text-muted-foreground mb-4">
              You&apos;ve been promoted from <span className={RANK_COLORS[fromRank].text}>{fromRank}</span> to{" "}
              <span className={cn("font-bold uppercase", colors.text)}>{toRank}</span>!
            </p>

            {/* Rewards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {rewards.miningBoost !== undefined && (
                <div className={cn("p-3 rounded-lg", colors.bg)}>
                  <Zap className={cn("w-5 h-5 mx-auto mb-1", colors.text)} />
                  <p className="text-lg font-bold text-foreground">+{rewards.miningBoost}%</p>
                  <p className="text-xs text-muted-foreground">Mining</p>
                </div>
              )}
              {rewards.referralMultiplier !== undefined && (
                <div className={cn("p-3 rounded-lg", colors.bg)}>
                  <Users className={cn("w-5 h-5 mx-auto mb-1", colors.text)} />
                  <p className="text-lg font-bold text-foreground">x{rewards.referralMultiplier}</p>
                  <p className="text-xs text-muted-foreground">Referral</p>
                </div>
              )}
              {rewards.dailyReward !== undefined && (
                <div className={cn("p-3 rounded-lg", colors.bg)}>
                  <Gift className={cn("w-5 h-5 mx-auto mb-1", colors.text)} />
                  <p className="text-lg font-bold text-foreground">{rewards.dailyReward}</p>
                  <p className="text-xs text-muted-foreground">Daily VP</p>
                </div>
              )}
            </div>

            {/* New Features */}
            {rewards.features && rewards.features.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">New Features Unlocked:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {rewards.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className={cn("px-2 py-1 rounded-full text-xs", colors.bg, colors.text)}>
                      {feature.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full" style={{ backgroundColor: colors.hex }}>
              Awesome!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
