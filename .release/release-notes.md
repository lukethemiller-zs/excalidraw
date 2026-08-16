## 🚀 Focus Timer & Adobe Red Toolbar

### What's changed

- **Focus Timer** — a new **Timer** button in the top-right UI (next to Inspiration) opens a workshop countdown panel. Facilitators can pick **1m, 5m, 10m, or 15m** presets, enter a **custom duration** (minutes ≥ 1), and use **Start / Pause / Resume / Reset** while continuing to draw on the canvas. The trigger label stays **Timer** (countdown lives in the panel).
- **Expiry feedback** — when time runs out, the panel shows **“Time's up!”**, flashes the button/panel in Adobe red, and posts a closable toast with the same message.
- **Adobe red toolbar** — the main shapes toolbar (`.Island.App-toolbar`) uses `--color-primary` (Adobe red `#EB1000` in light theme) with white tool icons/keybindings, light selected-state pills, eraser/extra-tools contrast, and matching mobile toolbar styling.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the canvas. The countdown stays in the editor chrome and does not block normal whiteboard editing. The shapes toolbar also reads clearly as Adobe Whiteboard branding, with stronger icon contrast on the primary red surface.

### Technical notes

The timer lives in `packages/excalidraw/components/FocusTimer/` and is mounted from desktop `LayerUI` top-right chrome (not phone `MobileMenu`). Countdown state is kept in a local `useFocusTimer` hook (end-time timestamps + `setInterval`), not in global app state, so the editor does not re-render every second. A single hook instance prevents duplicate timers. Toolbar styling is scoped to `Toolbar.scss` via existing `--color-primary` / `--color-icon-white` tokens. New strings are English-only in `en.json`.

### Testing

- **7 new automated tests** in `FocusTimer.test.tsx` — time formatting; countdown/pause/resume/reset/expiry in the hook; full UI start-pause-resume-reset flow; expiry toast.
- Manual walkthrough: open Timer → 1m → Start → Pause → Resume → draw on canvas → expiry indication; confirm Adobe red shapes toolbar with white icons and selected pill in light mode.

### Known limitations

- **Local-only** — the timer runs per browser session; it is not synced to collaborators and is **not persisted** across reloads.
- **Desktop chrome only** — Focus Timer is not mounted on phone (`MobileMenu`); zen mode slides the top-right chrome (including Timer) off-screen.
- **No keyboard shortcut or menu action** yet (panel open/close is button-only).
- Strings are **English-only** in this PR.
- Dark theme toolbar uses dark `--color-primary` (`#FF6B57`), not light-mode `#EB1000`.
- Adobe red toolbar styling has **no dedicated automated tests** (CSS-only change).
