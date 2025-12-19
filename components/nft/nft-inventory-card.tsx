"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UserNFT, NFTTier } from "@/lib/types/phase2"
import { NFT_TIER_COLORS } from "@/lib/constants"
import { Zap, Sparkles, CheckCircle2 } from "lucide-react"

interface NFTInventoryCardProps {
  userNft: UserNFT
  onEquip?: (userNftId: string) => Promise<void>
  className?: string
}

export function NFTInventoryCard({ userNft, onEquip, className }: NFTInventoryCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const nft = userNft.nft

  if (!nft) return null

  const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier]

  const handleEquipToggle = async () => {
    if (!onEquip) return
    setIsToggling(true)
    try {
      await onEquip(userNft.id)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        tierColors.border,
        "border-2",
        userNft.is_equipped && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
    >
      {/* Tier Badge */}
      <Badge className={cn("absolute top-2 right-2 z-10 uppercase text-xs", tierColors.bg, tierColors.text)}>
        {nft.tier}
      </Badge>

      {/* Equipped Badge */}
      {userNft.is_equipped && (
        <Badge className="absolute top-2 left-2 z-10 bg-primary/20 text-primary border-primary/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Equipped
        </Badge>
      )}

      <CardContent className="p-4">
        {/* NFT Image */}
        <div className={cn("aspect-square rounded-lg mb-4 flex items-center justify-center", tierColors.bg)}>
          {nft.image_url ? (
            <img
              src={nft.image_url || "/placeholder.svg"}
              alt={nft.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-5xl">
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
        </div>

        {/* Name */}
        <h3 className="font-bold text-foreground mb-2 truncate">{nft.name}</h3>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mb-4">
          {nft.mining_boost > 0 && (
            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs", tierColors.bg)}>
              <Zap className={cn("w-3 h-3", tierColors.text)} />
              <span className={tierColors.text}>+{nft.mining_boost}%</span>
            </div>
          )}
          {nft.special_effect && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-accent/20 text-accent">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize text-[10px]">{nft.special_effect.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>

        {/* Equip Button */}
        <Button
          onClick={handleEquipToggle}
          disabled={isToggling}
          variant={userNft.is_equipped ? "outline" : "default"}
          size="sm"
          className="w-full"
        >
          {isToggling ? "..." : userNft.is_equipped ? "Unequip" : "Equip"}
        </Button>
      </CardContent>
    </Card>
  )
}
