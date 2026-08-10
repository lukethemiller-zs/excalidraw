## 🚀 Focus Timer for Workshops + Adobe Red Toolbar

### What's changed

- **Focus Timer** — a new **⏱ Timer** button in the top-right UI (beside Inspiration) opens a workshop countdown. Facilitators can pick presets (1, 5, 10, or 15 minutes), enter a custom duration (1–120 min), and use Start, Pause, Resume, and Reset. Remaining time shows in the popover and on the button label as `MM:SS` while the timer is active. When time expires, the countdown flashes red and a Toast announces "Time's up!"
- **Adobe red toolbar** — the shape toolbar background uses Adobe primary red (`#EB1000` via `--color-primary`) with white icons and white-pill selected states for clearer brand contrast.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the whiteboard or switching to an external timer. The countdown stays visible on the Timer button even when the popover is closed, so remaining time stays in view while editing the canvas. Toolbar styling makes the drawing tools read more clearly as Adobe Whiteboard chrome.

### Technical notes

The timer is a self-contained `FocusTimerPanel` wired into desktop `LayerUI` beside Inspiration. All timer state lives in local React state via a pure `focusTimerReducer` in `focusTimerUtils.ts` — nothing is written to editor app state or undo history except a transient expiry Toast. While running, remaining time advances on a 1s `setInterval`. No collaborator sync in this version.

### Testing

Added `focusTimerUtils.test.ts` with **13** unit tests covering formatting, duration clamping, and start/pause/resume/reset/expire transitions. Manual smoke test: preset selection, custom duration, countdown, pause/resume, reset, expiry Toast, and Adobe red toolbar contrast. `FocusTimerPanel` has no component-level render test yet.

### Known limitations

- **Local-only** — the timer is not synced to other collaborators; each client sees its own countdown.
- **No persistence** — timer state resets on page reload.
- **Desktop only** — mounted in desktop `LayerUI` only; not available in `MobileMenu` / phone form factor.
- **Zen mode** — top-right chrome (including the Timer badge) is hidden while zen mode is enabled.
- **No audible alert** — expiry is visual (flashing countdown + Toast) only.
- **English strings only** — new copy is in `en.json` only.
