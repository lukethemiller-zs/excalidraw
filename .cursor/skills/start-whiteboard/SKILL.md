---
name: start-whiteboard
description: Start the Excalidraw whiteboard app with yarn start. Use when the user asks to start the whiteboard, run the app, start the dev server, or invokes Start Whiteboard.
disable-model-invocation: true
---

# Start Whiteboard

Start the Excalidraw whiteboard development app from the repository root.

## Instructions

1. Check existing terminals for an already-running whiteboard/dev server (`yarn start` or Vite). If it is already running, tell the user and do not start a second instance.
2. From the repository root, run:

```bash
yarn start
```

3. Run it as a long-lived background process (do not block waiting for it to exit).
4. Confirm startup from the terminal output (e.g. local URL) and report that URL to the user.

## Notes

- Root `yarn start` runs `yarn --cwd ./excalidraw-app start` (the full whiteboard app).
- Do not run install, build, or other setup unless startup fails and the error clearly requires it.
