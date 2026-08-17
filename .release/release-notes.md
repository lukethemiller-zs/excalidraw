## 🚀 Focus Timer & Adobe Red Toolbar

### What's changed

- **Focus Timer** — desktop countdown in the top-right UI (next to Inspiration) with presets **1 / 5 / 10 / 15** minutes, custom duration (**1–999** min), and **Start / Pause / Resume / Reset**. While running or paused the trigger shows live `M:SS`; on expiry it shows **Time's up!**, pulses Adobe red, and plays a short beep. State is local React only (no collab sync, persistence, or canvas side-effects).
- **Adobe red shapes toolbar** — the main shape toolbar (`.Island.App-toolbar`) uses `var(--color-primary)` (Adobe red `#EB1000` in light theme) with white icons, light selected pills (red icon on white), and matching mobile selected/separator styling. SCSS-only in `Toolbar.scss`.

### User impact

Facilitators can run timed workshop exercises without leaving the canvas. The toolbar reads clearly as Adobe Whiteboard branding with stronger icon contrast on red.

### Technical notes

Focus Timer mounts via app `renderTopRightUI` and returns `null` on phone. Countdown uses a wall-clock `endTime` with a 250ms tick so pause/resume stays accurate across parent re-renders. Toolbar theming relies on existing `--color-primary` / `--color-icon-white` tokens rather than a hard-coded hex.

### Testing

No new automated tests (no `FocusTimer` unit suite; toolbar is CSS-only). Manual: open **⏱ Timer** on desktop → **1m** → Start → confirm live countdown on button and in panel → Pause / Resume / Reset → let expire for **Time's up!** + beep; draw while the timer runs; confirm light-mode red toolbar with white icons and readable selected state.

### Known limitations

- Local-only — not synced to collaborators and not persisted across reloads.
- Unavailable on phone form factors; zen mode hides top-right chrome (including the Timer).
- No keyboard shortcut; UI strings are English-only.
- Dark theme toolbar uses dark-theme `--color-primary` (`#FF6B57`), not light `#EB1000`.
- Toolbar CSS has no dedicated automated tests.
