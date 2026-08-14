## 🚀 Focus Timer for Workshops + Adobe Red Toolbar

### What's changed

- **Focus Timer** — top-right **Timer** button opens a local countdown panel with presets **1 / 5 / 10 / 15** minutes, custom duration **1–999** minutes, and **Start / Pause / Resume / Reset**. Display is `M:SS`. On expiry: toast **"Time's up!"** and a brief panel flash. State is local React only (not persisted, not synced to collaborators).
- **Adobe red toolbar** — shape toolbar (`Island.App-toolbar`) uses theme `--color-primary` (**`#EB1000`**) with white icons/keybindings and light selected/hover states; mobile toolbar active/separator styles updated for contrast on the red chrome.
- **Typecheck fix** — `BrainstormMode` now imports `useExcalidrawAPI` (was `useAdobeWhiteboardAPI`).

### User impact

Workshop facilitators can run timed exercises in-app without a separate timer. The toolbar reads more clearly as Adobe Whiteboard branding on desktop and mobile.

### Technical notes

Timer is mounted from `excalidraw-app/App.tsx` via `renderTopRightUI` (`FocusTimerTrigger`) plus a sibling `FocusTimer` panel. Countdown uses a wall-clock `endAt` ref and a 250ms tick. Strings live under `focusTimer.*` in `en.json` only. Toolbar styling is SCSS-only (`Toolbar.scss` / `MobileToolBar.scss`); no new theme tokens.

### Testing

No new automated tests for Focus Timer or the toolbar restyle. Manual coverage from the PR plan: open Timer, run 1m preset, pause/resume, expiry toast + flash, confirm Adobe red toolbar with readable white icons; also `yarn test:typecheck` (BrainstormMode import fix).

### Known limitations

- Local-only (not synced to collaborators); resets on reload.
- Hidden on phone: `renderTopRightUI` returns `null` when `isMobile` (phone form factor).
- Zen mode slides top-right chrome off-screen, so the Timer trigger is hidden while zen mode is on.
- Visual expiry only (toast + flash; no audio).
- English strings only (`en.json`).
- No automated Focus Timer tests.
