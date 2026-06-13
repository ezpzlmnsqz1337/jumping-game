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

## CSS Design Token Convention

- All UI colors must use `--color-*` variables from `src/style.css`. Do not hardcode hex/rgb values in `.css` files.
- All UI font sizes must use `--font-size-ui-*` variables. Do not hardcode `rem`/`px` font sizes.
- All UI padding values must use `--space-*` variables. Do not hardcode `rem`/`px` spacing.
- When adding a genuinely new value that has no matching token, add the token to `src/style.css` first with a semantic name, then use it.
- Existing palette color names (`--blue`, `--red`, etc.) are for gameplay/player-color use only; use `--color-*` tokens for UI chrome.

## Definition Of Done For Typical Changes

- TypeScript builds cleanly for touched package(s).
- No obvious runtime regressions in movement/jump/timer flow.
- Multiplayer changes tested with at least two clients locally.
- UI changes verified on desktop aspect ratios and a narrow/mobile-like viewport.
- If protocol changed: client/server compatibility confirmed in same branch.
