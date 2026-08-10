---
name: stop-whiteboard
description: Stop the Excalidraw whiteboard app by terminating the yarn start / Vite process. Use when the user asks to stop the whiteboard, shut down the app, stop the dev server, or invokes Stop Whiteboard.
disable-model-invocation: true
---

# Stop Whiteboard

Stop the Excalidraw whiteboard development app.

## Instructions

1. Find a running whiteboard/dev server:
   - Check terminals for an active `yarn start` / Vite session
   - Or find the process listening on port `3001` (default local URL)
2. If none is running, tell the user and stop.
3. Terminate the server process tree (prefer the terminal/`yarn start` parent PID so child Vite/node processes exit too). Example:

```bash
# PID listening on the whiteboard port
lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill
```

If that leaves orphans, kill the matching `yarn start` / `vite` process from the terminal metadata.

4. Confirm stop: port `3001` is no longer listening and the terminal session has exited. Tell the user the whiteboard is stopped.

## Notes

- Do not run `yarn stop` — that script does not exist in this repo.
- Do not kill unrelated node processes.
