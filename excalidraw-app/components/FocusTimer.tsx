import { useCallback, useEffect, useRef, useState } from "react";

import "./FocusTimer.scss";

/** Preset durations in minutes for workshop exercises. */
const PRESETS = [1, 5, 10, 15] as const;

const TICK_MS = 250;

type TimerStatus = "idle" | "running" | "paused" | "expired";

/** Format milliseconds as m:ss for the countdown readout. */
export const formatRemainingTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/** Best-effort short beep when the countdown reaches zero. */
const playExpiryBeep = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 440;
    gain.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio unavailable in some environments (e.g. headless tests).
  }
};

/** Workshop countdown overlay: presets, custom duration, Start/Pause/Resume/Reset. */
export const FocusTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [customMinutes, setCustomMinutes] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepedRef = useRef(false);

  const getDurationMs = useCallback((): number => {
    const trimmed = customMinutes.trim();
    if (trimmed) {
      const parsed = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed * 60 * 1000;
      }
    }
    return selectedMinutes * 60 * 1000;
  }, [customMinutes, selectedMinutes]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) {
      return;
    }

    const remaining = endTimeRef.current - Date.now();
    if (remaining <= 0) {
      setRemainingMs(0);
      setStatus("expired");
      clearTimerInterval();
      endTimeRef.current = null;
      if (!beepedRef.current) {
        beepedRef.current = true;
        playExpiryBeep();
      }
      return;
    }

    setRemainingMs(remaining);
  }, [clearTimerInterval]);

  const startInterval = useCallback(() => {
    clearTimerInterval();
    intervalRef.current = setInterval(tick, TICK_MS);
  }, [clearTimerInterval, tick]);

  const handleStart = () => {
    const duration = getDurationMs();
    if (duration <= 0) {
      return;
    }

    beepedRef.current = false;
    endTimeRef.current = Date.now() + duration;
    setRemainingMs(duration);
    setStatus("running");
    startInterval();
  };

  const handlePause = () => {
    if (endTimeRef.current === null) {
      return;
    }

    const remaining = endTimeRef.current - Date.now();
    setRemainingMs(Math.max(0, remaining));
    endTimeRef.current = null;
    clearTimerInterval();
    setStatus("paused");
  };

  const handleResume = () => {
    if (remainingMs <= 0) {
      return;
    }

    endTimeRef.current = Date.now() + remainingMs;
    setStatus("running");
    startInterval();
  };

  const handleReset = () => {
    clearTimerInterval();
    endTimeRef.current = null;
    beepedRef.current = false;
    setRemainingMs(0);
    setStatus("idle");
  };

  const handlePresetClick = (minutes: number) => {
    if (status !== "idle") {
      return;
    }
    setSelectedMinutes(minutes);
    setCustomMinutes("");
  };

  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  const displayMs =
    status === "idle" ? getDurationMs() : remainingMs;
  const isConfiguring = status === "idle";
  const panelClassName = [
    "focus-timer__panel",
    status === "expired" ? "focus-timer__panel--expired" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="focus-timer" data-testid="focus-timer">
      <button
        type="button"
        className="focus-timer__trigger"
        data-testid="focus-timer-trigger"
        aria-expanded={isOpen}
        aria-label="Focus timer"
        onClick={() => setIsOpen((open) => !open)}
      >
        Timer
      </button>

      {isOpen && (
        <div className={panelClassName} data-testid="focus-timer-panel">
          {status === "expired" ? (
            <p
              className="focus-timer__expired-label"
              data-testid="focus-timer-expired"
            >
              Time&apos;s up!
            </p>
          ) : (
            <p
              className="focus-timer__readout"
              data-testid="focus-timer-readout"
              aria-live="polite"
            >
              {formatRemainingTime(displayMs)}
            </p>
          )}

          {isConfiguring && (
            <>
              <div
                className="focus-timer__presets"
                data-testid="focus-timer-presets"
              >
                {PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`focus-timer__preset${
                      selectedMinutes === minutes && !customMinutes.trim()
                        ? " focus-timer__preset--selected"
                        : ""
                    }`}
                    data-testid={`focus-timer-preset-${minutes}`}
                    onClick={() => handlePresetClick(minutes)}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
              <label className="focus-timer__custom">
                <span className="focus-timer__custom-label">Custom (min)</span>
                <input
                  type="number"
                  min={1}
                  className="focus-timer__custom-input"
                  data-testid="focus-timer-custom-input"
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(event.target.value)}
                  placeholder="e.g. 3"
                />
              </label>
            </>
          )}

          <div className="focus-timer__controls">
            {status === "idle" && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--primary"
                data-testid="focus-timer-start"
                onClick={handleStart}
              >
                Start
              </button>
            )}
            {status === "running" && (
              <>
                <button
                  type="button"
                  className="focus-timer__control"
                  data-testid="focus-timer-pause"
                  onClick={handlePause}
                >
                  Pause
                </button>
                <button
                  type="button"
                  className="focus-timer__control"
                  data-testid="focus-timer-reset"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </>
            )}
            {status === "paused" && (
              <>
                <button
                  type="button"
                  className="focus-timer__control focus-timer__control--primary"
                  data-testid="focus-timer-resume"
                  onClick={handleResume}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="focus-timer__control"
                  data-testid="focus-timer-reset"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </>
            )}
            {status === "expired" && (
              <button
                type="button"
                className="focus-timer__control focus-timer__control--primary"
                data-testid="focus-timer-reset"
                onClick={handleReset}
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
