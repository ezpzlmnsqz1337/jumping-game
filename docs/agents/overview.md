# Overview

## Project Snapshot

- Project: Babylon.js 3D jumping game (time-attack).
- Core loop: move, rotate, jump as a cube character and reach finish as fast as possible.
- Timing logic: start trigger resets/starts run, end trigger stops run.
- Extra systems: replay ghost (best run), multiplayer, chat, UI overlays, teleports, camera switching, sounds.
- Status: playable, but several systems are intentionally experimental and partially broken (especially multiplayer physics and camera collision behavior).

## Tech Stack

- Frontend: TypeScript + Vite + Babylon.js.
- Physics: Babylon physics + Havok package.
- Networking:
  - Client-side Colyseus client usage in main app.
  - Server-side Colyseus room in `multiplayer-server`.
  - Some legacy/simple socket-oriented code exists in dependencies and history.
- Runtime: Node.js (use nvm in this environment).
- Host environment: WSL2.

## Repository Map

- Root client app:
  - `src/main.ts` bootstraps engine/scene.
  - `src/scenes/` scene composition.
  - `src/entities/` gameplay entities (player, walls, spawn).
  - `src/triggers/` start/end/teleport trigger logic.
  - `src/ui/` all in-game UI modules.
  - `src/multiplayer-session.ts` client-side multiplayer state sync.
  - `src/services/demo-service.ts` ghost/demo behavior.
  - `public/` assets, UI html/css fragments, textures, models, sounds.
- Multiplayer server:
  - `multiplayer-server/src/index.ts` server bootstrap.
  - `multiplayer-server/src/rooms/MyRoom.ts` room logic.
  - `multiplayer-server/src/rooms/schema/MyRoomState.ts` replicated state schema.
