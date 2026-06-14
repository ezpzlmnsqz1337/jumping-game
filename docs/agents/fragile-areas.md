# Known Fragile Areas

- Multiplayer physics consistency and collision behavior are improved but still sensitive under lag spikes and packet gaps.
- Camera system has better mode handoff controls, but edge-case clipping can still appear in dense geometry.
- Player collision toggle in multiplayer is gameplay-useful but technically fragile.
- Ghost replay/demo now validates payload shape/version and migrates legacy data, but metadata/source fields can still regress if future formats diverge without migration updates.
- Trigger ordering (start/end/reset/teleport) is centralized, but can regress if new trigger paths bypass GameLevel transition methods.
- Multiplayer now uses server-authoritative speed validation and bounded extrapolation. Extrapolation limits, speed reconciliation thresholds (250 u/s), and the 1000ms teleport-rate limits are heavily tuned. Modifying player speed mechanics or introducing new instant-movement capabilities must properly use the `pendingTeleportFlag` to avoid triggering anti-cheat rubber-banding.
- **gameRoot singleton pattern**: Modules import `gameRoot` directly, creating implicit coupling. Adding a new dependency on `gameRoot` in a module should be reviewed carefully — prefer constructor injection where feasible.
- **player.physics.body type safety**: `player.physics.body` is typed as `BABYLON.PhysicsBody` but many methods (like `setLinearVelocity`, `setAngularVelocity`, `disablePreStep`) are accessed with `as never` casts in tests and some source files, indicating a type misalignment.

## Level Editor

## Level Editor

- **GizmoManager `attachableMeshes` semantics**: `null` = all meshes are pickable (edit mode ON); `[]` = nothing is pickable (edit mode OFF). This is the inverse of what reads naturally — assigning `[]` when enabling edit mode blocks all selection.
- **Edit mode toggle lives in Game Settings**, not inside the editor panel. It dispatches a `CustomEvent('editor-edit-mode-changed', { detail: { enabled } })` on `window`. The `EditorUI` listens for this event to show/hide itself and configure gizmos.
- **Camera triggers visibility toggle** has moved from Game Settings to the Editor tab content. The `toggleCameraTriggers()` method lives in `EditorUI` and iterates `scene.meshes` to toggle visibility of meshes with `debugType === 'camera-trigger'`. Uses `renderingCanvas?.focus()` (null-safe) to return focus after toggle.
- **Level document trigger arrays must be initialized before `createWalls()`** in `game-level.ts` or camera triggers created during stage setup will be lost on export.
- **Level import overwrites localStorage** and reloads the page. Validation via `isLevelDocument()` runs before saving to prevent corrupt state.

## Debug HUD (Player Info)

- **PlayerInfoUI** starts hidden (`enabled = false`). Toggled via F2 (keyup on document) or backtick (keypress). The `toggle()` method syncs the game-settings `.player-info-enabled` checkbox to reflect the current state.
- **`show()` sets `this.enabled`** — calling `show(true)` or `show(false)` also updates the internal enabled flag. Always use `show()` rather than setting `enabled` and `display` separately.
- **The game-settings checkbox defaults to unchecked** (`checked = false`) to match the hidden initial state.

## Game Settings

- **Collision toggle** (`toggleCollissions`) only takes effect via `gameRoot.multiplayer.toggleCollissions()` when multiplayer is active. In single-player, it falls back to toggling `player.collisionEnabled` directly so the checkbox stays in sync.

## Lobby UI

- **Controls section** was restored from git history (`7c06a5d^`). Lives at `public/assets/ui/lobby/lobby.html:33-56`. Uses `.keyboard-controls` flex layout with keyboard image between two legend columns. The keyboard image is at `public/assets/images/keyboard-controls.png`.
- **Consolidated heading classes** in `public/assets/ui/lobby/lobby.css:143-160`: `.heading-xl` (2rem, brand-primary, centered), `.heading-md` (1.2rem, text-secondary), `.heading-sm` (1rem, text-secondary). All headings in the lobby now use these classes instead of raw element selectors.
- **Dev/prod mode toggle**: `h1.heading-xl.dev-only` shows "Singleplayer" in dev mode; `h1.heading-xl.prod-only` shows "Multiplayer" in production. The `.dev-only` / `.prod-only` classes rely on `.is-dev` / `:not(.is-dev)` on `.lobby-wrapper` and `import.meta.env.DEV` in `lobby-ui.ts:230`.
- **Two-column layout** for dev mode: `.lobby-columns` wraps "Select Level" and "Level Editor" side-by-side. `.is-dev .lobby-columns { display: flex; }` — the base rule intentionally omits `display` so `.dev-only { display: none }` takes effect in production.
- **Player setup** is now a vertical stacked layout (nickname → color → play button), full-width inputs with 40rem max. Color swatches are squares (`border-radius: 0.3rem`), not circles.
- **Nickname input** uses centered text, blue brand border, and large padding/font matching the original pre-refactor style.
