"use client";

import {useEffect, useRef, useState} from "react";

const DAY_SECONDS = 24 * 60 * 60; // 86400

export function useMiningProgress(
  committedBalance: number,
  pendingPoints: number,
  miningStartedAt?: string | null,
  isMiningEnabled: boolean = true
) {
  const [visualPoints, setVisualPoints] = useState(committedBalance);
  const [isMiningNow, setIsMiningNow] = useState(false);

  const baseBalanceRef = useRef(committedBalance);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    baseBalanceRef.current = committedBalance;
  }, [committedBalance]);

  useEffect(() => {
    // 🚫 Mining disabled at user level
    if (!isMiningEnabled) {
      setVisualPoints(baseBalanceRef.current);
      setIsMiningNow(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    // 🚫 No mining session
    if (!miningStartedAt) {
      setVisualPoints(baseBalanceRef.current);
      setIsMiningNow(false);
      return;
    }

    const startTime = new Date(miningStartedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;

      const progress = Math.min(Math.max(elapsedSeconds / DAY_SECONDS, 0), 1);

      // 💡 pendingPoints ONLY count if mining is enabled
      const effectivePending = isMiningEnabled ? pendingPoints : 0;

      setVisualPoints(baseBalanceRef.current + effectivePending * progress);

      setIsMiningNow(progress < 1);

      if (progress >= 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingPoints, miningStartedAt, isMiningEnabled]);

  return {visualPoints, isMiningNow};
}
