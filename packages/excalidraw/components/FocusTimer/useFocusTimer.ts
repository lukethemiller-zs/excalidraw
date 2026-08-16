import { useCallback, useEffect, useRef, useState } from "react";

/** Workshop timer tick interval (~4×/sec for smooth mm:ss display). */
const TICK_MS = 250;

export type FocusTimerStatus = "idle" | "running" | "paused" | "expired";

export const FOCUS_TIMER_PRESET_MINUTES = [1, 5, 10, 15] as const;

export const minutesToMs = (minutes: number) => minutes * 60 * 1000;

export const formatRemainingMs = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/** Local countdown state; uses endTime timestamps to avoid interval drift. */
export const useFocusTimer = (onExpire?: () => void) => {
  const defaultDurationMs = minutesToMs(FOCUS_TIMER_PRESET_MINUTES[0]);
  const [status, setStatus] = useState<FocusTimerStatus>("idle");
  const [durationMs, setDurationMsState] = useState(defaultDurationMs);
  const [remainingMs, setRemainingMs] = useState(defaultDurationMs);

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number>(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) {
      return;
    }

    const remaining = Math.max(0, endTimeRef.current - Date.now());
    setRemainingMs(remaining);

    if (remaining <= 0) {
      clearTick();
      endTimeRef.current = null;
      setStatus("expired");
      onExpireRef.current?.();
    }
  }, [clearTick]);

  const startInterval = useCallback(() => {
    clearTick();
    intervalRef.current = window.setInterval(tick, TICK_MS);
    tick();
  }, [clearTick, tick]);

  const setDuration = useCallback(
    (ms: number) => {
      if (status === "running" || status === "paused") {
        return;
      }

      const clamped = Math.max(1000, ms);
      setDurationMsState(clamped);
      setRemainingMs(clamped);
      setStatus("idle");
    },
    [status],
  );

  const start = useCallback(() => {
    if (status === "running") {
      return;
    }

    const msToRun = status === "expired" ? durationMs : remainingMs;
    endTimeRef.current = Date.now() + msToRun;
    setRemainingMs(msToRun);
    setStatus("running");
    startInterval();
  }, [durationMs, remainingMs, startInterval, status]);

  const pause = useCallback(() => {
    if (status !== "running" || endTimeRef.current === null) {
      return;
    }

    clearTick();
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    endTimeRef.current = null;
    setRemainingMs(remaining);
    setStatus("paused");
  }, [clearTick, status]);

  const resume = useCallback(() => {
    if (status !== "paused") {
      return;
    }

    endTimeRef.current = Date.now() + remainingMs;
    setStatus("running");
    startInterval();
  }, [remainingMs, startInterval, status]);

  const reset = useCallback(() => {
    clearTick();
    endTimeRef.current = null;
    setRemainingMs(durationMs);
    setStatus("idle");
  }, [clearTick, durationMs]);

  useEffect(() => () => clearTick(), [clearTick]);

  const canEditDuration = status === "idle" || status === "expired";

  return {
    status,
    remainingMs,
    durationMs,
    canEditDuration,
    setDuration,
    start,
    pause,
    resume,
    reset,
  };
};
