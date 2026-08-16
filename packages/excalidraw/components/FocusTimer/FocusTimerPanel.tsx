import clsx from "clsx";
import React from "react";

import { t } from "../../i18n";

import {
  FOCUS_TIMER_PRESET_MINUTES,
  formatRemainingMs,
  minutesToMs,
} from "./useFocusTimer";

import type { FocusTimerStatus } from "./useFocusTimer";

type FocusTimerPanelProps = {
  status: FocusTimerStatus;
  remainingMs: number;
  durationMs: number;
  canEditDuration: boolean;
  customMinutes: string;
  onCustomMinutesChange: (value: string) => void;
  onPresetSelect: (minutes: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
};

/** Popover body: presets, custom duration, countdown display, and controls. */
export const FocusTimerPanel = ({
  status,
  remainingMs,
  durationMs,
  canEditDuration,
  customMinutes,
  onCustomMinutesChange,
  onPresetSelect,
  onStart,
  onPause,
  onResume,
  onReset,
}: FocusTimerPanelProps) => {
  const isExpired = status === "expired";
  const isRunning = status === "running";
  const isPaused = status === "paused";

  const handleCustomBlur = () => {
    const parsed = Number.parseInt(customMinutes, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onPresetSelect(parsed);
    }
  };

  const getPresetLabel = (minutes: (typeof FOCUS_TIMER_PRESET_MINUTES)[number]) => {
    switch (minutes) {
      case 1:
        return t("focusTimer.preset1");
      case 5:
        return t("focusTimer.preset5");
      case 10:
        return t("focusTimer.preset10");
      case 15:
        return t("focusTimer.preset15");
      default:
        return `${minutes}m`;
    }
  };

  return (
    <div
      className={clsx("FocusTimerPanel", {
        "FocusTimerPanel--expired": isExpired,
        "FocusTimerPanel--running": isRunning,
      })}
      data-testid="focus-timer-panel"
    >
      <div className="FocusTimerPanel__title">{t("focusTimer.title")}</div>

      <div
        className="FocusTimerPanel__display"
        data-testid="focus-timer-display"
        aria-live="polite"
      >
        {formatRemainingMs(remainingMs)}
      </div>

      {isExpired && (
        <div className="FocusTimerPanel__expired-label" data-testid="focus-timer-expired">
          {t("focusTimer.expired")}
        </div>
      )}

      <div className="FocusTimerPanel__presets">
        {FOCUS_TIMER_PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={clsx("FocusTimerPanel__preset", {
              "FocusTimerPanel__preset--selected":
                canEditDuration && durationMs === minutesToMs(minutes),
            })}
            disabled={!canEditDuration}
            data-testid={`focus-timer-preset-${minutes}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onPresetSelect(minutes)}
          >
            {getPresetLabel(minutes)}
          </button>
        ))}
      </div>

      <label className="FocusTimerPanel__custom">
        <span className="FocusTimerPanel__custom-label">
          {t("focusTimer.custom")}
        </span>
        <input
          type="number"
          min={1}
          className="FocusTimerPanel__custom-input"
          value={customMinutes}
          disabled={!canEditDuration}
          data-testid="focus-timer-custom-input"
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onCustomMinutesChange(event.target.value)}
          onBlur={handleCustomBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCustomBlur();
            }
          }}
          aria-label={t("focusTimer.customMinutes")}
        />
        <span className="FocusTimerPanel__custom-suffix">
          {t("focusTimer.minutes")}
        </span>
      </label>

      <div className="FocusTimerPanel__controls">
        {(status === "idle" || isExpired) && (
          <button
            type="button"
            className="FocusTimerPanel__control FocusTimerPanel__control--primary"
            data-testid="focus-timer-start"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onStart}
          >
            {t("focusTimer.start")}
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            className="FocusTimerPanel__control"
            data-testid="focus-timer-pause"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onPause}
          >
            {t("focusTimer.pause")}
          </button>
        )}
        {isPaused && (
          <button
            type="button"
            className="FocusTimerPanel__control FocusTimerPanel__control--primary"
            data-testid="focus-timer-resume"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onResume}
          >
            {t("focusTimer.resume")}
          </button>
        )}
        {status !== "idle" && (
          <button
            type="button"
            className="FocusTimerPanel__control"
            data-testid="focus-timer-reset"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onReset}
          >
            {t("focusTimer.reset")}
          </button>
        )}
      </div>
    </div>
  );
};
