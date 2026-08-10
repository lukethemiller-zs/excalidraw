## 🚀 Focus Timer for Workshops

### What's changed

- **Focus Timer** — a new **⏱ Timer** button in the top-right UI (beside Inspiration) opens a workshop countdown. Facilitators can pick presets (1, 5, 10, or 15 minutes), enter a custom duration (1–120 min), and use Start, Pause, Resume, and Reset. Remaining time shows in the popover and on the button label while the timer is active. When time expires, the countdown flashes red and a Toast announces "Time's up!"
- **Toolbar polish** — the shape toolbar background is now Adobe red (`#EB1000`) with white icons and white-pill selected states for better brand consistency.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the whiteboard or switching to an external timer. The countdown stays visible even when the popover is closed, so participants always know how much time is left.

### Technical notes

The timer is a self-contained `FocusTimerPanel` component wired into `LayerUI`, mirroring the Inspiration Panel pattern. All timer state lives in local React state via a pure `focusTimerReducer` in `focusTimerUtils.ts` — nothing is written to editor app state or undo history except a transient expiry Toast. Desktop only; no collab sync in this version.

### Testing

Added `focusTimerUtils.test.ts` with **13 passing** unit tests covering formatting, duration clamping, and start/pause/resume/reset/expire transitions. Manual smoke test: preset selection, custom duration, countdown, pause/resume, reset, and expiry Toast. `FocusTimerPanel` has no component-level render test yet.

### Known limitations

- **Local-only** — the timer is not synced to other collaborators; each user sees their own countdown.
- **No persistence** — timer state resets on page reload.
- **Desktop only** — hidden on phone form factors, matching Inspiration Panel.
- **No audible alert** — expiry is visual (flashing countdown + Toast) only.
- **Pre-existing typecheck failure** — `BrainstormMode.tsx` still imports non-existent `useAdobeWhiteboardAPI`; unrelated to this feature but blocks `yarn test:typecheck` on master.
