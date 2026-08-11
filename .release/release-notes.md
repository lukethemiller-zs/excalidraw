## 🚀 BrainstormMode API fix & debug-log cleanup

### What's changed
BrainstormMode now uses the supported `useExcalidrawAPI` hook instead of the non-existent `useAdobeWhiteboardAPI`, and leftover localhost agent-log `fetch` calls were removed from app startup paths. Sticky placement and shortcut helpers were extracted for unit testing.

### User impact
Restores a clean TypeScript build and removes accidental debug network calls during app boot. BrainstormMode remains unmounted in the main app UI (unchanged product decision).

### Technical notes
- Removed `#region agent log` ingest calls from `excalidraw-app/index.tsx`, `App.tsx`, and `BrainstormMode.tsx`
- Switched BrainstormMode to `useExcalidrawAPI`
- Added `brainstormModeHelpers.ts` + focused Vitest coverage

### Testing
- `yarn test:typecheck` — pass
- `yarn test:app --watch=false excalidraw-app/tests/brainstormModeHelpers.test.ts` — 6/6 pass

### Known limitations
BrainstormMode is still not mounted in `App.tsx`. Separate open health PRs (#24 Focus Mode tests, #29 Inspiration Panel a11y) are unchanged.
