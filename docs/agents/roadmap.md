# High-Value Improvement Roadmap

## Recently Completed

1. Trigger and timer reliability
- Centralized run-state transitions through GameLevel orchestration methods.
- Added anti-cheat sanity checks for impossible run times and invalid checkpoint counts.
- Added deterministic trigger/timer unit coverage.

2. Multiplayer smoothing
- Added interpolation for remote player transforms to reduce visible jitter.
- Improved update handling to reduce abrupt remote snaps.

3. Camera robustness (phase 1)
- Added explicit automatic mode API for both follow and arc-rotate camera flows.
- Kept wall-obstruction handling in follow camera.

4. Physics stability (phase 1)
- Kept remote-player physics pre-step suspended for the entire interpolation window.
- Added collision layer audit helpers and tests to detect contradictory mask setups.

## Next Priorities

1. Replay and ghost quality
- Version and validate replay format.
- Add fail-safe when replay data is missing or corrupt.
- Store and surface metadata (player name, time, date, map, version).

2. UX polish
- Improve onboarding in lobby and settings flows.
- Add clearer feedback for start, end, and teleport events.
- Add clearer multiplayer connection and status indicators.

3. Multiplayer authority hardening (optional, deeper pass)
- Move further toward server-authoritative transform resolution.
- Add bounded extrapolation for packet gaps and lag spikes.
- Keep local prediction minimal and reversible.
