---
name: reflect
description: Post-task review. Extract learnings, classify, write to memory layers, and reconcile GitHub issues.
---

Phase gate: COMMIT checkpoint. This skill MUST verify that .branch-context.md learnings are consolidated to MEMORY.md before the agent considers the task complete.

Post-task review. Do the following in order:

0. **Mark reflect timestamp**: Run `date +%s > "${CLAUDE_PROJECT_DIR}/ai-workspace/.last-reflect-ts"` to reset the auto-reflect reminder for this session.

1. **Review session work**: Check `git log --oneline -10`, recent file edits, and any corrections received this session.
   If a completed plan exists in `ai-workspace/plans/` (Status: complete or Outcomes & Learnings filled in), use it.
   Otherwise, extract learnings from the session directly — git diff, conversation corrections, and patterns discovered.

1b. **Verify issue closure**: Scan commit messages from this branch for `closes #N`, `fixes #N`, `resolves #N` references.
   For each referenced issue, run `gh issue view N --json state` and confirm it is actually closed.
   If an issue is still open despite a closing keyword in a commit, warn: "Issue #N referenced as closed but still open — may need a push or merge to trigger closure."

2. **Extract and classify learnings**: For each learning identified in Step 1 (from a plan's Outcomes & Learnings or directly from the session):
   a. **Project-specific** (references project files, paths, configs)
      → Write to ai-workspace/MEMORY.md only
      Example: "This project uses constructor injection via AppContext (see src/di/container.ts)"

   b. **Cross-project pattern** (general tool behavior, coding pattern, preference)
      → Write to Basic Memory vault via MCP (global knowledge graph)
      Example: "[[DI Patterns]]: Constructor injection with interface contracts prevents test coupling"

   c. **Both** (general pattern with project-specific instance)
      → Write adapted versions to both, with cross-references
      → Vault note links to project; project MEMORY references the pattern

2b. **Comment learnings on related issues**: Post relevant learnings as comments on related GitHub issues.

   **If a plan file exists with `Issue: #N` in frontmatter** (explicit path):
   Comment the learnings from Outcomes & Learnings directly on issue #N.
   Format: "## Learnings from `<plan-name>`\n\n- learning 1\n- learning 2"

   **If no plan file or no Issue field** (fuzzy path):
   Run `gh issue list --state open --json number,title,labels --limit 50`.
   For each learning, compare keywords against open issue titles.
   Present matches to the user for confirmation before commenting.
   Only comment after explicit approval — a bad auto-comment is worse than a missed one.

3. **Write to MEMORY.md**: Append project-specific items. Prune entries older than 30 days.
   Keep under 200 lines. If over, summarize and compress the oldest section.

4. **Write to Basic Memory**: Create or update notes in the vault via MCP.
   Use [[wiki-links]] for connections. Tag with project name for cross-referencing.

5. **ADR check**: If significant patterns emerged not yet formalized, prompt:
   "Should this become an ADR?"

5b. **Create issues from surfaced work**: If the reflect process surfaced TODOs, gotchas, follow-up work, or technical debt not yet tracked, create GitHub issues for them.
   Run `gh issue list --state open --json number,title --limit 50` first to avoid duplicates.
   Use labels appropriate to the type (bug, enhancement, chore, etc.).
   Report created issues in the output summary.

6. **Finalize plan**: Rename completed plan to `<name>.done.md` (triggers write protection).

7. **Scratchpad**: Review `ai-workspace/scratchpad.md`.
   Items marked with `- [ ]` are flagged for elevation to GitHub issues.
   For each `- [ ]` item:
   - Create a GitHub issue with appropriate title and labels
   - Convert the item to `- [x] → #N` with the created issue number
   Items without checkboxes (plain `- ` bullets) are reference material — leave them.

8. **Phase gate verification**:
   - Read `.branch-context.md` if it exists in the worktree or current directory
   - Extract validated learnings from it
   - Verify at least 1 line was added to MEMORY.md (diff check)
   - Clean up worktree: `git worktree remove .worktrees/<name>` (if applicable)
   - If MEMORY.md was NOT updated and .branch-context.md had content, warn: "MEMORY.md not updated — consolidate learnings before declaring task complete"
   - If .branch-context.md is empty or doesn't exist, warn: "No .branch-context.md found — no learnings to consolidate" but still complete (don't block)
   - Gate: Agent cannot declare task complete until this step confirms MEMORY.md updated OR confirms no learnings to consolidate

Output: Summary of what was added to each memory layer, what was pruned, issues created/closed/commented, any ADR prompts.
