## 🚀 Focus Timer for Workshops

### What's changed

- **Focus Timer** — a new **Timer** button in the top-right UI opens a workshop countdown panel. Facilitators can pick **1m, 5m, 10m, or 15m** presets, enter a **custom duration**, and use **Start / Pause / Resume / Reset** while continuing to draw on the canvas.
- **Expiry feedback** — when time runs out, the timer shows a clear “Time's up!” state, flashes the button/panel in Adobe red, and posts a closable toast.
- **Adobe red toolbar** — the main shapes toolbar now uses Adobe red (`#EB1000`) with white tool icons, white selected-state pills, and matching mobile toolbar styling.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without switching to an external timer app. The countdown stays visible in the editor chrome and does not block normal whiteboard editing.

### Technical notes

The timer lives in `packages/excalidraw/components/FocusTimer/` and is wired into `LayerUI` next to the Inspiration panel. Countdown state is kept in a local `useFocusTimer` hook (end-time timestamps + `setInterval`), not in global app state, so the editor does not re-render every second. A single hook instance prevents duplicate timers. Toolbar styling is scoped to `Toolbar.scss` via existing `--color-primary` tokens.

### Testing

- **7 new automated tests** in `FocusTimer.test.tsx` — all passing: time formatting, countdown/pause/resume/reset/expiry in the hook, full UI start-pause-resume-reset flow, and expiry toast.
- Manual walkthrough validated: open Timer → 1m → Start → Pause → Resume → draw on canvas → expiry indication.

### Known limitations

- **Local-only** — the timer runs per browser session; it is not synced to collaborators.
- **No keyboard shortcut or menu action** yet (panel open/close is button-only).
- Timer state is **not persisted** across page reloads.
- Adobe red toolbar styling has **no dedicated automated tests** (CSS-only change).
