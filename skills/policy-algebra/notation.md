# Policy Algebra Notation

Governance rules are written in Starlark with the conventions below.
Starlark is Bazel's rule language — a deterministic Python subset.

Reference: https://github.com/bazelbuild/starlark/blob/master/spec.md

**Spec stability note:** Starlark is pinned to Bazel's convention as of 2026.
The `bazelbuild/starlark` repo is the canonical reference but has seen minimal
updates in recent years — Bazel uses its own Go implementation as the de facto
reference. This skill treats Starlark as a notation to borrow, not a formal
ISO-style standard. If Bazel's convention diverges materially, we pin to a
specific commit of the spec repo in a follow-up.

## Why Starlark

Deterministic, no I/O, parseable everywhere, familiar syntax.
One language for the whole ruleset — no second DSL for predicates.

## Conventions

1. UPPER_CASE for rule function names (CAPS_SNAKE when multi-word): ASSEMBLE, RETAIN, CONVERGE
2. lowercase for helpers: diff, intersect, select_by_scope
3. Top-level DEFAULTS dict for static values (gate, cap, named lists)
4. One comment per function stating its invariant in prose
5. Function bodies ≤ 5 lines (split into helpers if longer)
6. No mutation — return new values

## Core operators (built-in Starlark)

  +                   list concatenation = union
  in / not in         membership
  ==, !=, <, >=       comparison
  and, or, not        boolean
  [x for x in y if p] list comprehension

## Helper functions (defined in notation.md, implemented as skill convention)

  diff(a, b)          elements of a not in b
  intersect(a, b)     elements in both
  union(*lists)       flatten + dedupe
  any_above(xs, t)    xs has an element with severity >= t
  all_done(xs)        every element has .done == True

## Canonical rule shape (seed example — from assemble-panel v1)

```starlark
DEFAULTS = {
    "gate": "P2",
    "cap":  3,
    "always": ["technical-editor"],
}

# ASSEMBLE: panel is always set plus scope and keyword matches, minus exclusions.
def ASSEMBLE(scope, overrides):
    panel = DEFAULTS["always"] + select_by_scope(file_types(scope))
    panel = panel + select_by_keywords(body(scope)) + overrides["include"]
    return diff(panel, overrides["exclude"])

# RETAIN: keep reviewers while they have findings above gate.
def RETAIN(reviewer, findings):
    return any_above(findings, DEFAULTS["gate"])

# CONVERGE: approve when all reviewers done, escalate at cap.
def CONVERGE(round, panel, cap):
    if round >= cap:
        return "ESCALATE"
    if all_done(panel):
        return "APPROVE"
    return "CONTINUE"
```

## What this is NOT

- Not executed at runtime — Starlark is a specification Claude reads.
- Not a full Starlark evaluator — lib/ only canonicalizes and diffs text.
- Not typed — reader relies on naming conventions for intent.
