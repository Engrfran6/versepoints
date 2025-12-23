"use client";

import {useEffect, useRef, useState} from "react";

const DAY_SECONDS = 86400;

export function useMiningProgress(
  committedBalance: number,
  pendingPoints: number,
  miningStartedAt?: string | null
) {
  const [visualPoints, setVisualPoints] = useState(committedBalance);

  // 🔒 Freeze the committed balance at hook mount
  const baseBalanceRef = useRef(committedBalance);

  useEffect(() => {
    baseBalanceRef.current = committedBalance;
  }, [committedBalance]);

  useEffect(() => {
    if (!pendingPoints || !miningStartedAt) {
      setVisualPoints(baseBalanceRef.current);
      return;
    }

    const startTime = new Date(miningStartedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, (now - startTime) / 1000);

      const progress = Math.min(elapsedSeconds / DAY_SECONDS, 1);

      const earnedSoFar = progress * pendingPoints;

      setVisualPoints(baseBalanceRef.current + earnedSoFar);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [pendingPoints, miningStartedAt]);

  return visualPoints;
}
