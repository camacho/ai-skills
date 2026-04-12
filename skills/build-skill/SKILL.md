---
name: build-skill
description: Use when creating a new skill with maximum quality, workflow-conformant. Runs 3 competing parallel approaches (skill-creator, superpowers writing-skills, and manual), compares results on 5 dimensions, then synthesizes the best elements into a final skill. Triggers on "build a skill", "create a skill", "new skill".
---

# Build Skill

Build skills by running 3 competing approaches in parallel inside the full 10-step workflow pipeline.

## Args

The args string is the skill specification. It should contain:
- The skill name (required)
- What the skill does, its modes/subcommands, and any context needed

Example: `/build-skill audit-permissions — wraps a TypeScript analyzer, default mode runs report, reset mode archives logs`

If args are vague, ask one clarifying question before proceeding. Don't over-interview.

## Steps

### Step 1 — Orient

Extract from args:
- **Skill name** (first word or hyphenated phrase before any separator)
- **Skill purpose** (everything else)
- **Scope**: user-level (`~/.claude/skills/`) or project-level (`.claude/skills/`) — default user-level unless the spec mentions a specific project
- **Rules-encoding signal**: does the spec describe governance rules, policies, or decision algebra? If YES, set `RULES_ENCODING=true` — this triggers policy algebra integration in Step 5.

Present a one-line brief: `Building skill [name]: [purpose]. Scope: [user|project]-level.`

### Step 2 — Isolate

Check if already in a worktree (`git rev-parse --git-dir` shows `.git` inside `.worktrees/`).

- Already in a worktree: proceed.
- Not in a worktree: invoke `/using-git-worktrees` to create one before writing any files.

### Step 3 — Design

Invoke `/brainstorming` with the skill spec. One round only — skill specs are usually clear enough for a single pass. Do not recurse into multi-round brainstorming.

Output: confirmed spec + any refinements. Proceed to Step 4 immediately.

### Step 4 — Review

Write a lightweight plan to `ai-workspace/plans/build-skill-<name>.md`:
- Spec (from Step 1)
- Approach: 3 parallel builders (native, superpowers, manual)
- Expected output: final SKILL.md at target path

Invoke `/plan-review` with the technical-editor only, 1 round max. This is a skill document, not architecture — skip architect-reviewer and security-auditor.

Proceed to Step 5 on APPROVE. Revise plan and re-submit once on REVISE. Escalate to human if still blocked.

### Step 5 — Build

This is where the parallel-build pattern runs.

**Pre-build: Policy Algebra (if RULES_ENCODING=true)**

If the skill encodes governance rules (detected in Step 1), invoke `/policy-algebra` in SHALLOW mode against the skill spec to generate a frozen Starlark block. This block becomes a contract that all 3 builders must honor:

1. Run `/policy-algebra <spec-file-or-inline>` to produce the frozen block
2. Append the frozen block to each builder agent's prompt: "The skill MUST include this exact frozen governance block in a `## Governance` section. Do not modify the block."
3. Record the block for post-build verification

If `/policy-algebra` fails or produces <2 invariants, skip algebra integration and proceed with normal build. Log a warning.

Create a unique working directory: `SKILL_TMP=$(mktemp -d -t skill-compare-XXXXXX)` then create `$SKILL_TMP/{native,superpowers,manual}/` subdirectories. Then launch 3 background agents simultaneously via the Agent tool. Each gets the SAME spec but a DIFFERENT approach:

**Agent 1 — "native-builder"**: Invoke `skill-creator:skill-creator` via the Skill tool, then follow its process. Write to `$SKILL_TMP/native/SKILL.md`.

**Agent 2 — "superpowers-builder"**: Invoke `superpowers:writing-skills` via the Skill tool, then follow its structural guidance (skip live subagent pressure testing but follow CSO, token efficiency, frontmatter, and checklist). Write to `$SKILL_TMP/superpowers/SKILL.md`.

**Agent 3 — "manual-builder"**: No skill-building guide. Write the SKILL.md using general best practices and intuition only. Write to `$SKILL_TMP/manual/SKILL.md`.

All agents must be told:
- Write ONLY to their `$SKILL_TMP/<approach>/SKILL.md` path
- Do NOT write to `~/.claude/skills/` or `.claude/skills/`
- The skill spec (passed through verbatim from args)
- Brief context on what a Claude Code skill is (YAML frontmatter with `name` + `description`, markdown body with instructions)

**Compare results.** Once all 3 complete, read all 3 files and score on these dimensions:

| Dimension | What to evaluate |
|---|---|
| **Discoverability** | Does the description help Claude find it? Trigger-only (good) vs workflow summary (bad per CSO)? |
| **Clarity** | Can Claude follow instructions unambiguously? Are steps numbered? |
| **Completeness** | All modes covered? Edge cases? Troubleshooting? |
| **Token efficiency** | Word count vs information density. Target: <500 words for non-startup skills |
| **Actionability** | Concrete actions vs vague guidance? Explicit guardrails for failure modes? |

Present a comparison table with word counts, token costs, and per-dimension winners.

**Synthesize.** Cherry-pick the best elements from each approach into a final skill. For each element kept, note which approach it came from and why. Write the final skill to the target location:
- User-level: `~/.claude/skills/<name>/SKILL.md`
- Project-level: `.claude/skills/<name>/SKILL.md`

**Post-build: Drift Check (if RULES_ENCODING=true)**

After writing the final synthesized SKILL.md, verify the frozen block survived synthesis:

1. Run `/policy-algebra --verify <final-skill-path>` against the frozen block from pre-build
2. Exit code 0 (MATCH): proceed to Step 6
3. Exit code 1 (DRIFT): the synthesis mutated the governance block — re-inject the original frozen block and re-verify
4. Exit code 2/3: log error, proceed without algebra (degraded mode)

### Step 6 — Verify

Run `pnpm validate` to confirm no breakage. If the skill is project-level, also verify it appears in the skills list in the system reminder after writing.

Report final word count and what was taken from each approach.

### Step 7 — Archive

Fill Outcomes & Learnings in `ai-workspace/plans/build-skill-<name>.md`. Invoke `/archive` to rename the plan to `.done.md`.

### Step 8 — Ship

Invoke `/finishing-a-development-branch` — PR or local merge depending on session type.

### Step 9 — Reflect

Invoke `/reflect` to consolidate learnings to MEMORY.md.

## Policy Algebra Integration

When a skill encodes governance rules (detected by the `RULES_ENCODING` signal in Step 1), the build process integrates `/policy-algebra` to ensure rule fidelity:

```
Orient ──→ rules detected? ──YES──→ /policy-algebra SHALLOW
                │                         │
                NO                    frozen block
                │                         │
                ▼                         ▼
           normal build          inject into 3 builders
                                         │
                                         ▼
                                    synthesize
                                         │
                                         ▼
                                  /policy-algebra --verify
                                         │
                                    MATCH? → Step 6
                                    DRIFT? → re-inject + retry
```

Skills that do NOT encode rules skip this entirely — no overhead.

## Known Patterns from Prior Runs

These patterns consistently emerge — use them to inform the merge:

- **Superpowers** excels at: merge guardrails, CSO-compliant descriptions, cross-surface compatibility, explicit failure-mode prevention
- **Manual** excels at: unique safety guardrails humans think of, natural "done" summary steps, concise structure
- **Native (skill-creator)** excels at: comprehensive coverage, but tends to over-explain internals Claude doesn't need — trim aggressively
- **Your own judgment** matters most for: token efficiency and cutting bloat
