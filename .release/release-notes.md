## 🚀 Top-left Adobe logo links to adobe.com

### What's changed

The persistent top-left Adobe logo (shown after the welcome screen is dismissed) is now a clickable link to `https://www.adobe.com`. It opens in a new tab with `rel="noopener noreferrer"` and an `aria-label` of "Adobe". CSS that previously set `pointer-events: none` on the logo was replaced with link styles so the mark is clickable.

### User impact

Users can click the Adobe mark next to the main menu to open adobe.com in a new tab. Previously the logo looked interactive but did nothing when clicked.

### Technical notes

`renderTopLeftUI` in `excalidraw-app/App.tsx` wraps `<ExcalidrawLogo />` in an `<a className="excalidraw-adobe-logo-link">`. `excalidraw-app/index.scss` styles that link and removes the old pointer-events block. A new unit test covers href, target, rel, and label after dismissing the welcome screen.

### Testing

- `yarn test:app --run excalidraw-app/tests/TopLeftLogo.test.tsx` — passed
