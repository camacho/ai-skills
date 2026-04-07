---
name: build-skill
description: Use when creating a new skill with maximum quality. Launches 3 parallel competing approaches (skill-creator, superpowers writing-skills, and manual), compares results on 5 dimensions, then synthesizes the best elements into a final skill. Triggers on "build a skill", "create a skill", "new skill".
---

# Super Mega Ultra Bestest Skill Builder

Build skills by running 3 competing approaches in parallel, then merging the best of each.

## Args

The args string is the skill specification. It should contain:
- The skill name (required)
- What the skill does, its modes/subcommands, and any context needed

Example: `/super-mega-ultra-bestest-skill-builder audit-permissions — wraps a TypeScript analyzer, default mode runs report, reset mode archives logs`

If args are vague, ask one clarifying question before proceeding. Don't over-interview.

## Process

### 1. Parse the spec

Extract from args:
- **Skill name** (first word or hyphenated phrase before any separator)
- **Skill purpose** (everything else)
- **Scope**: user-level (`~/.claude/skills/`) or project-level (`.claude/skills/`) — default user-level unless the spec mentions a specific project

### 2. Launch 3 parallel agents

Create `/tmp/skill-compare/{native,superpowers,manual}/` directories, then launch 3 background agents simultaneously via the Agent tool. Each gets the SAME spec but a DIFFERENT approach:

**Agent 1 — "native-builder"**: Invoke `skill-creator:skill-creator` via the Skill tool, then follow its process. Write to `/tmp/skill-compare/native/SKILL.md`.

**Agent 2 — "superpowers-builder"**: Invoke `superpowers:writing-skills` via the Skill tool, then follow its structural guidance (skip live subagent pressure testing but follow CSO, token efficiency, frontmatter, and checklist). Write to `/tmp/skill-compare/superpowers/SKILL.md`.

**Agent 3 — "manual-builder"**: No skill-building guide. Write the SKILL.md using general best practices and intuition only. Write to `/tmp/skill-compare/manual/SKILL.md`.

All agents must be told:
- Write ONLY to their `/tmp/skill-compare/<approach>/SKILL.md` path
- Do NOT write to `~/.claude/skills/` or `.claude/skills/`
- The skill spec (passed through verbatim from args)
- Brief context on what a Claude Code skill is (YAML frontmatter with `name` + `description`, markdown body with instructions)

### 3. Compare results

Once all 3 complete, read all 3 files and compare on these dimensions:

| Dimension | What to evaluate |
|---|---|
| **Discoverability** | Does the description help Claude find it? Trigger-only (good) vs workflow summary (bad per CSO)? |
| **Clarity** | Can Claude follow instructions unambiguously? Are steps numbered? |
| **Completeness** | All modes covered? Edge cases? Troubleshooting? |
| **Token efficiency** | Word count vs information density. Target: <500 words for non-startup skills |
| **Actionability** | Concrete actions vs vague guidance? Explicit guardrails for failure modes? |

Present the comparison as a table showing word counts, token costs, and per-dimension winners.

### 4. Synthesize

Cherry-pick the best elements from each approach into a final skill. For each element kept, note which approach it came from and why. Write the final skill to the target location:
- User-level: `~/.claude/skills/<name>/SKILL.md`
- Project-level: `.claude/skills/<name>/SKILL.md`

### 5. Verify

- Confirm the skill appears in the available skills list (check system reminder)
- Report final word count
- Show what was taken from each approach

## Known Patterns from Prior Runs

These patterns consistently emerge — use them to inform the merge:

- **Superpowers** excels at: merge guardrails, CSO-compliant descriptions, cross-surface compatibility, explicit failure-mode prevention
- **Manual** excels at: unique safety guardrails humans think of, natural "done" summary steps, concise structure
- **Native (skill-creator)** excels at: comprehensive coverage, but tends to over-explain internals Claude doesn't need — trim aggressively
- **Your own judgment** matters most for: token efficiency and cutting bloat
