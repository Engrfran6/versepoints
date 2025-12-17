"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldPlus, Award, Gem } from "lucide-react";
import Image from "next/image";
import type { RankName } from "@/lib/types/phase2";
import { RANK_COLORS } from "@/lib/constants";

const RANK_ICONS: Record<RankName, any> = {
  rookie: Shield,
  silver: ShieldPlus,
  gold: Award,
  diamond: Gem,
  citizen: "/logo.png", // can be local path or remote URL
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
  size = "md",
  showLabel = true,
  showGlow = true,
  className,
}: RankBadgeProps) {
  const IconOrImage = RANK_ICONS[rank];
  const colors = RANK_COLORS[rank];

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const labelSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const isImage = typeof IconOrImage === "string";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          sizeClasses[size],
          colors.bg,
          colors.border,
          "border-2 rounded-xl flex items-center justify-center relative",
          showGlow && `glow-${rank}`,
          "transition-all duration-300 hover:scale-110"
        )}
      >
        {isImage ? (
          <Image
            src={IconOrImage}
            alt={rank}
            width={iconSizes[size]}
            height={iconSizes[size]}
            className="rounded-xl"
          />
        ) : (
          <IconOrImage
            className={cn(
              `w-${iconSizes[size]} h-${iconSizes[size]}`,
              colors.text,
              "animate-glow-rank"
            )}
          />
        )}

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
