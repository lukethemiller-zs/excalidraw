## 🚀 Focus Timer removed (revert)

### What's changed
Reverts PR #8 (“Added timer feature”). The workshop Focus Timer is removed from the whiteboard chrome: `FocusTimer` / `FocusTimer.scss` are deleted, and `LayerUI` no longer mounts the timer next to Inspiration.

### User impact
Facilitators no longer see or use an in-app countdown (presets, custom duration, Start/Pause/Resume/Reset, expiry toast). Timed workshop exercises need an external timer again. Canvas editing, collaboration, and the Inspiration Panel are unchanged.

### Technical notes
Clean revert of the local Layer UI timer only — no scene, appState, or persistence paths were involved, so undo/history and saved drawings are unaffected.

### Testing
Verified against the PR diff: timer component and styles deleted; `LayerUI` import/render of `FocusTimer` removed; no other application files changed. No new automated tests (none existed for the timer).

### Known limitations
- Collaborators who still have a session open with the old build may briefly see the timer until they reload.
