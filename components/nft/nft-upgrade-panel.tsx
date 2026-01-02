"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import type {UserNFT, NFTTier, NFTUpgradeCombination} from "@/lib/types/phase2";
import {NFT_TIER_COLORS} from "@/lib/constants";
import {ArrowRight, Flame, Check, X} from "lucide-react";

interface NFTUpgradePanelProps {
  userNfts: UserNFT[];
  upgradeCombinations: NFTUpgradeCombination[] | [];
  userBalance: number;
  onUpgrade?: (nftIds: string[], targetTier: NFTTier) => Promise<void>;
  className?: string;
}

const TIER_ORDER: NFTTier[] = ["basic", "silver", "gold", "diamond", "legendary"];

export function NFTUpgradePanel({
  userNfts,
  upgradeCombinations,
  userBalance,
  onUpgrade,
  className,
}: NFTUpgradePanelProps) {
  const [selectedNfts, setSelectedNfts] = useState<string[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Group NFTs by tier (excluding equipped and burned)
  const nftsByTier = userNfts
    .filter((n) => !n.is_equipped && !n.is_burned && n.nft)
    .reduce((acc, nft) => {
      const tier = nft.nft!.tier as NFTTier;
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(nft);
      return acc;
    }, {} as Record<NFTTier, UserNFT[]>);

  // Find available upgrade for selected NFTs
  const getAvailableUpgrade = () => {
    if (selectedNfts.length !== 3) return null;

    const firstNft = userNfts.find((n) => n.id === selectedNfts[0]);
    if (!firstNft?.nft) return null;

    const selectedTier = firstNft.nft.tier as NFTTier;

    // Check all selected are same tier
    const allSameTier = selectedNfts.every((id) => {
      const nft = userNfts.find((n) => n.id === id);
      return nft?.nft?.tier === selectedTier;
    });

    if (!allSameTier) return null;

    // Find matching upgrade combination
    return upgradeCombinations.find(
      (c) => c.input_tier === selectedTier && c.input_quantity === 3 && c.is_active
    );
  };

  const availableUpgrade = getAvailableUpgrade();
  const canAffordUpgrade = availableUpgrade ? userBalance >= availableUpgrade.vp_cost : false;

  const handleSelectNft = (nftId: string) => {
    setSelectedNfts((prev) => {
      if (prev.includes(nftId)) {
        return prev.filter((id) => id !== nftId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, nftId];
    });
  };

  const handleUpgrade = async () => {
    if (!onUpgrade || !availableUpgrade || selectedNfts.length !== 3) return;
    setIsUpgrading(true);
    try {
      await onUpgrade(selectedNfts, availableUpgrade.output_tier as NFTTier);
      setSelectedNfts([]);
    } finally {
      setIsUpgrading(false);
    }
  };

  const clearSelection = () => setSelectedNfts([]);

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          NFT Forge
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Combine 3 NFTs of the same tier to forge a higher tier NFT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Area */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((slot) => {
            const selectedNft = selectedNfts[slot]
              ? userNfts.find((n) => n.id === selectedNfts[slot])
              : null;
            const nft = selectedNft?.nft;
            const tierColors = nft ? NFT_TIER_COLORS[nft.tier as NFTTier] : null;

            return (
              <div
                key={slot}
                className={cn(
                  "w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center",
                  selectedNft ? tierColors?.border : "border-muted-foreground/30"
                )}>
                {selectedNft && nft ? (
                  <div className="relative w-full h-full">
                    <div
                      className={cn(
                        "w-full h-full rounded-lg flex items-center justify-center text-3xl",
                        tierColors?.bg
                      )}>
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
                    <button
                      onClick={() => handleSelectNft(selectedNft.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Slot {slot + 1}</span>
                )}
              </div>
            );
          })}

          <ArrowRight className="w-6 h-6 text-muted-foreground mx-2" />

          {/* Result */}
          <div
            className={cn(
              "w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center",
              availableUpgrade
                ? cn(
                    NFT_TIER_COLORS[availableUpgrade.output_tier as NFTTier].border,
                    NFT_TIER_COLORS[availableUpgrade.output_tier as NFTTier].bg
                  )
                : "border-muted-foreground/30"
            )}>
            {availableUpgrade ? (
              <>
                <span className="text-3xl">
                  {availableUpgrade.output_tier === "legendary"
                    ? "⚡"
                    : availableUpgrade.output_tier === "diamond"
                    ? "💎"
                    : availableUpgrade.output_tier === "gold"
                    ? "🏆"
                    : availableUpgrade.output_tier === "silver"
                    ? "🔧"
                    : "⛏️"}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold uppercase mt-1",
                    NFT_TIER_COLORS[availableUpgrade.output_tier as NFTTier].text
                  )}>
                  {availableUpgrade.output_tier}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">Select 3 NFTs</span>
            )}
          </div>
        </div>

        {/* Upgrade Cost & Button */}
        {availableUpgrade && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Forge Cost</p>
              <p className="font-bold text-primary">
                {availableUpgrade.vp_cost.toLocaleString()} VP
              </p>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={!canAffordUpgrade || isUpgrading}
              className="gap-2">
              <Flame className="w-4 h-4" />
              {isUpgrading ? "Forging..." : "Forge"}
            </Button>
          </div>
        )}

        {/* Available NFTs to Select */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select NFTs to Forge:</p>

          {TIER_ORDER.map((tier) => {
            const tierNfts = nftsByTier[tier];
            if (!tierNfts || tierNfts.length === 0) return null;

            const tierColors = NFT_TIER_COLORS[tier];

            return (
              <div key={tier} className="space-y-2">
                <p className={cn("text-xs font-medium uppercase", tierColors.text)}>
                  {tier} ({tierNfts.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {tierNfts.map((userNft) => {
                    const isSelected = selectedNfts.includes(userNft.id);
                    return (
                      <button
                        key={userNft.id}
                        onClick={() => handleSelectNft(userNft.id)}
                        disabled={!isSelected && selectedNfts.length >= 3}
                        className={cn(
                          "w-14 h-14 rounded-lg flex items-center justify-center text-2xl transition-all",
                          tierColors.bg,
                          tierColors.border,
                          "border-2",
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                          !isSelected && selectedNfts.length >= 3 && "opacity-50"
                        )}>
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Check className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        {tier === "legendary"
                          ? "⚡"
                          : tier === "diamond"
                          ? "💎"
                          : tier === "gold"
                          ? "🏆"
                          : tier === "silver"
                          ? "🔧"
                          : "⛏️"}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {Object.keys(nftsByTier).length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No NFTs available for forging. Purchase NFTs first!
            </p>
          )}
        </div>

        {selectedNfts.length > 0 && (
          <Button variant="outline" onClick={clearSelection} className="w-full bg-transparent">
            Clear Selection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
