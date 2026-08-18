/** Local workshop countdown timer — top-right overlay for timed brainstorming exercises. */
import { useCallback, useEffect, useRef, useState } from "react";

import "./FocusTimer.scss";

const PRESET_MINUTES = [1, 5, 10, 15] as const;
const TICK_MS = 250;
const DEFAULT_MINUTES = 5;

type TimerStatus = "idle" | "running" | "paused" | "expired";

const minutesToMs = (minutes: number) => Math.max(1, minutes) * 60 * 1000;

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const parseCustomMinutes = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return Math.min(parsed, 999);
};

const TimerIcon = () => (
  <svg
    className="focus-timer__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M9 3h6" />
    <path d="M12 3v2" />
  </svg>
);

export const FocusTimer = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES);
  const [customMinutes, setCustomMinutes] = useState("");
  const [remainingMs, setRemainingMs] = useState(
    minutesToMs(DEFAULT_MINUTES),
  );
  const [status, setStatus] = useState<TimerStatus>("idle");

  const endTimestampRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleExpiry = useCallback(() => {
    clearTick();
    endTimestampRef.current = null;
    setRemainingMs(0);
    setStatus("expired");
  }, [clearTick]);

  const tick = useCallback(() => {
    const end = endTimestampRef.current;
    if (end === null) {
      return;
    }

    // Recompute from wall-clock end time each tick to avoid interval drift.
    const nextRemaining = end - Date.now();
    if (nextRemaining <= 0) {
      handleExpiry();
      return;
    }

    setRemainingMs(nextRemaining);
  }, [handleExpiry]);

  const startInterval = useCallback(() => {
    clearTick();
    intervalRef.current = window.setInterval(tick, TICK_MS);
  }, [clearTick, tick]);

  const applyDuration = useCallback(
    (minutes: number) => {
      if (status === "running" || status === "paused") {
        return;
      }
      setSelectedMinutes(minutes);
      setCustomMinutes("");
      setRemainingMs(minutesToMs(minutes));
      setStatus("idle");
    },
    [status],
  );

  const getEffectiveMinutes = useCallback(() => {
    const custom = parseCustomMinutes(customMinutes);
    return custom ?? selectedMinutes;
  }, [customMinutes, selectedMinutes]);

  const start = useCallback(() => {
    const minutes = getEffectiveMinutes();
    const durationMs = minutesToMs(minutes);
    endTimestampRef.current = Date.now() + durationMs;
    setSelectedMinutes(minutes);
    setRemainingMs(durationMs);
    setStatus("running");
    startInterval();
  }, [getEffectiveMinutes, startInterval]);

  const pause = useCallback(() => {
    if (status !== "running" || endTimestampRef.current === null) {
      return;
    }

    const nextRemaining = Math.max(0, endTimestampRef.current - Date.now());
    clearTick();
    endTimestampRef.current = null;
    setRemainingMs(nextRemaining);
    setStatus("paused");
  }, [clearTick, status]);

  const resume = useCallback(() => {
    if (status !== "paused" || remainingMs <= 0) {
      return;
    }

    endTimestampRef.current = Date.now() + remainingMs;
    setStatus("running");
    startInterval();
  }, [remainingMs, startInterval, status]);

  const reset = useCallback(() => {
    clearTick();
    endTimestampRef.current = null;
    const minutes = getEffectiveMinutes();
    setRemainingMs(minutesToMs(minutes));
    setStatus("idle");
  }, [clearTick, getEffectiveMinutes]);

  useEffect(() => clearTick, [clearTick]);

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isExpired = status === "expired";
  const isActive = isRunning || isPaused || isExpired;
  const controlsLocked = isRunning || isPaused;

  const displayTime = formatRemaining(remainingMs);
  const triggerLabel = isActive ? displayTime : "Timer";

  return (
    <div className="focus-timer">
      <button
        type="button"
        className={`focus-timer__trigger${isActive ? " focus-timer__trigger--active" : ""}${isExpired ? " focus-timer__trigger--expired" : ""}`}
        aria-label="Workshop timer"
        aria-expanded={isPanelOpen}
        onClick={() => setIsPanelOpen((open) => !open)}
      >
        <TimerIcon />
        <span>{triggerLabel}</span>
      </button>

      {isPanelOpen && (
        <div className="focus-timer__panel" role="dialog" aria-label="Timer controls">
          <h2 className="focus-timer__title">Focus Timer</h2>

          {isExpired ? (
            <p className="focus-timer__expired-message" aria-live="polite">
              Time&apos;s up!
            </p>
          ) : (
            <p className="focus-timer__countdown" aria-live="polite">
              {displayTime}
            </p>
          )}

          <div className="focus-timer__presets" role="group" aria-label="Duration presets">
            {PRESET_MINUTES.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`focus-timer__preset${
                  selectedMinutes === minutes && !customMinutes
                    ? " focus-timer__preset--selected"
                    : ""
                }`}
                disabled={controlsLocked}
                onClick={() => applyDuration(minutes)}
              >
                {minutes}m
              </button>
            ))}
          </div>

          <label className="focus-timer__custom">
            Custom
            <input
              className="focus-timer__custom-input"
              type="number"
              min={1}
              max={999}
              placeholder="min"
              value={customMinutes}
              disabled={controlsLocked}
              onChange={(event) => {
                const value = event.target.value;
                setCustomMinutes(value);
                const parsed = parseCustomMinutes(value);
                if (parsed !== null) {
                  setSelectedMinutes(parsed);
                  setRemainingMs(minutesToMs(parsed));
                  setStatus("idle");
                }
              }}
            />
          </label>

          <div className="focus-timer__controls">
            {!isRunning && !isPaused && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--primary"
                onClick={start}
              >
                Start
              </button>
            )}
            {isRunning && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--secondary"
                onClick={pause}
              >
                Pause
              </button>
            )}
            {isPaused && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--primary"
                onClick={resume}
              >
                Resume
              </button>
            )}
            {(isRunning || isPaused || isExpired) && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--secondary"
                onClick={reset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
