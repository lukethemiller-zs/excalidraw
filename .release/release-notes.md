## 🚀 Focus Timer for Workshops

### What's changed
A workshop countdown timer is available from a **Timer** button in the top-right UI (next to Inspiration). Facilitators can pick presets of **1 / 5 / 10 / 15 minutes** or enter a custom duration, then **Start / Pause / Resume / Reset**. Remaining time shows as **MM:SS** in the popover and as a badge on the button while active. When time runs out, the UI marks expiry and shows a toast (“Workshop timer finished”).

### User impact
Timed brainstorming, voting, and ideation exercises can run without leaving the whiteboard for a separate timer app, keeping facilitators and participants focused on the board.

### Technical notes
The timer is Layer UI chrome only (Island + Popover), with local React state—no scene or AppState timer fields—so canvas editing, undo, and export are unaffected. Remaining time is derived from a wall-clock `endsAt` to limit background-tab drift. A single singleton instance prevents overlapping timers in the same session.

### Testing
`FocusTimerUtils` unit tests: **7 passed** (`FocusTimer.test.ts`) covering MM:SS formatting, remaining-time derivation, and custom-minutes validation. Manual wiring checks confirmed mount in `LayerUI`, i18n keys, and expiry toast hookup.

### Known limitations
- Timer state is **local only** for this MVP (not broadcast to collaborators).
- Does not persist across reload; no audio alarm; no keyboard shortcut.
