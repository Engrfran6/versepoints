"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import type {NFTCatalog, NFTTier, RankName} from "@/lib/types/phase2";
import {NFT_TIER_COLORS, RANK_COLORS} from "@/lib/constants";
import {Zap, Lock, ShoppingCart, Check, Star, Loader2} from "lucide-react";

type PurchaseStep = "processing" | "validating" | "confirming" | "success";

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
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep | null>(null);

  const tierColors = NFT_TIER_COLORS[nft.tier as NFTTier];

  const RANK_ORDER: RankName[] = ["rookie", "silver", "gold", "diamond", "citizen"];

  const meetsRankRequirement =
    RANK_ORDER.indexOf(userRank) >= RANK_ORDER.indexOf(nft.required_rank as RankName);

  const canAfford = userBalance >= nft.vp_cost;

  const supplyAvailable = nft.max_supply === null || nft.current_supply < nft.max_supply;

  const canPurchase = meetsRankRequirement && canAfford && supplyAvailable;
  const isLocked = !meetsRankRequirement;

  // 🔥 Purchase Flow
  const handlePurchase = async () => {
    if (!onPurchase || !canPurchase) return;

    setIsPurchasing(true);
    setPurchaseStep("processing");

    try {
      await new Promise((r) => setTimeout(r, 700));
      setPurchaseStep("validating");

      await new Promise((r) => setTimeout(r, 700));
      setPurchaseStep("confirming");

      await onPurchase(nft.id);

      setPurchaseStep("success");

      setTimeout(() => {
        setPurchaseStep(null);
      }, 1200);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      {/* CARD */}
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-500 group",
          "bg-gradient-to-br from-card via-card/95 to-muted/30",
          tierColors.border,
          "border-2",
          !isLocked && "hover:scale-105 hover:shadow-xl",
          className
        )}>
        {/* Tier badge */}
        <Badge
          className={cn(
            "absolute top-2 right-2 z-20 uppercase text-xs font-bold",
            tierColors.bg,
            tierColors.text
          )}>
          {nft.name}
        </Badge>

        {owned && (
          <Badge className="absolute top-2 left-2 z-20 bg-green-500/20 text-green-400">
            <Check className="w-3 h-3 mr-1" />
            Owned
          </Badge>
        )}

        <div className="p-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {nft.image_url ? (
              <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-6xl">⛏️</div>
            )}
          </div>
        </div>

        <CardContent className="px-4">
          <h3 className="font-bold">{nft.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{nft.description}</p>

          <p className="text-lg font-bold text-primary">{nft.vp_cost.toLocaleString()} VP</p>
        </CardContent>

        {isLocked ? (
          // <div className="mx-4 mb-4 p-4 rounded-xl bg-muted/60 border">
          //   <Lock className="mx-auto text-muted-foreground" />
          // </div>
          <div className="flex items-center gap-4 rounded-xl bg-muted/60 px-5 py-4 border border-border/50 shadow-sm mx-4 hover:cursor-not-allowed">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 border">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex flex-col leading-tight">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Requires</p>

              <p
                className={cn(
                  "text-lg font-extrabold uppercase leading-none",
                  RANK_COLORS[nft.required_rank as RankName]?.text
                )}>
                {nft.required_rank} Rank
              </p>

              <p className="text-xs italic text-muted-foreground">to unlock this NFT</p>
            </div>
          </div>
        ) : (
          canAfford && (
            <div className="px-4 pb-4">
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                size="sm"
                className="w-full gap-2">
                <ShoppingCart className="w-4 h-4" />
                Buy
              </Button>
            </div>
          )
        )}
      </Card>

      {/* 🔥 PURCHASE MODAL */}
      {purchaseStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[320px] rounded-xl bg-card border shadow-xl p-6 text-center space-y-4 animate-in fade-in zoom-in">
            {purchaseStep !== "success" ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            ) : (
              <Check className="mx-auto h-10 w-10 text-green-500" />
            )}

            <p className="font-semibold">
              {purchaseStep === "processing" && "Processing NFT"}
              {purchaseStep === "validating" && "Validating NFT"}
              {purchaseStep === "confirming" && "Confirming availability"}
              {purchaseStep === "success" && "Purchase successful!"}
            </p>

            {purchaseStep === "success" && (
              <p className="text-xs text-muted-foreground">NFT added to your inventory</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
