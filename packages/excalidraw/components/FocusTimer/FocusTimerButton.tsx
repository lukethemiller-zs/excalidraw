/** Workshop focus timer: top-right toolbar button with anchored countdown popover. */
import clsx from "clsx";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useUIAppState } from "../../context/ui-appState";
import { t } from "../../i18n";

import { focusTimerIcon } from "../icons";
import { Island } from "../Island";
import { Popover } from "../Popover";

import { FocusTimerPanel } from "./FocusTimerPanel";
import { minutesToMs, useFocusTimer } from "./useFocusTimer";

import "./FocusTimer.scss";

import type { AppClassProperties } from "../../types";

const PANEL_WIDTH = 280;

type FocusTimerButtonProps = {
  app: AppClassProperties;
};

export const FocusTimerButton = ({ app }: FocusTimerButtonProps) => {
  const [open, setOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("1");
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const appState = useUIAppState();

  const handleExpire = useCallback(() => {
    app.setAppState({
      toast: { message: t("focusTimer.expired"), closable: true },
    });
  }, [app]);

  const timer = useFocusTimer(handleExpire);

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

  const handlePresetSelect = useCallback(
    (minutes: number) => {
      timer.setDuration(minutesToMs(minutes));
      setCustomMinutes(String(minutes));
    },
    [timer],
  );

  return (
    <div className="FocusTimer" ref={anchorRef}>
      <button
        type="button"
        className={clsx("FocusTimer__button", {
          active: open,
          "FocusTimer__button--expired": timer.status === "expired",
          "FocusTimer__button--running": timer.status === "running",
        })}
        data-testid="focus-timer-button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("focusTimer.title")}
      >
        <span className="FocusTimer__button-icon" aria-hidden="true">
          {focusTimerIcon}
        </span>
        <span className="FocusTimer__button-label">{t("focusTimer.title")}</span>
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
          <Island padding={2} className="FocusTimer__island">
            <FocusTimerPanel
              status={timer.status}
              remainingMs={timer.remainingMs}
              durationMs={timer.durationMs}
              canEditDuration={timer.canEditDuration}
              customMinutes={customMinutes}
              onCustomMinutesChange={setCustomMinutes}
              onPresetSelect={handlePresetSelect}
              onStart={timer.start}
              onPause={timer.pause}
              onResume={timer.resume}
              onReset={timer.reset}
            />
          </Island>
        </Popover>
      )}
    </div>
  );
};
