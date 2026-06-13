# AGENTS.md

Guidance for AI coding agents working on this repository.

This file is an index. Keep it short and place detailed guidance in `docs/agents/*`.

## Non-Negotiables

- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Use `nvm use 20` (or install it first) before running Node/npm commands in this WSL2 environment.
- Prefer incremental changes over rewrites.
- If multiplayer protocol/state changes, update both client and server in the same task.
- Preserve gameplay feel unless explicitly asked to redesign mechanics.

## Quickstart Commands

```bash
nvm use 20 || nvm install 20
npm install
npm run dev
```

```bash
nvm use 20 || nvm install 20
npm run build:all
```

```bash
nvm use 20 || nvm install 20
npm run start:server
```

## Documentation Index

- Overview and architecture: `docs/agents/overview.md`
- Environment and commands: `docs/agents/environment.md`
- Engineering agreements and done criteria: `docs/agents/engineering.md`
- Linting and formatting: `docs/agents/ci-cd.md`
- Fragile systems and regression risks: `docs/agents/fragile-areas.md`
- Prioritized improvement roadmap: `docs/agents/roadmap.md`
- Suggested starter tasks: `docs/agents/first-tasks.md`

## Maintenance Rule

- Keep `AGENTS.md` under 80 lines.
- Add or update details in `docs/agents/*`, not here.