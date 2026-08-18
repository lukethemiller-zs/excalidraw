## 🚀 Focus Timer for Workshops & Adobe Red Toolbar

### What's changed

- **Focus Timer** — a fixed top-right **Timer** overlay for workshop facilitators. Presets **1 / 5 / 10 / 15 minutes** or custom **1–999** minutes; **Start**, **Pause**, **Resume**, and **Reset**. Remaining time shows as `mm:ss` on the trigger button and in the panel. On expiry, the panel shows **Time's up!** with a pulse animation (visual only — no toast or beep).
- **Adobe red shapes toolbar** — the centre shape toolbar uses Adobe brand red via `--color-primary` (`#EB1000` in light theme) with white icons/keybindings, white-pill selected states, and updated hover/active/eraser/extra-tools contrast.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the canvas or switching to an external timer. The red toolbar reinforces Adobe Whiteboard branding and makes the primary drawing tools easier to spot during workshops and screen-shares.

### Technical notes

Focus Timer is a self-contained app-level overlay (`excalidraw-app/components/FocusTimer.tsx`) mounted directly from `App.tsx` (not via `renderTopRightUI`). It uses local React state only — no scene mutations, persistence, or collaboration sync. Countdown timing is drift-resistant via a wall-clock end timestamp recomputed on each tick. The toolbar change is scoped to `packages/excalidraw/components/Toolbar.scss` (`.Island.App-toolbar` and related tool-button states).

### Testing

Manual checks on the local Vite app: open Timer, select the **1m** preset (`01:00`), start/pause/resume/reset, confirm live `mm:ss` on the trigger, preset locking while running, expiry **Time's up!** + pulse, canvas drawing unaffected, and light-mode Adobe red toolbar with white icons/selected pills. No new automated tests were added for Focus Timer or the toolbar styling.

### Known limitations

- **Local-only timer** — visible on the current user's screen only; not synced to collaborators and not persisted across reload.
- **Visual expiry only** — pulse + **Time's up!** text; no audio cue and no toast.
- **English-only** UI strings (hardcoded in the component).
- **No automated test coverage** for `FocusTimer.tsx` / `FocusTimer.scss` or the toolbar colour update.
- Focus Timer panel uses hardcoded light-theme colours; dark-mode polish is not included.
- Dark theme toolbar uses `--color-primary` `#FF6B57`, not light-mode `#EB1000`.
