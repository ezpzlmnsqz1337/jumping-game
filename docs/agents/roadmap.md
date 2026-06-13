# High-Value Improvement Roadmap

## Near-Term Implementation Plan

1. Centralize trigger and timer run-state transitions so start, end, and teleport behavior is deterministic.
2. Add deterministic trigger tests for start/end/reset sequencing.
3. Reduce client network chatter by throttling player-state sends and skipping unchanged snapshots.

Prioritize in this order unless user requests otherwise.

## 1) Multiplayer authority and smoothing

- Move to clearer server-authoritative state for player transforms.
- Add interpolation/extrapolation to reduce jitter.
- Keep local prediction minimal and reversible.

## 1) Trigger and timer reliability

- Centralize run-state transitions: idle -> running -> finished.
- Enforce anti-cheat sanity checks for impossible times/paths.
- Add deterministic trigger tests.

## 2) Camera robustness

- Add camera obstruction handling (raycast/shape-cast push-in).
- Improve follow/manual mode handoff and defaults.

## 3) Multiplayer authority and smoothing

- Move to clearer server-authoritative state for player transforms.
- Add interpolation/extrapolation to reduce jitter.
- Keep local prediction minimal and reversible.

## 4) Physics stability

- Normalize fixed update cadence assumptions.
- Audit collider layers/masks and remove contradictory combinations.
- Reduce desync from direct transform writes on remote physics bodies.

## 5) Replay/ghost quality

- Version and validate replay format.
- Add fail-safe when replay data is missing/corrupt.
- Store and surface metadata (player name, time, date, map/version).

## 6) UX polish

- Improve onboarding in lobby/settings UI.
- Better feedback for start/end/teleport events.
- Add clearer multiplayer connection/status indicators.
