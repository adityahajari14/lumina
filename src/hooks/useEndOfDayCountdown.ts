"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once a fixed target has passed. Never true for the end-of-day countdown. */
  expired: boolean;
  /** Browser time at the latest tick; null until hydration has completed. */
  now: Date | null;
}

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function getSecondsUntil(target: Date): number {
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
}

function formatTimeLeft(totalSeconds: number, expired: boolean, now: Date): TimeLeft {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired, now };
}

/** Counts down to `target`, or to the visitor's next midnight when no target is given. */
export function useCountdown(target: Date | null = null): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, now: null });

  useEffect(() => {
    const tick = () => {
      const totalSeconds = target ? getSecondsUntil(target) : getSecondsUntilMidnight();
      setTimeLeft(formatTimeLeft(totalSeconds, Boolean(target) && totalSeconds === 0, new Date()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

export function useEndOfDayCountdown(): TimeLeft {
  return useCountdown();
}
