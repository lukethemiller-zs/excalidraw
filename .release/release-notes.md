## 🚀 Adobe Red Shape Toolbar

### What's changed

- Shape toolbar (`.Island.App-toolbar`) background uses Adobe red via `var(--color-primary)` (`#EB1000` in light theme) instead of the previous mid-grey surface.
- Toolbar icons, keybinding hints, hover, borders, and dividers are restyled for contrast on red (white icons; white-pill selected state with red icon fill).
- Eraser active state and extra-tools trigger selected styles updated so they stay readable on the red bar.

### User impact

The main shape toolbar reads clearly as Adobe Whiteboard branding, with better icon contrast on the primary red surface in both light and dark themes.

### Technical notes

CSS-only change in `packages/excalidraw/components/Toolbar.scss`. No new components, app-state flags, or theme token edits — the toolbar consumes the existing `--color-primary` (light: `#EB1000`; dark theme uses its existing primary variant).

### Testing

No new automated tests (stylesheet-only). Manual checks from the PR: light-mode red toolbar, white icons, selected white-pill + red icon, dark-mode readability, eraser active state, and extra-tools trigger on red.

### Known limitations

- Dark theme still uses the theme’s dark `--color-primary` (`#FF6B57`), not light-mode `#EB1000`.
