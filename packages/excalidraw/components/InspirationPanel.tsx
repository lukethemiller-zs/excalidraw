/** Cosmetic "Inspiration" entry point: toggles a static suggestions popover.
 *  Prototype only — no APIs, no persistence, no canvas side-effects. */
import clsx from "clsx";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useUIAppState } from "../context/ui-appState";

import { Island } from "./Island";
import { Popover } from "./Popover";

import "./InspirationPanel.scss";

const SUGGESTIONS = [
  { title: "Generate campaign ideas", desc: "Kick off a fresh brief" },
  { title: "Create a moodboard", desc: "Collect visual inspiration" },
  { title: "Explore brand colours", desc: "Try new palette directions" },
] as const;

const PANEL_WIDTH = 260;
/** Stable ids so the trigger's aria-controls/labelledby stay linked when open. */
export const INSPIRATION_PANEL_ID = "inspiration-panel";
export const INSPIRATION_PANEL_TITLE_ID = "inspiration-panel-title";

export const InspirationPanel = () => {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const appState = useUIAppState();

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

  return (
    <div className="InspirationPanel" ref={anchorRef}>
      <button
        type="button"
        className={clsx("InspirationPanel__button", { active: open })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={INSPIRATION_PANEL_ID}
      >
        ✨ Inspiration
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
          className="InspirationPanel__popover"
        >
          {/* Match aria-haspopup="dialog": expose a named dialog region for AT. */}
          <div
            id={INSPIRATION_PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={INSPIRATION_PANEL_TITLE_ID}
          >
            <Island padding={2} className="InspirationPanel__panel">
              <div
                className="InspirationPanel__title"
                id={INSPIRATION_PANEL_TITLE_ID}
              >
                Get inspired
              </div>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.title}
                  type="button"
                  className="InspirationPanel__card"
                  onClick={handleClose}
                >
                  <div className="InspirationPanel__card-title">
                    {suggestion.title}
                  </div>
                  <div className="InspirationPanel__card-desc">
                    {suggestion.desc}
                  </div>
                </button>
              ))}
            </Island>
          </div>
        </Popover>
      )}
    </div>
  );
};
