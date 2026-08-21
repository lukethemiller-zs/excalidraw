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
- Branch review of `origin/master...HEAD` — no bugs found

### Known limitations
BrainstormMode is still not mounted in `App.tsx`. Prior closed-unmerged health PRs (#24 Focus Mode tests, #29 Inspiration Panel a11y, #36 DebugFooter, #37 laser-pointer, #38 AppSidebar a11y) remain valid follow-ups.
