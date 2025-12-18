"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

interface PointsDisplayProps {
  points: number;
  className?: string;
  showIcon?: boolean;
  animate?: boolean;
}

export function PointsDisplay({
  points,
  className,
  showIcon = true,
  animate = false,
}: PointsDisplayProps) {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  useEffect(() => {
    if (!animate || points === displayPoints) {
      setDisplayPoints(points);
      return;
    }

    setIsAnimating(true);

    const diff = points - displayPoints;
    const steps = 30;
    const increment = diff / steps;

    let current = displayPoints;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setDisplayPoints(points);
        setIsAnimating(false);
        clearInterval(interval);
      } else {
        setDisplayPoints(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [points, animate]);

  // ✅ Format & split
  const formatted = formatter.format(displayPoints);
  const [integerPart, decimalPart] = formatted.split(".");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div
          className={cn(
            "p-2 rounded-lg bg-primary/10",
            isAnimating && "animate-bounce"
          )}
        >
          <Coins className="w-6 h-6 text-primary" />
        </div>
      )}

      <div>
        <p className="text-sm text-muted-foreground">VersePoints</p>
        <p
          className={cn(
            "text-3xl font-bold text-foreground font-mono tabular-nums leading-none",
            isAnimating && "text-primary"
          )}
        >
          {integerPart}
          <sup className="text-sm font-medium text-muted-foreground ml-0.5">
            .{decimalPart}
          </sup>
        </p>
      </div>
    </div>
  );
}
