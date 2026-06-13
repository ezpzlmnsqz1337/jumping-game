# Known Fragile Areas

- Multiplayer physics consistency and collision behavior are unstable.
- Camera system can clip/wall-pass and does not robustly handle obstructions.
- Player collision toggle in multiplayer is gameplay-useful but technically fragile.
- Ghost replay/demo should be protected against invalid/incomplete recording data.
- Trigger ordering (start/end/reset/teleport) can regress if event sequencing changes.
