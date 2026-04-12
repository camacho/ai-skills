# /policy-algebra — Worked Examples

Three self-contained worked cases. Each shows intent, Starlark rule block, and a brief explanation.
Starlark conventions: CAPS_SNAKE for rule functions, lowercase for helpers, DEFAULTS dict for
static values, function bodies ≤ 5 lines, no mutation.

---

## Example 1: Review-panel assemble

**Intent.** A review panel is assembled for every PR. The panel always includes a fixed set of
reviewers (`always`), plus reviewers matched by file-type scope and keyword signals in the PR
body. Reviewers stay on the panel as long as they have open findings above the severity gate.
The loop converges when all reviewers are done, or escalates at a round cap.

```starlark
DEFAULTS = {
    "gate":   "P2",
    "cap":    3,
    "always": ["technical-editor"],
}

# ASSEMBLE: panel = always set + scope matches + keyword matches + includes − excludes.
def ASSEMBLE(scope, overrides):
    panel = DEFAULTS["always"]
    panel = panel + select_by_scope(file_types(scope))
    panel = panel + select_by_keywords(body(scope))
    panel = panel + overrides["include"]
    return diff(panel, overrides["exclude"])

# RETAIN: keep a reviewer while they have findings above the gate severity.
def RETAIN(reviewer, findings):
    return any_above(findings, DEFAULTS["gate"])

# CONVERGE: approve when all reviewers are done; escalate at cap.
def CONVERGE(round, panel, cap):
    if round >= cap:
        return "ESCALATE"
    if all_done(panel):
        return "APPROVE"
    return "CONTINUE"
```

`ASSEMBLE` composes the panel from fixed, scope-derived, and caller-supplied lists in one pass
using `+` (union) and `diff` (set difference). `RETAIN` and `CONVERGE` are single-expression
functions that delegate the termination logic to helpers, keeping each body under 5 lines.

---

## Example 2: Scope-based handler routing

**Intent.** A skill dispatcher routes work to one of three handlers depending on which file
types are in scope: TypeScript files go to `ts-specialist`, configuration files to
`config-reviewer`, and everything else to `general-reviewer`. A PR touching both TypeScript
and config files gets both specialists plus `general-reviewer` as a tiebreaker.

```starlark
DEFAULTS = {
    "fallback": ["general-reviewer"],
    "routes": [
        {"types": ["ts", "tsx"],           "handler": "ts-specialist"},
        {"types": ["json", "yaml", "toml"], "handler": "config-reviewer"},
    ],
}

# ROUTE: union of all handlers whose type list intersects the PR's file types.
def ROUTE(scope):
    matched = [r["handler"] for r in DEFAULTS["routes"]
               if intersect(file_types(scope), r["types"]) != []]
    return matched + DEFAULTS["fallback"] if matched == [] else matched
```

`file_types(scope)` returns the list of extension strings in the changeset. The list
comprehension filters routes by `intersect`, collecting each matching handler. When no route
matches, `DEFAULTS["fallback"]` ensures at least one handler is always assigned.

---

## Example 3: Drift-check invocation

**Intent.** After a skill's governance rules are frozen, callers verify that the rules in the
working tree have not drifted from the frozen baseline. The check runs as a pre-merge or
pre-ship gate — non-zero exit blocks the pipeline.

```bash
#!/usr/bin/env bash
# Verify policy-algebra rules have not drifted from the frozen baseline.
# Usage: bash scripts/verify-rules.sh

FROZEN="ai-workspace/frozen/assemble-panel-rules.md"
CANDIDATE=".claude/skills/assemble-panel/SKILL.md"
CLI="pnpm exec tsx .claude/skills/policy-algebra/lib/cli.ts"

$CLI verify "$FROZEN" "$CANDIDATE"
EXIT=$?

case $EXIT in
  0) echo "MATCH — rules unchanged"       ;;
  1) echo "DRIFT — rules differ from frozen baseline"; exit 1 ;;
  2) echo "INPUT ERROR — missing file or no starlark block"; exit 2 ;;
  *) echo "INTERNAL ERROR (exit $EXIT)"; exit "$EXIT" ;;
esac
```

Exit code 0 means the canonicalized Starlark block in the candidate file is byte-identical to
the frozen baseline after whitespace normalization — no semantic drift. Exit code 1 means the
blocks differ; the CLI prints a unified diff to stdout so the caller can see exactly what
changed. Exit code 2 signals a missing file or a document with no ` ```starlark ` fence —
treat as a misconfigured caller, not a drift event.
