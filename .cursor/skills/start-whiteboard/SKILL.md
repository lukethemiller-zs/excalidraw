---
name: start-whiteboard
description: Start the Adobe Whiteboard (Excalidraw app) local dev server for manual testing. Use when the user asks to start, run, launch, or open the whiteboard locally, or wants to test a feature in the browser.
disable-model-invocation: true
---

# Start Whiteboard

Start the local development server so the user can test features in the browser.

## Quick start

From the repository root:

```bash
yarn start
```

This runs `excalidraw-app` via Vite. Default URL: **http://localhost:3000**

If dependencies are already installed and `yarn start` fails on a nested install, start Vite directly:

```bash
cd excalidraw-app && yarn vite
```

## Workflow

1. **Check whether a server is already running**
   - List terminals or check port 3000 (`lsof -i :3000`).
   - If Vite is already up, tell the user the URL and skip starting a second instance.

2. **Verify dependencies**
   - Confirm `node_modules` exists at repo root.
   - Run `yarn install` only if deps are missing or the user reports install errors.

3. **Start the dev server in the background**
   - Run from repo root: `yarn start`, or from `excalidraw-app`: `yarn vite`.
   - Use background execution so the server keeps running.
   - Request full permissions if sandbox yarn install fails (EPERM / corrupt tarball errors).

4. **Confirm readiness**
   - Wait for Vite output containing `Local:` and the port (often 3000; if busy, Vite picks the next free port e.g. 3001).
   - Report the **exact URL from Vite output**, not an assumed port.

5. **Optional: open in browser**
   - On macOS: `open <url-from-vite-output>`

## Port and config

- Port comes from `VITE_APP_PORT` in excalidraw-app env, default **3000** (`excalidraw-app/vite.config.mts`).
- Preview build: `yarn start:production` or `yarn --cwd excalidraw-app build:preview` (port 5000).

## Troubleshooting

| Issue | Action |
|-------|--------|
| `yarn install` EPERM in sandbox | Re-run with full permissions, or use `cd excalidraw-app && yarn vite` when deps exist |
| Port already in use | Report existing process; suggest another port via `VITE_APP_PORT=3001 yarn vite` |
| Blank page / build errors | Run `yarn test:typecheck` for diagnostics; ensure package changes are saved |
| Stale bundle | Restart the dev server |

## After starting

Tell the user:

- The local URL
- What to look for when testing (e.g. top-right **Timer** button for Focus Timer)
- That hot reload applies while the dev server runs

Do not commit, push, or change application code as part of this skill unless the user asks.
