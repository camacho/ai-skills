---
name: catchup
description: Reconstruct working context after /clear, session resume, or compaction.
---

Reconstruct my working context. Read the following in order and synthesize a status summary:

1. **Git state**: Run `git log --oneline -20` and `git status`. Note current branch, recent commits, staged/unstaged changes.
2. **Active plan**: Read `ai-workspace/plans/` — find the most recently modified non-.done.md plan file. Summarize: objective, current phase, next action, open blockers.
3. **Project memory**: Read `ai-workspace/MEMORY.md`. Note anything flagged as in-progress or blocking.
4. **Knowledge graph**: Search Basic Memory via MCP for recent entries related to the current branch name.
5. **Open PRs**: Run `gh pr list --state open` and `gh pr list --state draft`. Note PRs awaiting review.
6. **HANDOFF.md** (if present): Read it. Note dispatched task, target agent, expected output.

Output format:
- **Branch**: <name> — <what we're building>
- **Last commit**: <message>
- **Active plan**: <file> — <current phase> — <next action>
- **Blockers**: <list or "none">
- **Open PRs**: <count and titles>
- **Handoff pending**: <yes/no — detail if yes>

Then ask: "Ready to continue. What would you like to do?"
