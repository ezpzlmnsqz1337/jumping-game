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

## Unit Testing Conventions

Following [Writing Great Unit Tests](https://gist.github.com/vadymhimself/763e96dd8495bb77325efd082e63c9f5) (Steve Sanderson) and [UI Testing Best Practices](https://github.com/NoriSte/ui-testing-best-practices):

### 1. Test Organization

- **One file per module** — test files live alongside their source (`src/foo.ts` → `src/foo.test.ts`).
- **Group by subject** with `describe('MyClass', ...)`; nest `describe` for methods.
- **Name tests with S/S/R pattern**: `Subject_scenario_expectedResult`.  
  ✅ Good: `play_showsValidationError_whenNicknameIsEmpty`  
  ✅ Good: `TimerUI.updateUI_rendersLatestTimerString_whenRunning`  
  ❌ Bad: `skips rerender when size has not changed`

### 2. One Logical Assertion Per Test

- Each test should verify exactly one behavior. If a test needs 10 assertions, it's likely testing 3 different things — split it.
- Exception: check multiple properties of a single returned object (e.g., `valid: true` + `reason: undefined`).

### 3. Avoid Unnecessary Preconditions

- Extract common mock creation into factory functions (`createUi()`, `makePlayer()`).
- Don't repeat the same setup code in every test — use `beforeEach` or helpers.
- Keep setup code close to the tests that use it; shared setup that runs for unrelated tests makes tests brittle.

### 4. Test Internals Through Public Interface

- Don't reach into private methods or manipulate internal state to set up scenarios. Use the public API.
- Exception: for pure data/category tests (like `collission-groups.test.ts`), asserting constant properties is acceptable.

### 5. Don't Unit-Test Configuration

- Don't write tests that just assert constants or configuration values exist. That's "proving you can copy and paste".
- Tests that document architecture decisions with `expect(true).toBe(true)` belong in `docs/`, not in test files.

### 6. Mock Carefully

- Mock external services (multiplayer, localStorage, network), not the unit under test.
- Use `vi.spyOn()` for observation, `vi.fn()` for stubs.
- Define typed mock interfaces instead of `as never` casts where practical.
- Reset mocks in `afterEach` with `vi.restoreAllMocks()`.

### 7. Use Fake Timers for Time-Dependent Code

- Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` instead of `setTimeout` with real delays.
- Always restore with `vi.useRealTimers()` in `afterEach`.

### 8. Keep Tests Fast and Deterministic

- No network calls, no real timers, no file I/O.
- Tests must pass in any order, independently.

## Definition Of Done For Typical Changes

- TypeScript builds cleanly for touched package(s).
- No obvious runtime regressions in movement/jump/timer flow.
- Multiplayer changes tested with at least two clients locally.
- UI changes verified on desktop aspect ratios and a narrow/mobile-like viewport.
- If protocol changed: client/server compatibility confirmed in same branch.
