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

## Definition Of Done For Typical Changes

- TypeScript builds cleanly for touched package(s).
- No obvious runtime regressions in movement/jump/timer flow.
- Multiplayer changes tested with at least two clients locally.
- UI changes verified on desktop aspect ratios and a narrow/mobile-like viewport.
- If protocol changed: client/server compatibility confirmed in same branch.
