## 🚀 Focus Timer for Workshops & Adobe red toolbar

### What's changed

- **Focus Timer** — a new **Timer** button in the top-right opens a workshop countdown panel. Facilitators can pick **1 / 5 / 10 / 15 minute** presets or enter a custom duration, then **Start**, **Pause**, **Resume**, and **Reset** the timer. Remaining time shows as `mm:ss` on the button and in the panel; when time expires, a **Time's up!** message and pulse animation appear.
- **Adobe red shapes toolbar** — the centre shape toolbar now uses Adobe brand red (`#EB1000`) with white icons, white-pill selected states, and updated hover/active contrast.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without switching to an external timer app. The red toolbar reinforces Adobe Whiteboard branding and makes the primary drawing tools easier to spot during workshops and screen-shares.

### Technical notes

Focus Timer is a self-contained app-level overlay (`excalidraw-app/components/FocusTimer.tsx`) mounted from `App.tsx`. It uses local React state only — no scene mutations and no collaboration sync in this version. Countdown timing is drift-resistant via a wall-clock end timestamp recomputed on each tick. The toolbar change is scoped to `packages/excalidraw/components/Toolbar.scss` (`.Island.App-toolbar` and related tool-button states).

### Testing

Manually verified on the local dev server (`http://localhost:3005/`): preset selection (1m → `01:00`), start/pause/resume/reset, countdown display on the trigger button, preset locking while running, and canvas drawing unaffected. No new automated tests were added for Focus Timer or the toolbar styling change.

### Known limitations

- **Local-only timer** — the countdown is visible on the current user's screen only; it is not synced to other collaborators in a shared session.
- **No automated test coverage** for `FocusTimer.tsx` / `FocusTimer.scss` or the toolbar colour update.
- Focus Timer panel styling uses hardcoded light-theme colours; dark-mode polish is not included.
- `yarn test:typecheck` still fails on `master` due to a pre-existing broken import in `BrainstormMode.tsx` (unrelated to this release).
