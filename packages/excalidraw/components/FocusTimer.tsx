/** Workshop countdown timer: local ephemeral UI, no scene or AppState mutations. */
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

import { timerIcon } from "./icons";
import { Island } from "./Island";
import { Popover } from "./Popover";

import {
  PRESET_MINUTES,
  formatRemainingMs,
  getRemainingMs,
  minutesToMs,
  parseCustomDuration,
} from "./FocusTimerUtils";

import type { TimerStatus } from "./FocusTimerUtils";

import "./FocusTimer.scss";

const PANEL_WIDTH = 260;
const TICK_MS = 250;

interface FocusTimerProps {
  /** Called once when the countdown reaches zero (e.g. to show a toast). */
  onExpired?: () => void;
}

export const FocusTimer = ({ onExpired }: FocusTimerProps) => {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [pausedRemainingMs, setPausedRemainingMs] = useState<number | null>(
    null,
  );
  const [durationMs, setDurationMs] = useState(minutesToMs(5));
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<
    number | null
  >(5);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [displayRemainingMs, setDisplayRemainingMs] = useState(
    minutesToMs(5),
  );

  const anchorRef = useRef<HTMLDivElement>(null);
  const onExpiredRef = useRef(onExpired);
  const hasFiredExpiredRef = useRef(false);
  const appState = useUIAppState();

  onExpiredRef.current = onExpired;

  const hasCustomDuration =
    customHours.trim().length > 0 || customMinutes.trim().length > 0;
  const customDurationParsed = hasCustomDuration
    ? parseCustomDuration(customHours, customMinutes)
    : null;
  const customDurationInvalid =
    hasCustomDuration && customDurationParsed == null;
  const canStart =
    status === "idle" && durationMs > 0 && !customDurationInvalid;

  const updateDisplay = useCallback(() => {
    if (status === "idle") {
      setDisplayRemainingMs(durationMs);
      return;
    }
    setDisplayRemainingMs(
      getRemainingMs(status, endsAt, pausedRemainingMs, Date.now()),
    );
  }, [status, endsAt, pausedRemainingMs, durationMs]);

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
    updateDisplay();
  }, [updateDisplay]);

  useEffect(() => {
    if (status !== "running" || endsAt == null) {
      return;
    }

    const tick = () => {
      const remaining = getRemainingMs("running", endsAt, null, Date.now());
      setDisplayRemainingMs(remaining);

      if (remaining <= 0) {
        setStatus("expired");
        setEndsAt(null);
        if (!hasFiredExpiredRef.current) {
          hasFiredExpiredRef.current = true;
          onExpiredRef.current?.();
        }
      }
    };

    tick();
    const intervalId = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [status, endsAt]);

  const handleClose = useCallback(() => setOpen(false), []);

  const stopPointer = useCallback((event: React.PointerEvent) => {
    event.stopPropagation();
  }, []);

  const handleSelectPreset = (minutes: number) => {
    setSelectedPresetMinutes(minutes);
    setCustomHours("");
    setCustomMinutes("");
    setDurationMs(minutesToMs(minutes));
  };

  const applyCustomDuration = (hours: string, minutes: string) => {
    const parsed = parseCustomDuration(hours, minutes);
    if (parsed != null) {
      setSelectedPresetMinutes(null);
      setDurationMs(minutesToMs(parsed));
    }
  };

  const handleCustomHoursChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setCustomHours(value);
    applyCustomDuration(value, customMinutes);
  };

  const handleCustomMinutesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setCustomMinutes(value);
    applyCustomDuration(customHours, value);
  };

  const handleStart = () => {
    if (!canStart) {
      return;
    }
    hasFiredExpiredRef.current = false;
    const now = Date.now();
    setStatus("running");
    setEndsAt(now + durationMs);
    setPausedRemainingMs(null);
    setDisplayRemainingMs(durationMs);
  };

  const handlePause = () => {
    if (status !== "running" || endsAt == null) {
      return;
    }
    const remaining = getRemainingMs("running", endsAt, null, Date.now());
    setStatus("paused");
    setEndsAt(null);
    setPausedRemainingMs(remaining);
    setDisplayRemainingMs(remaining);
  };

  const handleResume = () => {
    if (status !== "paused" || pausedRemainingMs == null) {
      return;
    }
    hasFiredExpiredRef.current = false;
    setStatus("running");
    setEndsAt(Date.now() + pausedRemainingMs);
    setPausedRemainingMs(null);
  };

  const handleReset = () => {
    hasFiredExpiredRef.current = false;
    setStatus("idle");
    setEndsAt(null);
    setPausedRemainingMs(null);
    setDisplayRemainingMs(durationMs);
  };

  const showBadge = status === "running" || status === "paused";
  const showPresets = status === "idle";

  return (
    <div className="FocusTimer" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimer__button", {
          active: open,
          "FocusTimer__button--running": showBadge,
          "FocusTimer__button--expired": status === "expired",
        })}
        onPointerDown={stopPointer}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid="focus-timer-trigger"
      >
        <span className="FocusTimer__icon" aria-hidden="true">
          {timerIcon}
        </span>
        {t("timer.label")}
        {showBadge && (
          <span className="FocusTimer__badge" data-testid="focus-timer-badge">
            {formatRemainingMs(displayRemainingMs)}
          </span>
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
            <div className="FocusTimer__title">{t("timer.title")}</div>
            <div
              className={clsx("FocusTimer__display", {
                "FocusTimer__display--expired": status === "expired",
              })}
              data-testid="focus-timer-display"
            >
              {formatRemainingMs(displayRemainingMs)}
            </div>
            {status === "expired" && (
              <div className="FocusTimer__expired-message">
                {t("timer.expired")}
              </div>
            )}
            {showPresets && (
              <>
                <div className="FocusTimer__presets">
                  {PRESET_MINUTES.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      className={clsx("FocusTimer__preset", {
                        selected: selectedPresetMinutes === minutes,
                      })}
                      onPointerDown={stopPointer}
                      onClick={() => handleSelectPreset(minutes)}
                      data-testid={`focus-timer-preset-${minutes}`}
                    >
                      {t("timer.presetMinutes", { minutes })}
                    </button>
                  ))}
                </div>
                <div className="FocusTimer__custom">
                  <div className="FocusTimer__custom-label">
                    {t("timer.customDuration")}
                  </div>
                  <div className="FocusTimer__custom-fields">
                    <div className="FocusTimer__custom-field">
                      <label
                        className="FocusTimer__custom-sublabel"
                        htmlFor="focus-timer-custom-hours"
                      >
                        {t("timer.customHours")}
                      </label>
                      <input
                        id="focus-timer-custom-hours"
                        className={clsx("FocusTimer__custom-input", {
                          invalid: customDurationInvalid,
                        })}
                        type="number"
                        min={0}
                        max={23}
                        inputMode="numeric"
                        placeholder="0"
                        value={customHours}
                        onPointerDown={stopPointer}
                        onChange={handleCustomHoursChange}
                        data-testid="focus-timer-custom-hours"
                      />
                    </div>
                    <div className="FocusTimer__custom-field">
                      <label
                        className="FocusTimer__custom-sublabel"
                        htmlFor="focus-timer-custom-minutes"
                      >
                        {t("timer.customMinutes")}
                      </label>
                      <input
                        id="focus-timer-custom-minutes"
                        className={clsx("FocusTimer__custom-input", {
                          invalid: customDurationInvalid,
                        })}
                        type="number"
                        min={0}
                        max={59}
                        inputMode="numeric"
                        placeholder="15"
                        value={customMinutes}
                        onPointerDown={stopPointer}
                        onChange={handleCustomMinutesChange}
                        data-testid="focus-timer-custom-minutes"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="FocusTimer__controls">
              {status === "idle" && (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onPointerDown={stopPointer}
                  onClick={handleStart}
                  disabled={!canStart}
                  data-testid="focus-timer-start"
                >
                  {t("timer.start")}
                </button>
              )}
              {status === "running" && (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onPointerDown={stopPointer}
                  onClick={handlePause}
                  data-testid="focus-timer-pause"
                >
                  {t("timer.pause")}
                </button>
              )}
              {status === "paused" && (
                <button
                  type="button"
                  className="FocusTimer__control FocusTimer__control--primary"
                  onPointerDown={stopPointer}
                  onClick={handleResume}
                  data-testid="focus-timer-resume"
                >
                  {t("timer.resume")}
                </button>
              )}
              {status !== "idle" && (
                <button
                  type="button"
                  className="FocusTimer__control"
                  onPointerDown={stopPointer}
                  onClick={handleReset}
                  data-testid="focus-timer-reset"
                >
                  {t("timer.reset")}
                </button>
              )}
            </div>
          </Island>
        </Popover>
      )}
    </div>
  );
};
