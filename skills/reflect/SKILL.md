---
name: reflect
description: Post-task review. Extract learnings, classify, and write to memory layers.
---

Phase gate: COMMIT checkpoint. This skill MUST verify that .branch-context.md learnings are consolidated to MEMORY.md before the agent considers the task complete.

Post-task review. Do the following in order:

0. **Mark reflect timestamp**: Run `date +%s > "${CLAUDE_PROJECT_DIR}/ai-workspace/.last-reflect-ts"` to reset the auto-reflect reminder for this session.


1. **Review session work**: Check `git log --oneline -10`, recent file edits, and any corrections received this session.
   If a completed plan exists in `ai-workspace/plans/` (Status: complete or Outcomes & Learnings filled in), use it.
   Otherwise, extract learnings from the session directly — git diff, conversation corrections, and patterns discovered.

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

3. **Write to MEMORY.md**: Append project-specific items. Prune entries older than 30 days.
   Keep under 200 lines. If over, summarize and compress the oldest section.

4. **Write to Basic Memory**: Create or update notes in the vault via MCP.
   Use [[wiki-links]] for connections. Tag with project name for cross-referencing.

5. **ADR check**: If significant patterns emerged not yet formalized, prompt:
   "Should this become an ADR?"

6. **Finalize plan**: Rename completed plan to `<name>.done.md` (triggers write protection).

7. **Scratchpad**: Review ai-workspace/scratchpad.md. Mark graduated items
   with strikethrough and pointer to plan/ADR.

8. **Phase gate verification**:
   - Read `.branch-context.md` if it exists in the worktree or current directory
   - Extract validated learnings from it
   - Verify at least 1 line was added to MEMORY.md (diff check)
   - Clean up worktree: `git worktree remove .worktrees/<name>` (if applicable)
   - If MEMORY.md was NOT updated and .branch-context.md had content, warn: "MEMORY.md not updated — consolidate learnings before declaring task complete"
   - If .branch-context.md is empty or doesn't exist, warn: "No .branch-context.md found — no learnings to consolidate" but still complete (don't block)
   - Gate: Agent cannot declare task complete until this step confirms MEMORY.md updated OR confirms no learnings to consolidate

Output: Summary of what was added to each memory layer, what was pruned, any ADR prompts.
