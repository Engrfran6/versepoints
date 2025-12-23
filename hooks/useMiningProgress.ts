"use client";

import {useEffect, useRef, useState} from "react";

const DAY_SECONDS = 24 * 60 * 60; // 86400

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
    // ❌ No mining session
    if (!miningStartedAt) {
      setVisualPoints(baseBalanceRef.current);
      setIsMiningNow(false);
      return;
    }

    const startTime = new Date(miningStartedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;

      // ⏱️ Clamp progress
      const progress = Math.min(Math.max(elapsedSeconds / DAY_SECONDS, 0), 1);

      // 💰 Accumulate
      setVisualPoints(baseBalanceRef.current + pendingPoints * progress);

      // 🔒 Mining state is ONLY time-based
      setIsMiningNow(progress < 1);

      // 🧹 Cleanup at exactly 24h
      if (progress >= 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick(); // immediate sync

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
