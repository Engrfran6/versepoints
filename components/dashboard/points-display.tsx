"use client";

import {cn} from "@/lib/utils";
import {Coins} from "lucide-react";
import {useMemo} from "react";

interface PointsDisplayProps {
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
  isMining: boolean;
  points: number;
}

export function PointsDisplay({
  points,
  className,
  showIcon = true,
  isMining = false,
}: PointsDisplayProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );
  const formatted = formatter.format(points);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showIcon && (
        <div
          className={cn(
            "p-3 rounded-xl transition-all duration-500",
            isMining ? "bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-purple-500/10"
          )}>
          <Coins
            className={cn(
              "w-6 h-6 transition-colors",
              isMining ? "text-cyan-300" : "text-purple-400"
            )}
          />
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-1">VersePoints</p>

        <p
          className={cn(
            "text-3xl font-extrabold font-mono tabular-nums transition-colors",
            isMining ? "text-cyan-300" : "text-foreground"
          )}>
          {integerPart}
          <span
            className={cn(
              "align-super text-sm ml-0.5 transition-opacity",
              isMining ? "opacity-100" : "opacity-60"
            )}>
            .{decimalPart}
          </span>
        </p>
      </div>
    </div>
  );
}
