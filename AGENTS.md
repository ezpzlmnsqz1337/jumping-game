# AGENTS.md

Guidance for AI coding agents working on this repository.

This file is an index. Keep it short and place detailed guidance in `docs/agents/*`.

## Non-Negotiables

- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Use `nvm use` (resolved via `.nvmrc`) before running Node/npm commands in this WSL2 environment.
- Prefer incremental changes over rewrites.
- If multiplayer protocol/state changes, update both client and server in the same task.
- Preserve gameplay feel unless explicitly asked to redesign mechanics.
- Before committing, run `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run test:ui` — all must pass.
- opencode.json lives at `~/.config/opencode/opencode.json` (not in the project root).

## Quickstart Commands

```bash
nvm use
npm install
npm run dev
```

```bash
nvm use
npm run build:all
```

```bash
nvm use
npm run start:server
```

## Feature Development Team

This project has a team workflow using custom OpenCode agents. Switch to the `feature-lead` agent (Tab key) and describe a feature — it orchestrates architect, developer, reviewer, tester, UI/UX designer, and QA subagents.

- Team workflow guide: `docs/agents/team-workflow.md`

## Documentation Index

- Overview and architecture: `docs/agents/overview.md`
- Environment and commands: `docs/agents/environment.md`
- Engineering agreements and done criteria: `docs/agents/engineering.md`
- CSS conventions and best practices: `docs/agents/css.md`
- CI, linting, formatting, and tests: `docs/agents/ci-cd.md`
- Fragile systems and regression risks: `docs/agents/fragile-areas.md`
- Prioritized improvement roadmap: `docs/agents/roadmap.md`
- Suggested starter tasks: `docs/agents/first-tasks.md`

## Maintenance Rule

- Keep `AGENTS.md` under 80 lines.
- Add or update details in `docs/agents/*`, not here.