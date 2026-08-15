## 🚀 Focus Timer for Workshops

### What's changed

- **Focus Timer** — a new **⏱ Timer** button in the top-right opens a workshop countdown panel with **1 / 5 / 10 / 15 minute** presets, a custom duration field, and **Start / Pause / Resume / Reset** controls. Remaining time shows as **MM:SS** in the panel and on the button while running. When time expires, the display flashes **00:00**, shows **Time's up!**, and plays a short beep.
- **Shape toolbar styling** — the main shape toolbar is now Adobe red (`#EB1000`) with white icons and adjusted selected/hover states for contrast.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without leaving the whiteboard or switching to an external timer. The timer stays visible while participants continue drawing, and the red toolbar reinforces the Adobe Whiteboard brand during workshops and screen-shares.

### Technical notes

The timer is a self-contained app-level overlay (`excalidraw-app/components/FocusTimer.tsx`) mounted once inside the `<Excalidraw>` children region. All state is local React state — no canvas elements, app state, or collab socket changes — so editing is unaffected. Countdown uses timestamp-based ticking to avoid drift. Toolbar colours are scoped to `.Island.App-toolbar` in `Toolbar.scss` via existing CSS variables.

### Testing

Manually verified at http://localhost:3001/: timer trigger visible top-right; preset selection; Start → Pause → Resume → Reset flow; drawing tools remain usable while the timer runs. No new automated tests were added for `FocusTimer.tsx`.

### Known limitations

- **Local-only** — timer state is not synced to collaborators; each browser runs its own countdown.
- **No unit tests** — `FocusTimer.tsx` has no sibling `*.test.ts{x}` yet.
- **Pre-existing typecheck failure** — `BrainstormMode.tsx` still imports a non-exported `useAdobeWhiteboardAPI`; unrelated to this feature but leaves `yarn test:typecheck` red on `master`.
