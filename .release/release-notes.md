## 🚀 Adobe Red Shape Toolbar

### What's changed

- Shape toolbar background uses Adobe red (`#EB1000` via `--color-primary`) instead of mid-grey surface tokens
- White icons, keybinding hints, dividers, and hover/active borders for contrast on the red surface
- Selected tools show a white pill with a red icon; eraser active and extra-tools selected states restyled for readability on red
- SCSS-only change in `Toolbar.scss` — no layout, behaviour, or other UI surfaces changed

### User impact

The main shape toolbar reads clearly as Adobe Whiteboard branding, with stronger icon and control contrast on the primary red surface, while keeping the same tools and interactions.

### Technical notes

`.Island.App-toolbar` sets `background-color: var(--color-primary)` and `color: var(--color-icon-white)` in both themes (no separate dark-mode background override). Tool icon fill, selected, hover (`--color-primary-darker`), active, eraser, and extra-tools states are updated in the same stylesheet.

### Testing

No new automated tests (CSS-only). Manual checks from the PR: light-mode Adobe red bar with white icons; selected white-pill and hover/active feedback; dark mode still uses the theme primary red; eraser active state remains visible on red.

### Known limitations

- Dark theme uses dark-theme `--color-primary` (`#FF6B57`) and `--color-primary-darker` (`#FF836F`), not light-mode `#EB1000` / `#C90E00`
- Only the top shapes toolbar; other panels keep existing colours
