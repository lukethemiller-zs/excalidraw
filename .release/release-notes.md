## 🚀 Start Whiteboard Cursor skill

### What's changed

Adds a Cursor skill at `.cursor/skills/start-whiteboard/SKILL.md` for starting the Adobe Whiteboard (`excalidraw-app`) local Vite dev server during manual testing.

The skill documents:

- Prefer `yarn start` from the repo root (fallback: `cd excalidraw-app && yarn vite` when nested install fails)
- Check for an existing server before starting a second instance
- Confirm dependencies / run `yarn install` only when needed
- Wait for Vite’s `Local:` URL and report the **exact** port (default from `VITE_APP_PORT`, typically 3000; next free port if busy)
- Optional browser open on macOS, plus common troubleshooting (sandbox EPERM, port in use, blank page, stale bundle)

`disable-model-invocation: true` — agents invoke it when the user asks to start/run/launch the whiteboard locally, not automatically.

### User impact

No end-user product change. Developers and Cursor agents get a consistent workflow to bring up the local whiteboard for manual feature testing without guessing ports or duplicating servers.

### Technical notes

Docs-only: one new skill markdown file under `.cursor/skills/`. No application, package, or test code changes. Port comes from `excalidraw-app` Vite config / `VITE_APP_PORT`.

### Testing

No automated tests (docs-only). Manual verification: invoke `/start-whiteboard`, confirm the skill is at `.cursor/skills/start-whiteboard/SKILL.md`, and confirm the agent starts Vite and reports the URL from server output.

### Known limitations

- Developer/agent tooling only — not visible in the product UI
- Skill must be invoked explicitly (`disable-model-invocation: true`)
