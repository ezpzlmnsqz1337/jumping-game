# Jumping Game

A multiplayer 3D jumping/parkour game built with [Babylon.js](https://www.babylonjs.com/) and [Colyseus](https://colyseus.io/). 

## Features

- **3D Gameplay:** Fully realized 3D environments, physics (using Havok), and movement powered by Babylon.js.
- **Real-time Multiplayer:** Fast, authoritative multiplayer synchronization handled by a Colyseus backend.
- **Custom Levels & Stages:** Multiple stages for players to explore, jump, and race through.
- **Modern Tech Stack:** Written entirely in TypeScript, using Vite for ultra-fast frontend tooling.

## Project Structure

This repository is organized as a monorepo containing both the client frontend and the multiplayer backend:

- `/src/` - Client-side game logic, UI components, entity management, and rendering.
- `/public/` - Game assets (3D models, textures, sounds, UI layouts).
- `/multiplayer-server/` - Colyseus Node.js server handling game state and client synchronization.
- `/docs/` - Project documentation and architecture details.

## Getting Started

### Prerequisites

- Node.js (Check `.nvmrc` for the recommended version)
- npm

### Installation

1. Install dependencies for the main project:
   ```bash
   npm install
   ```

2. Install dependencies for the multiplayer server:
   ```bash
   cd multiplayer-server
   npm install
   cd ..
   ```

### Running Locally

To run the game locally, you need to start both the multiplayer server and the frontend client.

**1. Start the Multiplayer Server:**

In a new terminal window, navigate to the server directory and start the dev server:

```bash
cd multiplayer-server
npm run start
```
*(This uses `tsx` to run and watch the server for changes).*

**2. Start the Frontend Client:**

In the root directory, start the Vite development server:

```bash
npm run dev
```

Open your browser to the local Vite URL (typically `http://localhost:5173`) to play!

## Scripts (Root)

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the client for production.
- `npm run build:all` - Builds both the client and the server.
- `npm run test:ui` - Runs unit tests using Vitest.
- `npm run lint` / `npm run format` - Runs ESLint and Prettier.

## Contributing

Please adhere to the styling and linting configurations. We use Prettier for formatting and ESLint for code quality checks.
