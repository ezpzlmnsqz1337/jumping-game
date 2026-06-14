# Team Workflow Guide

## Overview

This project has a feature development team workflow using custom OpenCode agents. When you switch to the `feature-lead` agent and describe a feature, bug fix, or refactor, it orchestrates a team of specialized subagents to implement it end-to-end — each task on its own branch, ending with a pull request for you to review and merge.

## Quick Start

1. Press **Tab** in OpenCode to cycle to the `feature-lead` agent.
2. Describe your task at a high level (e.g., "Add a speed-run leaderboard" or "Fix the multiplayer rubber-banding bug").
3. The feature-lead will ask clarifying questions if needed.
4. Approve the plan, then watch the team work on a dedicated branch.
5. When done, review the pull request and merge if satisfied.

You can also invoke the `feature-workflow` skill from any agent to load the workflow instructions.

## Team Members

| Agent | Mode | Role | Edit Access |
|-------|------|------|-------------|
| `feature-lead` | Primary | Orchestrator — plans, delegates, synthesizes | Full |
| `team-architect` | Subagent | Technical design, module boundaries, data flow | None |
| `team-developer` | Subagent | Code implementation | Full |
| `team-reviewer` | Subagent | Code review, quality, conventions | None |
| `team-tester` | Subagent | Writes and runs tests | Full |
| `team-ui-ux-designer` | Subagent | UI/UX specs, accessibility, CSS tokens | None |
| `team-qa` | Subagent | End-to-end verification, runs full check suite | Bash only |

## Workflow Phases

```
1. Understand & Plan  — feature-lead gathers requirements, asks questions, creates branch
2. Architecture       — @team-architect designs the technical approach
3. Implementation     — @team-developer writes the code
4. Review             — @team-reviewer reviews for quality and conventions
5. Testing            — @team-tester writes and runs tests
6. UI/UX Review       — @team-ui-ux-designer reviews UI/UX (if applicable)
7. QA Verification    — @team-qa runs full check suite
8. Synthesize & PR    — feature-lead collects results, opens a pull request
```

## Agent Configuration Files

All agent definitions live in `.opencode/agents/`:
- `feature-lead.md` — Primary orchestrator
- `team-architect.md` — Architecture subagent
- `team-developer.md` — Implementation subagent
- `team-reviewer.md` — Code review subagent
- `team-tester.md` — Test writing subagent
- `team-ui-ux-designer.md` — UI/UX design subagent
- `team-qa.md` — QA verification subagent

The `feature-workflow` skill is at `.opencode/skills/feature-workflow/SKILL.md`.

## How Subagents Work

- Subagents are invoked via the Task tool or @mention (e.g., `@team-developer`).
- Each subagent starts with a fresh context, so the feature-lead passes all relevant information in its delegation prompt.
- You can invoke subagents directly with @mention if you want to use one outside the team workflow.
- The feature-lead uses `todowrite` to track which phase is in progress.

## Branch & PR Policy

- Each task gets its own branch: `feat/<desc>`, `fix/<desc>`, or `refactor/<desc>`
- The feature-lead creates the branch from the current base (usually `main`)
- All subagent work is committed to this branch
- After QA passes, the feature-lead opens a PR with `gh pr create`
- CI runs on the PR automatically
- If CI fails, the team loops back to fix issues before reporting to you
- **You** do the final review and merge — the team never merges their own PRs

## FAQ

**Can I use the team workflow for bug fixes or refactors?**
Yes. The feature-lead adapts the workflow scope — bug fixes skip architecture and UI/UX phases, small fixes skip even more. You can also specify which phases to skip.

**Can I skip phases?**
Yes. Tell the feature-lead which phases to skip (e.g., "skip architecture, just implement this small change").

**Can I use individual team members directly?**
Yes. @mention any subagent like `@team-reviewer review these changes` to use them outside the full workflow.

**How do I modify the agents?**
Edit the markdown files in `.opencode/agents/`. Restart OpenCode after changes.

**What if the developer makes changes the reviewer flags?**
The feature-lead will delegate back to the developer for fixes before moving to QA.