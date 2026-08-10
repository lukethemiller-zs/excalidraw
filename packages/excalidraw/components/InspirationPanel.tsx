/** Cosmetic "Inspiration" entry point: toggles a static suggestions popover.
 *  Prototype only — no APIs, no persistence, no canvas side-effects. */
import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { KEYS } from "@excalidraw/common";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  // Restore focus to the trigger so keyboard users don't land on <body>.
  const handleClose = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // Modal dialogs must dismiss on Escape; capture so App-level handlers don't win.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYS.ESCAPE) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      handleClose();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, handleClose]);

  return (
    <div className="InspirationPanel" ref={anchorRef}>
      <button
        ref={triggerRef}
        type="button"
        className={clsx("InspirationPanel__button", { active: open })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? INSPIRATION_PANEL_ID : undefined}
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
          // Put dialog semantics on the focused Popover root (not a nested node).
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
        </Popover>
      )}
    </div>
  );
};
