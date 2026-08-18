## 🚀 Focus Timer for Workshops

### What's changed

A workshop countdown timer is now built into the whiteboard. Click the **Timer** button (top-right, Adobe red) to open a panel with preset durations (1, 5, 10, 15 minutes), a custom minute input, and **Start / Pause / Resume / Reset** controls. A large `mm:ss` readout shows remaining time; when it hits zero the panel flashes and displays **Time's up!** with an optional short beep.

The shape toolbar is also updated to Adobe red (`#EB1000`) with white tool icons and a white pill for the selected tool.

### User impact

Facilitators can run timed brainstorming, voting, and ideation exercises without switching to an external timer app. The countdown stays visible while participants continue drawing on the canvas.

### Technical notes

- Implemented as a self-contained overlay in `excalidraw-app` only — the published `@excalidraw/excalidraw` library is unchanged.
- Timestamp-based countdown (`Date.now()` + 250 ms tick) so the timer stays accurate under tab throttling.
- Overlay uses `pointer-events: none` on the container so canvas editing is unaffected.
- Toolbar colour change is scoped to `.Island.App-toolbar` in `Toolbar.scss`.

### Testing

- **7 unit tests** in `FocusTimer.test.tsx` — presets, start, pause, resume, reset, and expiry (all passing).
- `yarn test:typecheck` still fails on a pre-existing `BrainstormMode.tsx` import error (`useAdobeWhiteboardAPI`); unrelated to this feature.

### Known limitations

- **Local-only:** each user runs their own timer; the countdown is not synced to collaborators in real time.
- Timer state is not persisted across page reloads.
