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

5. Replay and ghost quality
- Added replay format versioning (`v1`) and payload validation.
- Added fail-safe handling for missing/corrupt/unsupported replay data.
- Added replay metadata capture/surface (player, time, date, map, replay version, source).
- Added legacy replay migration path with warning logs and tests.

6. UX polish (phase 1)
- Improved onboarding copy in lobby/settings flows.
- Added explicit start/end/teleport run-status feedback in timer UI.
- Added multiplayer connection status indicators for connect/disconnect/reconnect states.

## Next Priorities

1. Multiplayer authority hardening (optional, deeper pass)
- Move further toward server-authoritative transform resolution.
- Extend bounded extrapolation pass with stronger server correction policies.
- Keep local prediction minimal, reversible, and capped under prolonged packet loss.

2. UX polish (phase 2)
- Tune message timing/priority to reduce overlap between timer, connection, and chat surfaces.
- Add optional toast/sound mapping for key state transitions.

3. Replay and ghost quality (phase 2)
- Consider separate local-best vs bundled-map-record storage slots.
- Add explicit migration telemetry/debug counters for replay upgrades.
