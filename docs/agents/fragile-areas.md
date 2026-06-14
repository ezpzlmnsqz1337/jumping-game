# Known Fragile Areas

- Multiplayer physics consistency and collision behavior are improved but still sensitive under lag spikes and packet gaps.
- Camera system has better mode handoff controls, but edge-case clipping can still appear in dense geometry.
- Player collision toggle in multiplayer is gameplay-useful but technically fragile.
- Ghost replay/demo now validates payload shape/version and migrates legacy data, but metadata/source fields can still regress if future formats diverge without migration updates.
- Trigger ordering (start/end/reset/teleport) is centralized, but can regress if new trigger paths bypass GameLevel transition methods.
- Multiplayer now uses bounded extrapolation for short packet gaps; overshoot limits and reconciliation thresholds are sensitive and should be retuned cautiously.

## Level Editor

- **GizmoManager `attachableMeshes` semantics**: `null` = all meshes are pickable (edit mode ON); `[]` = nothing is pickable (edit mode OFF). This is the inverse of what reads naturally — assigning `[]` when enabling edit mode blocks all selection.
- **Edit mode toggle lives in Game Settings**, not inside the editor panel. It dispatches a `CustomEvent('editor-edit-mode-changed', { detail: { enabled } })` on `window`. The `EditorUI` listens for this event to show/hide itself and configure gizmos.
- **Level document trigger arrays must be initialized before `createWalls()`** in `game-level.ts` or camera triggers created during stage setup will be lost on export.
- **Level import overwrites localStorage** and reloads the page. Validation via `isLevelDocument()` runs before saving to prevent corrupt state.
