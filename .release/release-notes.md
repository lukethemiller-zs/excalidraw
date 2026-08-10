## 🚀 Adobe Red Toolbar

### What's changed
The primary shapes toolbar now uses Adobe brand red (`#ff0000`) as its background in both light and dark themes, replacing the previous grey surface tokens.

### User impact
The toolbar is more visually distinct and aligned with Adobe branding, making the main drawing tools easier to spot at a glance.

### Technical notes
Updated `.Island.App-toolbar` background in `packages/excalidraw/components/Toolbar.scss` only — no behaviour or API changes.

### Testing
Verified visually in the running whiteboard app (`yarn start` at http://localhost:3003/). Style-only change; no new automated tests.
