/** Inspiration entry point: opens suggestion cards that insert starter canvas content. */
import clsx from "clsx";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useUIAppState } from "../context/ui-appState";

import { useApp } from "./App";
import { Island } from "./Island";
import { Popover } from "./Popover";
import {
  getInspirationStarterElements,
  type InspirationSuggestionId,
} from "./inspirationTemplates";

import "./InspirationPanel.scss";

const SUGGESTIONS: ReadonlyArray<{
  id: InspirationSuggestionId;
  title: string;
  desc: string;
}> = [
  {
    id: "generate-campaign-ideas",
    title: "Generate campaign ideas",
    desc: "Kick off a fresh brief",
  },
  {
    id: "create-moodboard",
    title: "Create a moodboard",
    desc: "Collect visual inspiration",
  },
  {
    id: "explore-brand-colours",
    title: "Explore brand colours",
    desc: "Try new palette directions",
  },
];

const PANEL_WIDTH = 260;

export const InspirationPanel = () => {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const appState = useUIAppState();
  const { onInsertElements, focusContainer } = useApp();

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

  const handleSuggestionClick = useCallback(
    (suggestionId: InspirationSuggestionId) => {
      onInsertElements(getInspirationStarterElements(suggestionId));
      setOpen(false);
      focusContainer();
    },
    [focusContainer, onInsertElements],
  );

  return (
    <div className="InspirationPanel" ref={anchorRef}>
      <button
        type="button"
        className={clsx("InspirationPanel__button", { active: open })}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
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
          <Island padding={2} className="InspirationPanel__panel">
            <div className="InspirationPanel__title">Get inspired</div>
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="InspirationPanel__card"
                onClick={() => handleSuggestionClick(suggestion.id)}
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
