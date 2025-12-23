"use client";

import {useEffect, useRef, useState} from "react";

const DAY_SECONDS = 86400;

export function useMiningProgress(
  committedBalance: number,
  pendingPoints: number,
  miningStartedAt?: string | null
) {
  const [visualPoints, setVisualPoints] = useState(committedBalance);
  const [isMiningNow, setIsMiningNow] = useState(false);

  const baseBalanceRef = useRef(committedBalance);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    baseBalanceRef.current = committedBalance;
  }, [committedBalance]);

  useEffect(() => {
    if (!pendingPoints || !miningStartedAt) {
      setVisualPoints(baseBalanceRef.current);
      setIsMiningNow(false);
      return;
    }

    const startTime = new Date(miningStartedAt).getTime();
    setIsMiningNow(true);

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, (now - startTime) / 1000);
      const progress = Math.min(elapsedSeconds / DAY_SECONDS, 1);

      const earnedSoFar = progress * pendingPoints;
      setVisualPoints(baseBalanceRef.current + earnedSoFar);

      // ✅ stop exactly at 24h
      if (progress >= 1) {
        setIsMiningNow(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    tick(); // initial sync
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingPoints, miningStartedAt]);

  return {visualPoints, isMiningNow};
}
