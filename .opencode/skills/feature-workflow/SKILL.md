---
name: feature-workflow
description: "Orchestrates a team workflow for feature development, bug fixes, and refactors. Each task gets its own branch and ends with a pull request for you to review and merge. Loads the full team workflow instructions for the feature-lead agent."
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: team-orchestration
---

# Feature Development Team Workflow

This skill activates the team workflow for feature development, bug fixes, and refactors. Each task runs on its own branch and ends with a pull request for you to review and merge.

## How to Use

1. **Switch to feature-lead agent**: Use Tab to cycle to `feature-lead`, or @mention `@feature-lead`.
2. **Describe your task**: Give a high-level description of what you want (feature, bug fix, or refactor).
3. **Answer questions**: The feature-lead may ask clarifying questions before planning.
4. **Approve the plan**: Review the implementation plan and approve or adjust it.
5. **Watch the team work**: The feature-lead creates a branch, delegates to subagents, and opens a PR.
6. **Review the PR**: Once CI passes, you do the final review and merge.

## Team Workflow Phases

```
Phase 1: Understand & Plan → Create branch
    ↓
Phase 2: Architecture (@team-architect)
    ↓
Phase 3: Implementation (@team-developer)
    ↓
Phase 4: Code Review (@team-reviewer)
    ↓
Phase 5: Testing (@team-tester)
    ↓
Phase 6: UI/UX Review (@team-ui-ux-designer) [if UI changes]
    ↓
Phase 7: QA Verification (@team-qa)
    ↓
Phase 8: Synthesize & Create PR
```

## Subagents

| Agent | Role | Access |
|-------|------|--------|
| `team-architect` | Technical design & architecture | Read-only |
| `team-developer` | Code implementation | Full edit + bash |
| `team-reviewer` | Code review & quality | Read-only |
| `team-tester` | Writing & running tests | Edit tests + bash |
| `team-ui-ux-designer` | UI/UX specs & design | Read-only |
| `team-qa` | End-to-end verification | Read-only + bash |

## Branch & PR Policy

- Each task gets its own branch: `feat/...`, `fix/...`, or `refactor/...`
- The feature-lead creates the branch from the current base (usually `main`)
- All subagent work is committed to this branch
- After QA passes, a pull request is created with `gh pr create`
- You do the final review and merge — the team never merges their own PRs

## Testing Conventions

All tests must follow the conventions in `docs/agents/engineering.md` (section: Unit Testing Conventions).
Key rules:
- **S/S/R naming**: `Subject_scenario_expectedResult`
- **One logical assertion per test** — split tests that verify multiple behaviors
- **No test-as-documentation** — pure constant assertions belong in `docs/`, not test files
- **Factory helpers** for common setup, not `beforeEach` bloat
- **No `as never`** — use typed mock interfaces instead
- **Fake timers** for time-dependent code, not real `setTimeout`

The `@team-tester` subagent is responsible for writing and maintaining tests that follow these conventions.

## Tips

## Example Prompts

- "Add a speed-run leaderboard that shows the top 10 times for each level"
- "Implement a death counter that displays on the HUD and persists across runs"
- "Add a practice mode where players can respawn at the last checkpoint"
- "Create a settings panel for audio volume (master, music, SFX)"
- "Fix the multiplayer rubber-banding issue when players have high latency"