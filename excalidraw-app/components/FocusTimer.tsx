/** Workshop countdown in the top-right UI: presets, custom duration, Start/Pause/Resume/Reset.
 *  Local React state only — no collab sync, persistence, or canvas side-effects. */
import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Island } from "@excalidraw/excalidraw/components/Island";
import { Popover } from "@excalidraw/excalidraw/components/Popover";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";

import "./FocusTimer.scss";

const PRESETS_MINUTES = [1, 5, 10, 15] as const;
const PANEL_WIDTH = 280;
const TICK_MS = 250;

type TimerStatus = "idle" | "running" | "paused" | "expired";

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const playExpiryBeep = () => {
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof window.AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
    oscillator.onended = () => {
      void ctx.close();
    };
  } catch {
    // Audio is optional; ignore failures (autoplay policies, etc.)
  }
};

export const FocusTimer = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<number>(1);
  const [customMinutes, setCustomMinutes] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const anchorRef = useRef<HTMLDivElement>(null);
  const appState = useUIAppState();

  const handleClose = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - PANEL_WIDTH),
      });
    }
  }, [open]);

  useEffect(() => {
    if (status !== "running" || endTime === null) {
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        setStatus("expired");
        setEndTime(null);
        playExpiryBeep();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [status, endTime]);

  const resolveDurationMs = () => {
    const custom = parseInt(customMinutes, 10);
    if (customMinutes.trim() && !Number.isNaN(custom) && custom > 0) {
      return custom * 60 * 1000;
    }
    return selectedMinutes * 60 * 1000;
  };

  const handleStart = () => {
    const durationMs = resolveDurationMs();
    setRemainingMs(durationMs);
    setEndTime(Date.now() + durationMs);
    setStatus("running");
  };

  const handlePause = () => {
    if (endTime === null) {
      return;
    }
    setRemainingMs(Math.max(0, endTime - Date.now()));
    setEndTime(null);
    setStatus("paused");
  };

  const handleResume = () => {
    setEndTime(Date.now() + remainingMs);
    setStatus("running");
  };

  const handleReset = () => {
    setStatus("idle");
    setEndTime(null);
    setRemainingMs(0);
  };

  const isActive = status === "running" || status === "paused";
  const buttonLabel =
    status === "expired"
      ? "Time's up!"
      : isActive
      ? formatRemaining(remainingMs)
      : "⏱ Timer";

  return (
    <div className="FocusTimer" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimer__button", {
          active: open,
          running: status === "running",
          paused: status === "paused",
          expired: status === "expired",
        })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Focus timer for workshops"
      >
        {buttonLabel}
      </button>
      {open && popoverPos && (
        <Popover
          top={popoverPos.top}
          left={popoverPos.left}
          fitInViewport
          offsetLeft={appState.offsetLeft}
          offsetTop={appState.offsetTop}
          viewportWidth={appState.width}
          viewportHeight={appState.height}
          onCloseRequest={handleClose}
          className="FocusTimer__popover"
        >
          <Island padding={2} className="FocusTimer__panel">
            <div className="FocusTimer__title">Focus timer</div>
            {status === "expired" && (
              <div className="FocusTimer__expired" role="status">
                Time&apos;s up!
              </div>
            )}
            {(status === "running" || status === "paused") && (
              <div
                className={clsx("FocusTimer__display", {
                  "FocusTimer__display--paused": status === "paused",
                })}
                aria-live="polite"
              >
                {formatRemaining(remainingMs)}
              </div>
            )}
            {status !== "running" && (
              <>
                <div className="FocusTimer__presets">
                  {PRESETS_MINUTES.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      className={clsx("FocusTimer__preset", {
                        selected:
                          selectedMinutes === minutes && !customMinutes.trim(),
                      })}
                      onClick={() => {
                        setSelectedMinutes(minutes);
                        setCustomMinutes("");
                      }}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
                <label className="FocusTimer__custom">
                  <span className="FocusTimer__custom-label">Custom (min)</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={customMinutes}
                    onChange={(event) => setCustomMinutes(event.target.value)}
                    placeholder="e.g. 3"
                    className="FocusTimer__custom-input"
                  />
                </label>
              </>
            )}
            <div className="FocusTimer__controls">
              {status === "idle" || status === "expired" ? (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onClick={handleStart}
                >
                  Start
                </button>
              ) : status === "running" ? (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onClick={handlePause}
                >
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onClick={handleResume}
                >
                  Resume
                </button>
              )}
              {status !== "idle" && (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </div>
          </Island>
        </Popover>
      )}
    </div>
  );
};
