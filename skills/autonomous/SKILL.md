---
name: autonomous
description: Exit copilot mode — return to autonomous mode with full worktree enforcement.
user_invocable: true
---

# Return to Autonomous Mode

> **Claude Code only** — Codex and Cursor sessions are always autonomous.

## Activate

```bash
.claude/hooks/activate-autonomous.sh
```

If the script does not exist, tell the user: "This project doesn't have mode switching hooks. You are already in autonomous mode by default."

## Confirmation

After activation, print:

```
Mode: autonomous
Worktree enforcement active. Full workflow pipeline.
```

## Behavior

Follow **autonomous mode** rules in `.claude/rules/operating-mode.md`.
