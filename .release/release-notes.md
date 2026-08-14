## 🚀 Adobe Red Shape Toolbar

### What's changed

- Shape toolbar background uses Adobe red (`#EB1000` via `--color-primary`) instead of mid-grey (`--color-surface-mid`)
- White icons, keybinding hints, dividers, and hover/active borders for contrast on the red surface
- Dark mode toolbar uses `--color-primary-darker` instead of the previous dark surface grey
- Extra-tools trigger selected state restyled (translucent white background + white icon) so it stays readable on red

### User impact

The main shape toolbar reads clearly as Adobe Whiteboard branding, with stronger icon and control contrast on the primary red surface in both light and dark themes.

### Technical notes

CSS-only change in `packages/excalidraw/components/Toolbar.scss`. The toolbar Island sets `--color-primary` as its background and overrides local CSS variables (`--icon-fill-color`, `--keybinding-color`, `--default-border-color`, `--button-hover-bg`, `--button-active-border`). Extra-tools selected styles are scoped under `.Island.App-toolbar` so they apply on the red bar without affecting other Islands.

### Testing

No new automated tests (stylesheet-only). Manual checks from the PR plan: light-mode Adobe red bar, white icons/keybindings readable, dark-mode darker red, extra-tools selected state visible on red.

### Known limitations

- Dark theme resolves `--color-primary` / `--color-primary-darker` to the dark-theme reds (`#FF6B57` / `#FF836F`), not light-mode `#EB1000`
