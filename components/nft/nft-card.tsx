"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { NFTCatalog, NFTTier, RankName } from "@/lib/types/phase2"
import { NFT_TIER_COLORS, RANK_COLORS } from "@/lib/constants"
import { Zap, Sparkles, Lock, ShoppingCart, Check, Eye, Star } from "lucide-react"

interface NFTCardProps {
  nft: NFTCatalog
  userRank?: RankName
  userBalance?: number
  owned?: boolean
  onPurchase?: (nftId: string) => Promise<void>
  className?: string
}

export function NFTCard({
  nft,
  userRank = "rookie",
  userBalance = 0,
  owned = false,
  onPurchase,
  className,
}: NFTCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier]

  // Check if user meets rank requirement
  const RANK_ORDER: RankName[] = ["rookie", "silver", "gold", "diamond", "citizen"]
  const meetsRankRequirement =
    !nft.required_rank || RANK_ORDER.indexOf(userRank) >= RANK_ORDER.indexOf(nft.required_rank as RankName)

  const canAfford = userBalance >= nft.vp_cost
  const canPurchase =
    meetsRankRequirement && canAfford && !owned && (nft.max_supply === null || nft.current_supply < nft.max_supply)
  const isLocked = !meetsRankRequirement

  const handlePurchase = async () => {
    if (!onPurchase || !canPurchase) return
    setIsPurchasing(true)
    try {
      await onPurchase(nft.id)
    } finally {
      setIsPurchasing(false)
    }
  }

  const nftBenefits = [
    { label: "Mining Boost", value: `+${nft.mining_boost}%`, icon: Zap },
    nft.special_effect && { label: "Special", value: nft.special_effect.replace(/_/g, " "), icon: Star },
  ].filter(Boolean)

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 group",
        "bg-gradient-to-br from-card via-card/95 to-muted/30",
        tierColors.border,
        "border-2",
        nft.tier === "legendary" && "animate-pulse-slow shadow-lg shadow-purple-500/20",
        nft.tier === "diamond" && "shadow-lg shadow-blue-500/20",
        !isLocked && "hover:scale-105 hover:shadow-xl",
        isLocked && "hover:border-opacity-60",
        className,
      )}
    >
      {(nft.tier === "legendary" || nft.tier === "diamond") && (
        <div
          className={cn(
            "absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity",
            nft.tier === "legendary"
              ? "bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20"
              : "bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20",
          )}
        />
      )}

      {/* Tier Badge */}
      <Badge
        className={cn(
          "absolute top-2 right-2 z-10 uppercase text-xs font-bold",
          tierColors.bg,
          tierColors.text,
          "animate-in fade-in duration-300",
        )}
      >
        {nft.tier}
      </Badge>

      {/* Owned Badge */}
      {owned && (
        <Badge className="absolute top-2 left-2 z-10 bg-green-500/20 text-green-400 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          Owned
        </Badge>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center transition-all group-hover:bg-background/40">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Requires</p>
            <p className={cn("font-bold uppercase text-lg", RANK_COLORS[nft.required_rank as RankName]?.text)}>
              {nft.required_rank} Rank
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 gap-1 text-xs hover:bg-primary/20"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-3 h-3" />
              {showPreview ? "Hide" : "Preview"} Benefits
            </Button>
          </div>
        </div>
      )}

      {isLocked && showPreview && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-card via-card/98 to-transparent p-4 pt-8 animate-in slide-in-from-bottom duration-300">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Unlock to get:</p>
          <div className="space-y-2">
            {nftBenefits.map((benefit: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <benefit.icon className={cn("w-4 h-4", tierColors.text)} />
                <span className="text-muted-foreground">{benefit.label}:</span>
                <span className={cn("font-bold", tierColors.text)}>{benefit.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm pt-1 border-t border-border/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Price:</span>
              <span className="font-bold text-primary">{nft.vp_cost.toLocaleString()} VP</span>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        {/* NFT Image - Improved image container with better visibility */}
        <div
          className={cn(
            "aspect-square rounded-lg mb-4 flex items-center justify-center relative overflow-hidden",
            "bg-gradient-to-br from-muted/50 to-muted/80",
            tierColors.bg,
            "border border-border/50",
          )}
        >
          {nft.image_url ? (
            <img src={nft.image_url || "/basic-pickaxe.jpeg"} alt={nft.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className={cn(
                "text-6xl transition-transform duration-300",
                !isLocked && "group-hover:scale-110 group-hover:rotate-12",
              )}
            >
              {nft.tier === "legendary"
                ? "⚡"
                : nft.tier === "diamond"
                  ? "💎"
                  : nft.tier === "gold"
                    ? "🏆"
                    : nft.tier === "silver"
                      ? "🔧"
                      : "⛏️"}
            </div>
          )}

          {/* Sparkle effect for legendary */}
          {nft.tier === "legendary" && (
            <>
              <Sparkles className="absolute top-2 left-2 w-6 h-6 text-purple-400 animate-pulse" />
              <Sparkles className="absolute bottom-2 right-2 w-4 h-4 text-pink-400 animate-pulse delay-300" />
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>

        {/* Name & Description */}
        <h3 className="font-bold text-foreground mb-1 truncate">{nft.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {nft.description || "A powerful mining enhancement NFT"}
        </p>

        {/* Stats - Always visible even when locked */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {nft.mining_boost > 0 && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                tierColors.bg,
                "transition-all duration-300",
                !isLocked && "group-hover:scale-105",
              )}
            >
              <Zap className={cn("w-3 h-3", tierColors.text)} />
              <span className={tierColors.text}>+{nft.mining_boost}%</span>
            </div>
          )}
          {nft.special_effect && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-accent/20 text-accent">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize">{nft.special_effect.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>

        {/* Supply Info */}
        {nft.max_supply && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Minted</span>
              <span>
                {nft.current_supply} / {nft.max_supply}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", tierColors.bg.replace("/20", ""))}
                style={{ width: `${(nft.current_supply / nft.max_supply) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Price & Purchase */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold text-primary">{nft.vp_cost.toLocaleString()} VP</p>
          </div>

          {!owned && !isLocked && (
            <Button
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
              size="sm"
              className={cn(
                "gap-1 transition-all duration-300",
                canPurchase ? "bg-primary hover:bg-primary/90 hover:scale-105" : "bg-muted text-muted-foreground",
              )}
            >
              {isPurchasing ? (
                "Buying..."
              ) : !canAfford ? (
                "Not enough VP"
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
