## 🚀 Adobe Red Toolbar

### What's changed

The main top shapes toolbar now uses Adobe brand red (`#fa0f00`) as its background instead of the previous grey. The change applies in both light and dark themes.

### User impact

Gives the toolbar a distinct Adobe-branded look, reinforcing the product identity while keeping the toolbar's layout and behaviour exactly as before.

### Technical notes

- Single, styling-only change in `packages/excalidraw/components/Toolbar.scss`.
- Overrides the `.Island.App-toolbar` background, replacing the theme tokens `--color-surface-mid` (light) and `--color-surface-high` (dark) with a hard-coded `#fa0f00`.
- No component logic, state, or markup was touched; all other UI surfaces (left properties panel, footer, mobile toolbar) are unchanged.

### Testing

- Manual/visual verification only (via `yarn start`, inspecting the top-center toolbar in light and dark mode).
- No automated tests were added or run for this styling change.

### Known limitations

- Tool icons and keybinding labels remain dark; contrast against the red background has not been adjusted.
- The red is a fixed hex value rather than a theme token, so it does not adapt to future theming changes.
- Only the top shapes toolbar is affected; other toolbars/panels retain their existing colours.
