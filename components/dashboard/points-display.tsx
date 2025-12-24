"use client";

import {useMiningProgress} from "@/hooks/useMiningProgress";
import {MINING_CONSTANTS} from "@/lib/constants";
import {cn} from "@/lib/utils";
import {Coins} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

interface PointsDisplayProps {
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
  userPoints: number;
  userLastMine: string | null;
}

export function PointsDisplay({
  userPoints,
  userLastMine,
  className,
  showIcon = true,
}: PointsDisplayProps) {
  const {visualPoints, isMiningNow} = useMiningProgress(
    userPoints,
    MINING_CONSTANTS.POINTS_PER_MINE ?? 0,
    userLastMine
  );

  const [displayPoints, setDisplayPoints] = useState(visualPoints);

  useEffect(() => {
    const diff = visualPoints - displayPoints;
    const steps = 30;
    const increment = diff / steps;
    let current = displayPoints;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setDisplayPoints(visualPoints);
        clearInterval(interval);
      } else {
        setDisplayPoints(current);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [visualPoints]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }),
    []
  );
  const formatted = formatter.format(displayPoints);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showIcon && (
        <div
          className={cn(
            "p-3 rounded-xl transition-all duration-500",
            isMiningNow
              ? "bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              : "bg-purple-500/10"
          )}>
          <Coins
            className={cn(
              "w-6 h-6 transition-colors",
              isMiningNow ? "text-cyan-300" : "text-purple-400"
            )}
          />
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-1">VersePoints</p>

        <p
          className={cn(
            "text-3xl font-extrabold font-mono tabular-nums transition-colors",
            isMiningNow ? "text-cyan-300" : "text-foreground"
          )}>
          {integerPart}

          {isMiningNow ? (
            <span
              className={cn(
                "align-super text-sm ml-0.5 transition-opacity",
                isMiningNow ? "opacity-100" : "opacity-60"
              )}>
              .{decimalPart}
            </span>
          ) : (
            displayPoints === 0 && <span>.00</span>
          )}
        </p>
      </div>
    </div>
  );
}
