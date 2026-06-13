# Environment And Commands

Always run `nvm use` before Node/npm commands.

The repository includes `.nvmrc` (`20`), so `nvm use` selects the correct version.

Suggested command pattern:

```bash
nvm use
npm install
```

Client (root):

```bash
nvm use
npm run dev
```

This starts the Vite client only. Multiplayer is disabled in this mode.

Build client:

```bash
nvm use
npm run build
```

Build all (client + server):

```bash
nvm use
npm run build:all
```

Run built server from root:

```bash
nvm use
npm run start:server
```

This serves the built client and the Colyseus room from `multiplayer-server`.

Local multiplayer setup:

```bash
# terminal 1
nvm use
npm run build:watch

# terminal 2
cd multiplayer-server
nvm use
npm run start
```

Use this when you want multiplayer enabled while iterating locally.

Server dev loop:

```bash
cd multiplayer-server
nvm use
npm install
npm run start
```

Server tests:

```bash
cd multiplayer-server
nvm use
npm test
```

Client UI tests:

```bash
nvm use
npm run test:ui
```

Client UI tests with coverage:

```bash
nvm use
npm run test:ui:coverage
```
