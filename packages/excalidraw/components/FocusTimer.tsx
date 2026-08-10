/** Workshop countdown timer in the top-right toolbar; local state only. */
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

import { useExcalidrawSetAppState } from "./App";
import { FilledButton } from "./FilledButton";
import { Island } from "./Island";
import { Popover } from "./Popover";
import { timerIcon } from "./icons";
import {
  FOCUS_TIMER_PRESETS_MINUTES,
  clampFocusTimerMinutes,
  createInitialFocusTimerState,
  expireFocusTimer,
  formatFocusTimerRemaining,
  getFocusTimerRemainingMs,
  isFocusTimerActive,
  pauseFocusTimer,
  resetFocusTimer,
  resumeFocusTimer,
  startFocusTimer,
} from "./focusTimerUtils";

import type { FocusTimerState } from "./focusTimerUtils";

import "./FocusTimer.scss";

const PANEL_WIDTH = 260;
const TICK_INTERVAL_MS = 200;

export const FocusTimer = () => {
  const [open, setOpen] = useState(false);
  const [timerState, setTimerState] = useState<FocusTimerState>(
    createInitialFocusTimerState,
  );
  const [, setTick] = useState(0);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const expiryNotifiedRef = useRef(false);
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();

  const remainingMs = getFocusTimerRemainingMs(timerState);
  const remainingLabel = formatFocusTimerRemaining(remainingMs);
  const timerActive = isFocusTimerActive(timerState);
  const canConfigureDuration =
    timerState.status === "idle" || timerState.status === "expired";

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
    if (timerState.status !== "running" || timerState.endsAt == null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextRemaining = getFocusTimerRemainingMs(timerState);
      if (nextRemaining <= 0) {
        setTimerState((current) => expireFocusTimer(current));
        return;
      }
      setTick(Date.now());
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [timerState]);

  useEffect(() => {
    if (timerState.status !== "expired" || expiryNotifiedRef.current) {
      return;
    }

    expiryNotifiedRef.current = true;
    setAppState({ toast: { message: t("focusTimer.expired"), duration: 5000 } });
  }, [timerState.status, setAppState]);

  useEffect(() => {
    if (timerState.status !== "expired") {
      expiryNotifiedRef.current = false;
    }
  }, [timerState.status]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handlePresetSelect = (minutes: number) => {
    if (!canConfigureDuration) {
      return;
    }
    setTimerState((current) => ({
      ...current,
      durationMinutes: minutes,
    }));
  };

  const handleCustomMinutesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    setTimerState((current) => ({
      ...current,
      durationMinutes: clampFocusTimerMinutes(parsed),
    }));
  };

  const handleStart = () => {
    setTimerState((current) => startFocusTimer(current));
  };

  const handlePause = () => {
    setTimerState((current) => pauseFocusTimer(current));
  };

  const handleResume = () => {
    setTimerState((current) => resumeFocusTimer(current));
  };

  const handleReset = () => {
    setTimerState(resetFocusTimer(timerState.durationMinutes));
  };

  return (
    <div className="FocusTimer" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimer__button", {
          active: open,
          running: timerState.status === "running",
          expired: timerState.status === "expired",
        })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("focusTimer.label")}
      >
        <span className="FocusTimer__icon">{timerIcon}</span>
        <span>{t("focusTimer.label")}</span>
        {timerActive && timerState.status !== "expired" && (
          <span className="FocusTimer__badge">{remainingLabel}</span>
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
            <div
              className={clsx("FocusTimer__display", {
                expired: timerState.status === "expired",
              })}
              aria-live="polite"
            >
              {remainingLabel}
            </div>
            {timerState.status === "expired" && (
              <div className="FocusTimer__expired-message">
                {t("focusTimer.timeUp")}
              </div>
            )}
            <div>
              <div className="FocusTimer__section-label">
                {t("focusTimer.presets")}
              </div>
              <div className="FocusTimer__presets">
                {FOCUS_TIMER_PRESETS_MINUTES.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={clsx("FocusTimer__preset", {
                      selected: timerState.durationMinutes === minutes,
                    })}
                    disabled={!canConfigureDuration}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => handlePresetSelect(minutes)}
                  >
                    {t("focusTimer.minutesShort", { count: minutes })}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="FocusTimer__section-label">
                {t("focusTimer.customDuration")}
              </div>
              <div className="FocusTimer__custom">
                <input
                  className="FocusTimer__custom-input"
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={timerState.durationMinutes}
                  disabled={!canConfigureDuration}
                  onPointerDown={(event) => event.stopPropagation()}
                  onChange={handleCustomMinutesChange}
                  aria-label={t("focusTimer.customDuration")}
                />
                <span className="FocusTimer__section-label">
                  {t("focusTimer.minutes")}
                </span>
              </div>
            </div>
            <div className="FocusTimer__controls">
              {(timerState.status === "idle" ||
                timerState.status === "expired") && (
                <FilledButton
                  className="FocusTimer__control"
                  label={t("focusTimer.start")}
                  onClick={handleStart}
                />
              )}
              {timerState.status === "running" && (
                <FilledButton
                  className="FocusTimer__control"
                  label={t("focusTimer.pause")}
                  variant="outlined"
                  onClick={handlePause}
                />
              )}
              {timerState.status === "paused" && (
                <FilledButton
                  className="FocusTimer__control"
                  label={t("focusTimer.resume")}
                  onClick={handleResume}
                />
              )}
              {timerActive && (
                <FilledButton
                  className="FocusTimer__control"
                  label={t("focusTimer.reset")}
                  variant="outlined"
                  color="muted"
                  onClick={handleReset}
                />
              )}
            </div>
          </Island>
        </Popover>
      )}
    </div>
  );
};
