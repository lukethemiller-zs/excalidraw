/**
 * Pure helpers for BrainstormMode sticky placement and keyboard shortcuts.
 * Kept separate so shortcut/placement rules can be unit-tested without mounting the overlay.
 */

export const STICKY_WIDTH = 180;
export const STICKY_HEIGHT = 120;
export const CASCADE_STEP = 30;
export const CASCADE_WRAP = 8;

/** True when the event target is an editable field (skip global brainstorm shortcut). */
export const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
};

/** Cmd/Ctrl+Shift+B toggles brainstorm mode. */
export const isBrainstormToggle = (event: Pick<
  KeyboardEvent,
  "code" | "shiftKey" | "metaKey" | "ctrlKey"
>) =>
  event.code === "KeyB" &&
  event.shiftKey &&
  (event.metaKey || event.ctrlKey);

/** Cascade stickies diagonally from viewport center; wrap after CASCADE_WRAP to stay on screen. */
export const getStickyPosition = (
  scrollX: number,
  scrollY: number,
  width: number,
  height: number,
  zoom: number,
  dropIndex: number,
) => {
  const baseX = width / (2 * zoom) - scrollX - STICKY_WIDTH / 2;
  const baseY = height / (2 * zoom) - scrollY - STICKY_HEIGHT / 2;
  const col = dropIndex % CASCADE_WRAP;
  const row = Math.floor(dropIndex / CASCADE_WRAP);

  return {
    x: baseX + col * CASCADE_STEP,
    y: baseY + row * CASCADE_STEP,
  };
};
