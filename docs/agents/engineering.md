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

## Code Review Guidelines

Based on [GitLab Code Review Guidelines](https://docs.gitlab.com/development/code_review/) and [Conventional Comments](https://conventionalcomments.org/).

### 1. Review Focus Areas

When reviewing a merge request, evaluate:

| Area | What to Check |
|------|---------------|
| **Architecture** | Module boundaries respected? New dependencies justified? No circular imports? |
| **Design** | Is the solution the right one? Are there simpler alternatives? |
| **Correctness** | Does the code do what it claims? Edge cases handled? |
| **Consistency** | Follows existing patterns in the codebase? |
| **Readability** | Clear naming? Comments explain *why*, not *what*? |
| **Test coverage** | Tests exist for the new behavior? Edge cases covered? |
| **Security** | No unsafe deserialization, no XSS via innerHTML, no leaked credentials |
| **Performance** | Unnecessary allocations? Expensive operations in render loops? |

### 2. Conventional Comment Format

Use labels to convey intent clearly:
- **`suggestion (non-blocking):`** — Optional improvement, author may ignore.
- **`issue (blocking):`** — Must be resolved before merge.
- **`thought:`** — Open question or discussion.
- **`praise:`** — Highlight good code.
- **`nitpick:`** — Minor style preference.

### 3. Specific Patterns for This Codebase

**Game Root (gameRoot):**
- The singleton is imported directly by most modules. Adding new `gameRoot` dependencies couples that module to the global state.
- Prefer constructor injection for new services or entities (e.g., passing `level` to triggers, `scene` to entities).

**Multiplayer:**
- Changes to physics or speed mechanics must use `pendingTeleportFlag` to avoid false server corrections.
- Any modification to remote player movement must update both client interpolation and server validation.

**UI:**
- All UI classes extend `AbstractUI` and follow the `loadCss()` → `loadHtml()` → `bindUI()` lifecycle.
- UI communicates via optional chaining through `gameRoot.uiManager?.targetUI.method()` — never hard-reference a UI from another module.
- CSS must use design tokens from `src/style.css`. Never hardcode values.

**Triggers:**
- `Trigger` subclasses call `this.level.*()` methods (e.g., `armRunFromStart`). New trigger types must go through `GameLevel` transition methods, not bypass them.
- The trigger key in `serialize()` uses `this.triggerType` — ensure it matches the expected key in `DocumentLevel`.

**Level Editor:**
- GizmoManager `attachableMeshes: null` means "all meshes pickable" — this is unintuitive. Document any changes to edit mode toggling.

### 4. Acceptance Checklist

Before approving a merge request:
- [ ] Code follows existing patterns (singleton pattern, AbstractUI lifecycle, trigger → level callbacks)
- [ ] All edge cases are handled or documented
- [ ] Automated tests exist and pass
- [ ] No unnecessary type assertions (`as never`, `as any`) where proper types are feasible
- [ ] No `eslint-disable` comments without a clear reason
- [ ] For multiplayer changes: both client and server updated in the same task
- [ ] For UI changes: verified with design tokens, not hardcoded values
- [ ] For physics changes: tested both single-player and multiplayer
- [ ] For camera changes: movement remains playable on keyboard

## Definition Of Done For Typical Changes

- TypeScript builds cleanly for touched package(s).
- No obvious runtime regressions in movement/jump/timer flow.
- Multiplayer changes tested with at least two clients locally.
- UI changes verified on desktop aspect ratios and a narrow/mobile-like viewport.
- If protocol changed: client/server compatibility confirmed in same branch.
- For CSS changes: `npm run lint:css` passes with no errors.
- For CSS changes: new tokens added to `src/style.css` before use.
