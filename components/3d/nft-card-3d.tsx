"use client";

import { cn } from "@/lib/utils";
import type { NFTTier } from "@/lib/types/phase2";

const TIER_STYLES: Record<NFTTier, string> = {
  basic: "border-gray-500/40 shadow-gray-500/20",
  silver: "border-slate-300/50 shadow-slate-300/30",
  gold: "border-yellow-400/60 shadow-yellow-400/40",
  diamond: "border-blue-400/60 shadow-blue-400/40",
  legendary: "border-purple-500/70 shadow-purple-500/50",
};

interface NFTCardVisualProps {
  name: string;
  tier: NFTTier;
  imageUrl?: string;
  className?: string;
}

export function NFTCardVisual({
  name,
  tier,
  imageUrl,
  className,
}: NFTCardVisualProps) {
  return (
    <div
      className={cn(
        "relative w-20 h-32 rounded-xl overflow-hidden",
        "border-2 transition-all duration-300",
        "bg-muted",
        "hover:-translate-y-1 hover:scale-[1.03]",
        "hover:shadow-xl",
        TIER_STYLES[tier],
        className
      )}
    >
      {/* IMAGE */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            ⛏️
          </div>
        )}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* LEGENDARY GLOW */}
      {tier === "legendary" && (
        <div className="absolute inset-0 animate-pulse bg-purple-500/10" />
      )}

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col justify-between p-3 text-white">
        {/* Tier */}
        <span className="self-start rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          {tier}
        </span>

        {/* Name */}
        <div>
          <h3 className="text-sm font-bold leading-tight line-clamp-2">
            {name}
          </h3>
        </div>
      </div>
    </div>
  );
}
