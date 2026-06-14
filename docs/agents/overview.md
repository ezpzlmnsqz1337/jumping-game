# Overview

## Project Snapshot

- Project: Babylon.js 3D jumping game (time-attack).
- Core loop: move, rotate, jump as a cube character and reach finish as fast as possible.
- Timing logic: start trigger resets/starts run, end trigger stops run.
- Extra systems: replay ghost (best run), multiplayer, chat, UI overlays, teleports, camera switching, sounds.
- Status: playable, with recent stabilization work completed for trigger/timer orchestration, remote-player interpolation + bounded extrapolation, anti-cheat validation, replay validation/metadata, and first-pass physics/camera robustness.

## Tech Stack

- Frontend: TypeScript + Vite + Babylon.js.
- Physics: Babylon physics + Havok package.
- Networking:
  - Client-side Colyseus client usage in main app.
  - Server-side Colyseus room in `multiplayer-server`.
  - Some legacy/simple socket-oriented code exists in dependencies and history.
- Runtime: Node.js (use nvm in this environment).
- Host environment: WSL2.

## Testing Snapshot

- Client/UI tests: Vitest + jsdom in root `src/ui/**/*.test.ts`.
- Server tests: Mocha in `multiplayer-server/test`.
- Key commands:
  - `npm run test:ui`
  - `npm run test:ui:coverage`
  - `cd multiplayer-server && npm test`
- Coverage output: `coverage/ui` (gitignored).
- CI runs UI tests and server tests as enforced checks in `.github/workflows/ci.yml`.

## Repository Map

- Root client app:
  - `src/main.ts` bootstraps engine/scene.
  - `src/scenes/` scene composition.
  - `src/entities/` gameplay entities (player, walls, spawn).
  - `src/triggers/` start/end/teleport trigger logic.
  - `src/ui/` all in-game UI modules.
  - `src/multiplayer-session.ts` client-side multiplayer state sync.
  - `src/services/demo-service.ts` ghost/demo behavior.
  - `src/level-document.ts` serialization schema for level JSON (walls, triggers, texts, environment).
  - `src/game-storage.ts` localStorage persistence for imported level documents.
  - `src/game-level.ts` base level class; `serialize()` exports a `LevelDocument`.
- `public/assets/ui/editor/` in-game level editor UI (tabbed: Editor / Mesh Info / Camera). Editor tab includes camera-triggers visibility toggle and level info rows (name, walls, triggers).
- `public/assets/ui/player-info/` debug HUD panel. Toggled via F2 or backtick. Shows FPS, vertical/horizontal speed, and MOVING/JUMPING status badges. Starts hidden; state syncs with the game-settings checkbox.
- `public/` assets, UI html/css fragments, textures, models, sounds.
- CSS design tokens (defined once in `src/style.css` on `body`):
  - `--color-*` semantic color variables.
  - `--font-size-ui-*` scale from `xs` (0.8rem) to `6xl` (3rem).
  - `--space-*` spacing scale from `none` to `5xl` plus `--space-button-y`.
- Multiplayer server:
  - `multiplayer-server/src/index.ts` server bootstrap.
  - `multiplayer-server/src/rooms/MyRoom.ts` room logic.
  - `multiplayer-server/src/rooms/schema/MyRoomState.ts` replicated state schema.
