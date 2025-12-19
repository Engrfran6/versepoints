"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import type { RankName } from "@/lib/types/phase2";
import { RANK_COLORS } from "@/lib/constants";

const RANK_ICONS: Record<RankName, string> = {
  rookie: "/ranks/rookie.jpg",
  silver: "/ranks/silver.jpg",
  gold: "/ranks/gold.jpg",
  diamond: "/ranks/diamond.jpg",
  citizen: "/ranks/citizen.jpg",
};

interface RankBadgeProps {
  rank: RankName;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showGlow?: boolean;
  className?: string;
}

export function RankBadge({
  rank,
  size = "xl",
  showLabel = true,
  showGlow = true,
  className,
}: RankBadgeProps) {
  const colors = RANK_COLORS[rank];

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-32 h-32",
  };

  const imagePadding = {
    xs: "p-0.5",
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
    xl: "p-3",
  };

  const labelSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          sizeClasses[size],
          colors.bg,
          colors.border,
          "border-2 rounded-xl relative overflow-hidden",
          showGlow && `glow-${rank}`,
          "transition-all duration-300 hover:scale-110"
        )}
      >
        {/* Rank Image — fills container */}
        <div className={cn("absolute inset-0", imagePadding[size])}>
          <Image
            src={RANK_ICONS[rank]}
            alt={rank}
            fill
            priority
            className="object-cover rounded-lg p-1"
          />
        </div>

        {/* Shimmer for higher ranks */}
        {(rank === "gold" || rank === "diamond" || rank === "citizen") && (
          <div
            className="absolute inset-0 rounded-xl opacity-30 animate-shimmer pointer-events-none"
            style={{
              background: `linear-gradient(
                90deg,
                transparent,
                ${colors.hex}55,
                transparent
              )`,
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </div>

      {showLabel && (
        <span
          className={cn(
            labelSizes[size],
            colors.text,
            "font-bold uppercase tracking-wider"
          )}
        >
          {rank}
        </span>
      )}
    </div>
  );
}
