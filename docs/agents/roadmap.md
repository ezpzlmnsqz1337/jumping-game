# High-Value Improvement Roadmap

Prioritize in this order unless user requests otherwise.

## 1) Multiplayer authority and smoothing

- Move to clearer server-authoritative state for player transforms.
- Add interpolation/extrapolation to reduce jitter.
- Keep local prediction minimal and reversible.

## 2) Trigger and timer reliability

- Centralize run-state transitions: idle -> running -> finished.
- Enforce anti-cheat sanity checks for impossible times/paths.
- Add deterministic trigger tests.

## 3) Camera robustness

- Add camera obstruction handling (raycast/shape-cast push-in).
- Improve follow/manual mode handoff and defaults.

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
