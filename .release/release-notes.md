## 🚀 Focus Timer for Workshops & Adobe Red Toolbar

### What's changed

A workshop countdown timer is built into the whiteboard as a top-right overlay (`<FocusTimer />` in `excalidraw-app` `App.tsx`). Click the **Timer** button (static label; Adobe red) to open a panel with preset durations (1, 5, 10, 15 minutes), a custom minutes input (≥1, no UI max), and **Start / Pause / Resume / Reset**. A large `m:ss` readout shows remaining time; on expiry the panel flashes and shows **Time's up!** with an optional short beep.

The shapes toolbar (`.Island.App-toolbar`) uses `--color-primary` (Adobe red `#EB1000` in light theme) with white icons/keybindings, white-pill selected states, and matching hover/divider/eraser/extra-tools contrast. Dark theme uses `--color-primary-darker` for the toolbar background.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the canvas. The local countdown stays on-screen while drawing continues. The toolbar reads clearly as Adobe Whiteboard branding and is easier to spot in workshops and screen-shares.

### Technical notes

- App-only overlay — the published `@excalidraw/excalidraw` library behaviour is unchanged aside from `Toolbar.scss` theming.
- Timestamp-based countdown (`Date.now()` + 250 ms tick) so the timer stays accurate under tab throttling.
- Overlay uses `pointer-events: none` on the container so canvas editing is unaffected; trigger/panel re-enable pointer events.
- Toolbar colours come from theme CSS variables (`--color-primary` / `--color-primary-darker`), not a hard-coded hex in `Toolbar.scss`.

### Testing

- **7 unit tests** in `FocusTimer.test.tsx` — formatting, presets, start, pause, resume, reset, and expiry (all passing).
- Manual: Timer 1m start/pause/resume/reset + canvas drawing unaffected; expiry flash + **Time's up!** + beep; light-mode red toolbar with white icons/selected pills.

### Known limitations

- **Local-only:** each user runs their own timer; the countdown is not synced to collaborators and is not persisted across reloads.
- English-only hardcoded UI strings; no keyboard shortcut.
- Dark theme toolbar uses `#FF6B57` / `#FF836F` (`--color-primary` / `--color-primary-darker`), not light-mode `#EB1000`.
- Beep is best-effort (may be blocked by browser autoplay policies).
