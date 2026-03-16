# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of AI skills installed via `npx skills`. Skills are markdown-driven — each skill is a `SKILL.md` file with YAML frontmatter, consumed by AI agents (Claude Code, Codex). There is no build step, no package.json, no compiled output.

## Repo structure

```
skills/<skill-name>/SKILL.md
```

Each skill folder contains a single `SKILL.md`. No other files are required per skill. `npx skills` discovers skills automatically by scanning `skills/` — there is no registry or index to maintain.

## SKILL.md contract

Every `SKILL.md` must have YAML frontmatter with:
- `name` — lowercase, hyphens for spaces, must match the folder name
- `description` — what the skill does and when to trigger it (used by the CLI for discovery and routing)

The markdown body contains the full instructions the agent follows when the skill is invoked.

## Commands

Install a skill globally for Claude Code and Codex:
```sh
npx skills add ~/projects/camacho/ai-skills --skill <skill-name> -g -a claude-code -a codex -y
```

List installed skills:
```sh
npx skills list -g
```

## Conventions

- Skills are self-contained in their SKILL.md — no per-skill README needed
- Skill names use lowercase with hyphens (e.g., `name-project`)
- The folder name must match the `name` field in SKILL.md frontmatter
- When editing a skill, work directly on its SKILL.md — Claude Code picks up changes automatically
