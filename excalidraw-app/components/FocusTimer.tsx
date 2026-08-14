/** Workshop countdown timer: presets, custom duration, start/pause/resume/reset. */
import { Button } from "@excalidraw/excalidraw";
import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import { useI18n } from "@excalidraw/excalidraw/i18n";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import "./FocusTimer.scss";

const PRESETS_MINUTES = [1, 5, 10, 15] as const;
const DEFAULT_PRESET_MINUTES = 5;
const TICK_MS = 250;
const FLASH_DURATION_MS = 1500;

type TimerStatus = "idle" | "running" | "paused" | "done";

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/** Top-right trigger rendered from App.tsx renderTopRightUI. */
export const FocusTimerTrigger = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={clsx("FocusTimer-trigger", { active: isOpen })}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      ⏱ {t("focusTimer.title")}
    </button>
  );
};

export const FocusTimer = ({
  isOpen,
  onClose,
  excalidrawAPI,
}: {
  isOpen: boolean;
  onClose: () => void;
  excalidrawAPI: ExcalidrawImperativeAPI;
}) => {
  const { t } = useI18n();

  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState(
    DEFAULT_PRESET_MINUTES,
  );
  const [customMinutes, setCustomMinutes] = useState("");
  const [durationMs, setDurationMs] = useState(
    minutesToMs(DEFAULT_PRESET_MINUTES),
  );
  const [remainingMs, setRemainingMs] = useState(
    minutesToMs(DEFAULT_PRESET_MINUTES),
  );
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [isFlashing, setIsFlashing] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hasNotifiedRef = useRef(false);
  const flashTimeoutRef = useRef<number | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearFlashTimeout = useCallback(() => {
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    clearTick();
    endAtRef.current = null;
    setRemainingMs(0);
    setStatus("done");

    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      excalidrawAPI.setToast({
        message: t("focusTimer.timeUp"),
        closable: true,
      });
      setIsFlashing(true);
      clearFlashTimeout();
      flashTimeoutRef.current = window.setTimeout(() => {
        setIsFlashing(false);
        flashTimeoutRef.current = null;
      }, FLASH_DURATION_MS);
    }
  }, [clearFlashTimeout, clearTick, excalidrawAPI, t]);

  const tick = useCallback(() => {
    if (endAtRef.current === null) {
      return;
    }

    const remaining = endAtRef.current - Date.now();
    if (remaining <= 0) {
      handleComplete();
      return;
    }

    setRemainingMs(remaining);
  }, [handleComplete]);

  const startInterval = useCallback(() => {
    clearTick();
    intervalRef.current = window.setInterval(tick, TICK_MS);
  }, [clearTick, tick]);

  const selectPreset = useCallback(
    (minutes: (typeof PRESETS_MINUTES)[number]) => {
      if (status === "running") {
        return;
      }

      const ms = minutesToMs(minutes);
      setSelectedPresetMinutes(minutes);
      setCustomMinutes("");
      setDurationMs(ms);
      setRemainingMs(ms);
      setStatus("idle");
      hasNotifiedRef.current = false;
      setIsFlashing(false);
    },
    [status],
  );

  const applyCustomDuration = useCallback(() => {
    if (status === "running") {
      return;
    }

    const parsed = Number.parseInt(customMinutes, 10);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 999) {
      return;
    }

    const ms = minutesToMs(parsed);
    setSelectedPresetMinutes(0);
    setDurationMs(ms);
    setRemainingMs(ms);
    setStatus("idle");
    hasNotifiedRef.current = false;
    setIsFlashing(false);
  }, [customMinutes, status]);

  const onStart = useCallback(() => {
    if (status === "running") {
      return;
    }

    endAtRef.current = Date.now() + remainingMs;
    setStatus("running");
    hasNotifiedRef.current = false;
    startInterval();
  }, [remainingMs, startInterval, status]);

  const onPause = useCallback(() => {
    if (status !== "running" || endAtRef.current === null) {
      return;
    }

    const remaining = Math.max(0, endAtRef.current - Date.now());
    clearTick();
    endAtRef.current = null;
    setRemainingMs(remaining);
    setStatus("paused");
  }, [clearTick, status]);

  const onResume = useCallback(() => {
    if (status !== "paused") {
      return;
    }

    endAtRef.current = Date.now() + remainingMs;
    setStatus("running");
    startInterval();
  }, [remainingMs, startInterval, status]);

  const onReset = useCallback(() => {
    clearTick();
    endAtRef.current = null;
    setRemainingMs(durationMs);
    setStatus("idle");
    hasNotifiedRef.current = false;
    setIsFlashing(false);
    clearFlashTimeout();
  }, [clearFlashTimeout, clearTick, durationMs]);

  useEffect(() => {
    return () => {
      clearTick();
      clearFlashTimeout();
    };
  }, [clearFlashTimeout, clearTick]);

  const isRunning = status === "running";
  const canEditDuration = status !== "running";

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={clsx("FocusTimer-panel", {
        "FocusTimer-panel--flash": isFlashing,
      })}
      role="dialog"
      aria-label={t("focusTimer.title")}
    >
      <div className="FocusTimer-header">
        <span className="FocusTimer-title">{t("focusTimer.title")}</span>
        <button
          type="button"
          className="FocusTimer-close"
          aria-label={t("buttons.close")}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div
        className={clsx("FocusTimer-display", {
          "FocusTimer-display--done": status === "done",
        })}
      >
        {formatRemaining(remainingMs)}
      </div>

      <div className="FocusTimer-presets">
        {PRESETS_MINUTES.map((minutes) => (
          <Button
            key={minutes}
            className="FocusTimer-preset"
            selected={selectedPresetMinutes === minutes && !customMinutes}
            disabled={!canEditDuration}
            onSelect={() => selectPreset(minutes)}
          >
            {minutes}
            {t("focusTimer.minutesShort")}
          </Button>
        ))}
      </div>

      <div className="FocusTimer-custom">
        <input
          className="FocusTimer-custom-input"
          type="number"
          min={1}
          max={999}
          placeholder={t("focusTimer.custom")}
          value={customMinutes}
          disabled={!canEditDuration}
          onChange={(event) => setCustomMinutes(event.target.value)}
          onBlur={applyCustomDuration}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyCustomDuration();
            }
          }}
        />
        <span className="FocusTimer-custom-label">
          {t("focusTimer.minutesShort")}
        </span>
      </div>

      <div className="FocusTimer-controls">
        {status === "running" ? (
          <FilledButton
            className="FocusTimer-control"
            label={t("focusTimer.pause")}
            onClick={onPause}
          >
            {t("focusTimer.pause")}
          </FilledButton>
        ) : status === "paused" ? (
          <FilledButton
            className="FocusTimer-control"
            label={t("focusTimer.resume")}
            onClick={onResume}
          >
            {t("focusTimer.resume")}
          </FilledButton>
        ) : (
          <FilledButton
            className="FocusTimer-control"
            label={t("focusTimer.start")}
            disabled={remainingMs <= 0}
            onClick={onStart}
          >
            {t("focusTimer.start")}
          </FilledButton>
        )}
        <Button
          className="FocusTimer-control"
          disabled={isRunning}
          onSelect={onReset}
        >
          {t("focusTimer.reset")}
        </Button>
      </div>
    </div>
  );
};
