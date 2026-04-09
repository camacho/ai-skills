---
name: plan-review
description: Auto-assembles review panel using deterministic rules, dispatches agents against plan file, collects verdicts.
---

Phase gate: PLAN checkpoint. MUST get APPROVE from all reviewers before proceeding to Build.

## Inputs
- Plan file path (default: most recent non-`.done.md` file in `ai-workspace/plans/`)
- `--include <agent>`: Force-add an agent to the panel
- `--exclude <agent>`: Remove an agent (except technical-editor, which cannot be excluded)

## Steps

1. **Find the plan file**:
   ```bash
   ls -t ai-workspace/plans/*.md | grep -v '.done.md' | head -1
   ```
   If no plan file found → error: "No plan file in ai-workspace/plans/. Write a plan first."
   If plan file is `.done.md` → error: "This plan is already finalized."

2. **Read the plan** and extract:
   - Files to Modify section
   - Full body text
   - Plan scope (count files changed, count body lines)

3. **Auto-assemble the review panel** using these deterministic rules:

   **Tier 1 — Always included:**
   | Agent | When |
   |-------|------|
   | `technical-editor` | EVERY plan review (cannot be excluded) |

   **Tier 2 — Auto-included by scope:**
   | Agent | Trigger |
   |-------|---------|
   | `code-reviewer` | Plan includes ANY code changes (files ending in `.ts`, `.js`, `.sh`, `.yml`, or paths containing `src/`, `tests/`) |
   | `architect-reviewer` | Plan is medium/large: >3 files changed, OR plan body >100 lines, OR multiple workflow steps affected |

   **Tier 3 — Auto-included by keyword scanning:**
   | Agent | Trigger keywords (scan Files to Modify + body) |
   |-------|-----------------------------------------------|
   | `codex-specialist` | AGENTS.md, config.toml, sync.sh, skills, dotfiles |
   | `designer` + `design-reviewer` | component, UI, CSS, design, wireframe, mockup, Figma, layout |
   | `security-auditor` | auth, credentials, permissions, OWASP, token, secret, vulnerability |
   | `accessibility-tester` | a11y, WCAG, aria, keyboard, screen reader, focus, semantic HTML |
   | `fact-checker` | docs, research, ecosystem, reference, guide, educational |

   Log which agents were selected and why.

4. **Apply overrides**: `--include` adds agents, `--exclude` removes (except technical-editor).

5. **Dispatch all selected agents IN PARALLEL** using the Agent tool (single message, multiple Agent tool calls). Each agent receives:
   - The plan file content
   - Their specific review mandate
   - Instructions to return: APPROVE / REVISE / DROP with findings tagged P0/P1/P2

6. **Collect verdicts** and synthesize into a summary table:
   ```
   ## Plan Review Summary
   | Agent | Verdict | P0 | P1 | P2 | Key Finding |
   |-------|---------|----|----|-----|-------------|
   ```

7. **Gate logic and review loop** — invoke `/assemble-panel` for panel governance. It provides the policy algebra (gate=P2, cap=3) and handles RETAIN, EXPAND, CONVERGE, and ESCALATE_RECURRING. Do not duplicate those rules here.

   After each round:
   - All APPROVE with no above-gate findings → "Proceed to Build"
   - Above-gate findings remain → fix, then re-review per assemble-panel's RETAIN + EXPAND rules
   - Cap reached with unresolved findings → escalate to human

   If `/assemble-panel` is unavailable, fall back: keep all reviewers with above-gate findings, exit at round 3 or when all clean.

## Panel Bounds
- Minimum: technical-editor alone (1 agent, trivial plans)
- Typical: technical-editor + code-reviewer + architect-reviewer (3)
- Maximum: all agents (rare, large cross-cutting plans)
