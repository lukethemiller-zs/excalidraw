/** Workshop countdown timer: local Layer UI chrome with no scene or AppState side-effects. */
import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useUIAppState } from "../context/ui-appState";
import { t } from "../i18n";

import { Island } from "./Island";
import { timerIcon } from "./icons";
import { Popover } from "./Popover";

import "./FocusTimer.scss";

const PRESETS_MINUTES = [1, 5, 10, 15, 60, 120] as const;
const PANEL_WIDTH = 260;
const TICK_MS = 250;

type TimerStatus = "idle" | "running" | "paused" | "expired";

/** Format milliseconds as MM:SS, or H:MM:SS when an hour or more remains. */
const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const FocusTimer = ({ onExpire }: { onExpire: () => void }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [, setTick] = useState(0);
  const hasExpiredRef = useRef(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const appState = useUIAppState();

  const getRemainingMs = useCallback((): number => {
    if (status === "running" && endsAt !== null) {
      return Math.max(0, endsAt - Date.now());
    }
    if (status === "paused" || status === "expired") {
      return remainingMs;
    }
    return 0;
  }, [status, endsAt, remainingMs]);

  // Re-render while running; transition to expired when wall-clock endsAt is reached.
  useEffect(() => {
    if (status !== "running" || endsAt === null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const left = endsAt - Date.now();
      if (left <= 0) {
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          setRemainingMs(0);
          setStatus("expired");
          onExpire();
        }
        return;
      }
      setTick((n) => n + 1);
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [status, endsAt, onExpire]);

  useLayoutEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - PANEL_WIDTH),
      });
    }
  }, [open]);

  const handleClose = useCallback(() => setOpen(false), []);

  const hasCustomDuration = customHours.trim() !== "" || customMinutes.trim() !== "";

  const getDurationMs = (): number => {
    if (hasCustomDuration) {
      const hours = parseInt(customHours, 10);
      const minutes = parseInt(customMinutes, 10);
      const totalMinutes =
        (Number.isNaN(hours) ? 0 : Math.max(0, hours)) * 60 +
        (Number.isNaN(minutes) ? 0 : Math.max(0, minutes));
      if (totalMinutes > 0) {
        return totalMinutes * 60 * 1000;
      }
    }
    const minutes = selectedPreset ?? 5;
    return minutes * 60 * 1000;
  };

  const handleStart = () => {
    hasExpiredRef.current = false;
    const durationMs = getDurationMs();
    setEndsAt(Date.now() + durationMs);
    setRemainingMs(durationMs);
    setStatus("running");
  };

  const handlePause = () => {
    if (status !== "running" || endsAt === null) {
      return;
    }
    const left = Math.max(0, endsAt - Date.now());
    setRemainingMs(left);
    setEndsAt(null);
    setStatus("paused");
  };

  const handleResume = () => {
    if (status !== "paused" || remainingMs <= 0) {
      return;
    }
    hasExpiredRef.current = false;
    setEndsAt(Date.now() + remainingMs);
    setStatus("running");
  };

  const handleReset = () => {
    hasExpiredRef.current = false;
    setEndsAt(null);
    setRemainingMs(0);
    setStatus("idle");
  };

  const displayTime =
    status === "idle" ? null : formatRemaining(getRemainingMs());
  const isActive = status === "running" || status === "paused";
  const canConfigure = status === "idle" || status === "expired";

  return (
    <div className="FocusTimer" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimer__button", {
          active: open,
          "FocusTimer__button--running": isActive,
          "FocusTimer__button--expired": status === "expired",
        })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("focusTimer.title")}
        title={t("focusTimer.title")}
      >
        <span className="FocusTimer__button-icon">{timerIcon}</span>
        {displayTime && (
          <span className="FocusTimer__button-time">{displayTime}</span>
        )}
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
            <div className="FocusTimer__title">{t("focusTimer.title")}</div>

            {displayTime && (
              <div
                className={clsx("FocusTimer__display", {
                  "FocusTimer__display--expired": status === "expired",
                })}
                aria-live="polite"
              >
                {displayTime}
              </div>
            )}

            {canConfigure && (
              <>
                <div className="FocusTimer__presets">
                  {PRESETS_MINUTES.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      className={clsx("FocusTimer__preset", {
                        selected:
                          selectedPreset === minutes && !hasCustomDuration,
                      })}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        setSelectedPreset(minutes);
                        setCustomHours("");
                        setCustomMinutes("");
                      }}
                    >
                      {t(
                        `focusTimer.preset${minutes}` as
                          | "focusTimer.preset1"
                          | "focusTimer.preset5"
                          | "focusTimer.preset10"
                          | "focusTimer.preset15"
                          | "focusTimer.preset60"
                          | "focusTimer.preset120",
                      )}
                    </button>
                  ))}
                </div>
                <fieldset className="FocusTimer__custom">
                  <legend className="FocusTimer__custom-label">
                    {t("focusTimer.customDuration")}
                  </legend>
                  <div className="FocusTimer__custom-fields">
                    <label className="FocusTimer__custom-field">
                      <span className="FocusTimer__custom-field-label">
                        {t("focusTimer.customHours")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        className="FocusTimer__custom-input"
                        value={customHours}
                        onPointerDown={(event) => event.stopPropagation()}
                        onChange={(event) => {
                          setCustomHours(event.target.value);
                          if (event.target.value) {
                            setSelectedPreset(null);
                          }
                        }}
                        placeholder="0"
                      />
                    </label>
                    <label className="FocusTimer__custom-field">
                      <span className="FocusTimer__custom-field-label">
                        {t("focusTimer.customMinutesShort")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        className="FocusTimer__custom-input"
                        value={customMinutes}
                        onPointerDown={(event) => event.stopPropagation()}
                        onChange={(event) => {
                          setCustomMinutes(event.target.value);
                          if (event.target.value) {
                            setSelectedPreset(null);
                          }
                        }}
                        placeholder="5"
                      />
                    </label>
                  </div>
                </fieldset>
              </>
            )}

            <div className="FocusTimer__controls">
              {status === "idle" && (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handleStart}
                >
                  {t("focusTimer.start")}
                </button>
              )}
              {status === "running" && (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handlePause}
                >
                  {t("focusTimer.pause")}
                </button>
              )}
              {status === "paused" && (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handleResume}
                >
                  {t("focusTimer.resume")}
                </button>
              )}
              {status === "expired" && (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handleReset}
                >
                  {t("focusTimer.reset")}
                </button>
              )}
              {(status === "running" || status === "paused") && (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={handleReset}
                >
                  {t("focusTimer.reset")}
                </button>
              )}
            </div>
          </Island>
        </Popover>
      )}
    </div>
  );
};
