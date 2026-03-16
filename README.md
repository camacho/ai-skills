# ai-skills

A collection of AI skills for Claude Code and Codex, installed via [`npx skills`](https://skills.sh).

## Repo structure

```
ai-skills/
└── skills/
    └── <skill-name>/
        └── SKILL.md
```

Each skill is a folder under `skills/` containing a `SKILL.md` with YAML frontmatter (`name`, `description`) and markdown instructions. No other files are required — `npx skills` discovers skills automatically by scanning the `skills/` directory.

## Install a skill globally

```sh
npx skills add ~/projects/camacho/ai-skills --skill <skill-name> -g -a claude-code -a codex -y
```

## Verify installed skills

```sh
npx skills list -g
```

## Update a skill after editing

Re-run the install command, or — for Claude Code — file changes are picked up automatically. Codex picks up changes on next session start.

## Add a new skill

1. Create a folder under `skills/` with your skill name
2. Add a `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: my-skill
   description: What it does and when to trigger it.
   ---
   ```
3. Install it:
   ```sh
   npx skills add ~/projects/camacho/ai-skills --skill my-skill -g -a claude-code -a codex -y
   ```

## Available skills

| Skill | Description |
|-------|-------------|
| [name-project](skills/name-project/SKILL.md) | Interactive naming sessions for projects, apps, packages, tools, or repos |
