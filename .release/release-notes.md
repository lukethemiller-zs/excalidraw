## 🚀 Canvas Background Styles & Workshop Focus Timer

### What's changed

- **Canvas background styles** — Main menu → Background style offers Blank, Dot, Grid, and Lined paper patterns behind the scene. Stored as persisted `viewBackgroundStyle` (with background color); snap-grid overlay is skipped when Grid paper is active so lines are not doubled.
- **Workshop Focus Timer** — Top-right “Timer” control (beside Inspiration) with presets 1 / 5 / 10 / 15 minutes, custom duration in minutes (1–180) or hours (1–8), Start / Pause / Resume / Reset, running badge, and an expiry toast (“Workshop timer finished”). Local React state only — not written to scene state or collab sync.

### User impact

Facilitators can give boards a paper look for workshops and run timed exercises without leaving the whiteboard or relying on an external countdown.

### Technical notes

Background style is restored with validation against `VIEW_BACKGROUND_STYLES` and painted via `strokeBackgroundPattern` on the static canvas. The timer uses wall-clock `endsAt` while running so pause/resume stay accurate; it does not touch elements or app-state persistence.

### Testing

- Unit coverage for `strokeBackgroundPattern` (blank / dot / square / lined).
- FocusTimer helper and UI tests: presets, custom minutes/hours, clamp, pause/resume, expiry toast, reset, and no second start while active.

### Known limitations

- Timer is local to the browser session — not synced to collaborators and not restored on reload.
- Expiry is visual + toast only (no sound).
- Background style control follows the same visibility rules as canvas background color (hidden in view mode / when that canvas action is disabled).
