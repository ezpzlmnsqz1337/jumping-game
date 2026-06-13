# Known Fragile Areas

- Multiplayer physics consistency and collision behavior are unstable.
- Camera system can clip/wall-pass and does not robustly handle obstructions.
- Player collision toggle in multiplayer is gameplay-useful but technically fragile.
- Ghost replay/demo should be protected against invalid/incomplete recording data.
- Trigger ordering (start/end/reset/teleport) can regress if event sequencing changes.

## Level Editor

- **GizmoManager `attachableMeshes` semantics**: `null` = all meshes are pickable (edit mode ON); `[]` = nothing is pickable (edit mode OFF). This is the inverse of what reads naturally — assigning `[]` when enabling edit mode blocks all selection.
- **Edit mode toggle lives in Game Settings**, not inside the editor panel. It dispatches a `CustomEvent('editor-edit-mode-changed', { detail: { enabled } })` on `window`. The `EditorUI` listens for this event to show/hide itself and configure gizmos.
- **Level document trigger arrays must be initialized before `createWalls()`** in `game-level.ts` or camera triggers created during stage setup will be lost on export.
- **Level import overwrites localStorage** and reloads the page. Validation via `isLevelDocument()` runs before saving to prevent corrupt state.
