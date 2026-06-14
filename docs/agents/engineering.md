# Engineering Agreements

## Working Agreements For Agents

- Preserve gameplay feel unless explicitly asked to redesign mechanics.
- Prefer incremental fixes over broad rewrites.
- Keep code TypeScript-first and consistent with existing style in touched files.
- Avoid introducing new frameworks unless they solve a concrete, documented pain.
- When changing multiplayer protocol/state shape, update both client and server in the same task.
- For physics changes, test both single-player behavior and multiplayer side effects.
- For camera changes, verify movement remains playable on keyboard.

## Commit And Change Hygiene

- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Keep commits focused by system (camera, triggers, multiplayer, UI).
- Document assumptions in PR/summary when touching gameplay math or netcode.
- If a fix needs a tradeoff (fairness vs smoothness, realism vs responsiveness), prefer responsive gameplay unless user asks for strict simulation.

## CSS Best Practices

CSS conventions are documented in `docs/agents/css.md`. It covers design tokens, selector rules, layout practices, and code review checklist. **Read it before writing any CSS.**

### Design Token Convention (Quick Reference)

- All UI colors must use `--color-*` variables from `src/style.css`. No hardcoded hex/rgb.
- All UI font sizes must use `--font-size-ui-*` variables. No hardcoded `rem`/`px`.
- All UI spacing must use `--space-*` variables (scale from `none` to `5xl`). No hardcoded `rem`/`px`.
- Palette colors (`--blue`, `--red`, etc.) are for gameplay only — never for UI chrome. Exception: `--color-status-positive` and `--color-status-negative` alias `--green` and `--red` respectively for status indicators (ready/online, offline/reset).
- Status badges use `.active` class to toggle between white (active) and gray (inactive) appearance — no separate color tokens needed.
- If a token is missing, add it to `src/style.css` first.

## Definition Of Done For Typical Changes

- TypeScript builds cleanly for touched package(s).
- No obvious runtime regressions in movement/jump/timer flow.
- Multiplayer changes tested with at least two clients locally.
- UI changes verified on desktop aspect ratios and a narrow/mobile-like viewport.
- If protocol changed: client/server compatibility confirmed in same branch.
