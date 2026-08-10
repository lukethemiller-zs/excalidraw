## 🚀 Adobe Red Toolbar & Whiteboard Dev Skills

### What's changed
- **Shapes toolbar** — `.Island.App-toolbar` now uses solid Adobe red (`#ff0000`) in light and dark themes instead of grey surface tokens (`--color-surface-mid` / `--color-surface-high`).
- **Cursor skills** — added `start-whiteboard` and `stop-whiteboard` agent skills that document how to start root `yarn start` in the background and stop the Vite/dev server via the process tree (no `yarn stop`).

### User impact
The primary drawing toolbar is easier to spot and matches Adobe branding. Agents and developers get a consistent way to start and stop the local whiteboard app without guessing ports or scripts.

### Technical notes
Style change is confined to `packages/excalidraw/components/Toolbar.scss` (no runtime/API behaviour changes). Skills live under `.cursor/skills/` and do not affect the shipped app bundle.

### Testing
Toolbar change verified visually in the running whiteboard app (`yarn start`). Style- and docs-only PR; no new automated tests.
