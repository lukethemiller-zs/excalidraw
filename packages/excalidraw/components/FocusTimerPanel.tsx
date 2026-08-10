/** Workshop countdown timer in the top-right UI: presets, custom duration, and controls. Local-only; no collab sync. */
import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { useUIAppState } from "../context/ui-appState";
import { t } from "../i18n";

import { useExcalidrawSetAppState } from "./App";
import { Island } from "./Island";
import { Popover } from "./Popover";

import {
  TIMER_PRESETS,
  canEditDuration,
  clampCustomMinutes,
  createInitialTimerState,
  focusTimerReducer,
  formatRemaining,
  minutesToSeconds,
} from "./focusTimerUtils";

import "./FocusTimerPanel.scss";

const PANEL_WIDTH = 280;
const TOAST_DURATION_MS = 5000;

export const FocusTimerPanel = () => {
  const [open, setOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(String(TIMER_PRESETS[1]));
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<
    number | null
  >(TIMER_PRESETS[1]);
  const [timerState, dispatch] = useReducer(
    focusTimerReducer,
    undefined,
    createInitialTimerState,
  );
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const anchorRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef(timerState.status);
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();

  const { durationSeconds, remainingSeconds, status } = timerState;
  const durationEditable = canEditDuration(status);
  const selectedMinutes = durationSeconds / 60;

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
    if (status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (
      timerState.status === "expired" &&
      prevStatusRef.current === "running"
    ) {
      setAppState({
        toast: {
          message: t("focusTimer.timeUp"),
          duration: TOAST_DURATION_MS,
          closable: true,
        },
      });
    }
    prevStatusRef.current = timerState.status;
  }, [timerState.status, setAppState]);

  const handleClose = useCallback(() => setOpen(false), []);

  const applyDurationMinutes = useCallback((minutes: number) => {
    const clampedMinutes = clampCustomMinutes(minutes);
    dispatch({
      type: "SET_DURATION",
      durationSeconds: minutesToSeconds(clampedMinutes),
    });
    setCustomMinutes(String(clampedMinutes));
    setSelectedPresetMinutes(
      TIMER_PRESETS.includes(clampedMinutes as (typeof TIMER_PRESETS)[number])
        ? clampedMinutes
        : null,
    );
  }, []);

  const handlePresetClick = (minutes: number) => {
    if (!durationEditable) {
      return;
    }
    setSelectedPresetMinutes(minutes);
    applyDurationMinutes(minutes);
  };

  const handleCustomMinutesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomMinutes(event.target.value);
    setSelectedPresetMinutes(null);
  };

  const handleCustomMinutesBlur = () => {
    if (!durationEditable) {
      return;
    }

    const parsed = Number.parseInt(customMinutes, 10);
    if (Number.isNaN(parsed)) {
      setCustomMinutes(String(selectedMinutes));
      return;
    }

    applyDurationMinutes(parsed);
  };

  const handleCustomMinutesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  const buttonLabel =
    status === "idle"
      ? t("focusTimer.label")
      : `⏱ ${formatRemaining(remainingSeconds)}`;

  return (
    <div className="FocusTimerPanel" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimerPanel__button", {
          active: open,
          running: status === "running",
          paused: status === "paused",
          expired: status === "expired",
        })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("focusTimer.label")}
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
          className="FocusTimerPanel__popover"
        >
          <Island padding={2} className="FocusTimerPanel__panel">
            <div className="FocusTimerPanel__title">{t("focusTimer.title")}</div>
            <div
              className={clsx("FocusTimerPanel__countdown", {
                expired: status === "expired",
              })}
              aria-live="polite"
            >
              {formatRemaining(remainingSeconds)}
            </div>

            <div className="FocusTimerPanel__presets">
              {TIMER_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={clsx("FocusTimerPanel__preset", {
                    selected: selectedPresetMinutes === minutes,
                  })}
                  disabled={!durationEditable}
                  onClick={() => handlePresetClick(minutes)}
                >
                  {t("focusTimer.minutesShort", { minutes })}
                </button>
              ))}
            </div>

            <label className="FocusTimerPanel__custom">
              <span>{t("focusTimer.custom")}</span>
              <input
                type="number"
                min={1}
                max={120}
                className="FocusTimerPanel__custom-input"
                value={customMinutes}
                disabled={!durationEditable}
                onChange={handleCustomMinutesChange}
                onBlur={handleCustomMinutesBlur}
                onKeyDown={handleCustomMinutesKeyDown}
                aria-label={t("focusTimer.custom")}
              />
              <span>{t("focusTimer.minutes")}</span>
            </label>

            <div className="FocusTimerPanel__controls">
              {(status === "idle" || status === "expired") && (
                <button
                  type="button"
                  className="FocusTimerPanel__control FocusTimerPanel__control--primary"
                  onClick={() => dispatch({ type: "START" })}
                >
                  {t("focusTimer.start")}
                </button>
              )}
              {status === "running" && (
                <button
                  type="button"
                  className="FocusTimerPanel__control"
                  onClick={() => dispatch({ type: "PAUSE" })}
                >
                  {t("focusTimer.pause")}
                </button>
              )}
              {status === "paused" && (
                <button
                  type="button"
                  className="FocusTimerPanel__control FocusTimerPanel__control--primary"
                  onClick={() => dispatch({ type: "RESUME" })}
                >
                  {t("focusTimer.resume")}
                </button>
              )}
              {status !== "idle" && (
                <button
                  type="button"
                  className="FocusTimerPanel__control"
                  onClick={() => dispatch({ type: "RESET" })}
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
