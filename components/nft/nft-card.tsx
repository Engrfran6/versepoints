"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NFTCatalog, NFTTier, RankName } from "@/lib/types/phase2";
import { NFT_TIER_COLORS, RANK_COLORS } from "@/lib/constants";
import {
  Zap,
  Sparkles,
  Lock,
  ShoppingCart,
  Check,
  Eye,
  Star,
} from "lucide-react";

interface NFTCardProps {
  nft: NFTCatalog;
  userRank?: RankName;
  userBalance?: number;
  owned?: boolean;
  onPurchase?: (nftId: string) => Promise<void>;
  className?: string;
}

export function NFTCard({
  nft,
  userRank = "rookie",
  userBalance = 0,
  owned = false,
  onPurchase,
  className,
}: NFTCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier];

  const RANK_ORDER: RankName[] = [
    "rookie",
    "silver",
    "gold",
    "diamond",
    "citizen",
  ];

  const meetsRankRequirement =
    !nft.required_rank ||
    RANK_ORDER.indexOf(userRank) >=
      RANK_ORDER.indexOf(nft.required_rank as RankName);

  const canAfford = userBalance >= nft.vp_cost;
  const canPurchase =
    meetsRankRequirement &&
    canAfford &&
    (nft.max_supply === null || nft.current_supply < nft.max_supply);

  const isLocked = !meetsRankRequirement;

  const handlePurchase = async () => {
    if (!onPurchase || !canPurchase) return;
    setIsPurchasing(true);
    try {
      await onPurchase(nft.id);
    } finally {
      setIsPurchasing(false);
    }
  };

  const nftBenefits = [
    { label: "Mining Boost", value: `+${nft.mining_boost}%`, icon: Zap },
    nft.special_effect && {
      label: "Special",
      value: nft.special_effect.replace(/_/g, " "),
      icon: Star,
    },
  ].filter(Boolean) as any[];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 group",
        "bg-gradient-to-br from-card via-card/95 to-muted/30",
        tierColors.border,
        "border-2",
        !isLocked && "hover:scale-105 hover:shadow-xl",
        className
      )}
    >
      {/* Tier badge */}
      <Badge
        className={cn(
          "absolute top-2 right-2 z-20 uppercase text-xs font-bold",
          tierColors.bg,
          tierColors.text
        )}
      >
        {nft.name}
      </Badge>

      {/* Owned badge */}
      {owned && (
        <Badge className="absolute top-2 left-2 z-20 bg-green-500/20 text-green-400 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          Owned
        </Badge>
      )}

      {/* IMAGE — ALWAYS VISIBLE */}
      <div className="p-4">
        <div
          className={cn(
            "aspect-square rounded-lg relative overflow-hidden flex items-center justify-center",
            "bg-gradient-to-br from-muted/50 to-muted/80",
            tierColors.bg,
            "border border-border/50"
          )}
        >
          {nft.image_url ? (
            <img
              src={nft.image_url}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">⛏️</div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="relative px-4 pt-0">
        {/* Name & description */}
        <h3 className="font-bold text-foreground mb-1">{nft.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {nft.description || "A powerful mining enhancement NFT"}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {nftBenefits.map((b, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                tierColors.bg
              )}
            >
              <b.icon className={cn("w-3 h-3", tierColors.text)} />
              <span className={tierColors.text}>{b.value}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-lg font-bold text-primary">
            {nft.vp_cost.toLocaleString()} VP
          </p>
        </div>
      </CardContent>

      {/* BUY — only when actually purchasable */}
      {isLocked ? (
        <div className="flex items-center gap-4 rounded-xl bg-muted/60 px-5 py-4 border border-border/50 shadow-sm mx-4 hover:cursor-not-allowed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 border">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex flex-col leading-tight">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Requires
            </p>

            <p
              className={cn(
                "text-lg font-extrabold uppercase leading-none",
                RANK_COLORS[nft.required_rank as RankName]?.text
              )}
            >
              {nft.required_rank} Rank
            </p>

            <p className="text-xs italic text-muted-foreground">
              to unlock this NFT
            </p>
          </div>
        </div>
      ) : (
        canAfford && (
          <div className="px-4 pb-4">
            <Button
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
              size="sm"
              className="w-full gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isPurchasing ? "Buying..." : "Buy"}
            </Button>
          </div>
        )
      )}
    </Card>
  );
}
