# Environment And Commands

Always use nvm with an explicit version before Node/npm commands.

Suggested command pattern:

```bash
nvm use 20 || nvm install 20
npm install
```

Client (root):

```bash
nvm use 20 || nvm install 20
npm run dev
```

This starts the Vite client only. Multiplayer is disabled in this mode.

Build client:

```bash
nvm use 20 || nvm install 20
npm run build
```

Build all (client + server):

```bash
nvm use 20 || nvm install 20
npm run build:all
```

Run built server from root:

```bash
nvm use 20 || nvm install 20
npm run start:server
```

This serves the built client and the Colyseus room from `multiplayer-server`.

Local multiplayer setup:

```bash
# terminal 1
nvm use 20 || nvm install 20
npm run build:watch

# terminal 2
cd multiplayer-server
nvm use 20 || nvm install 20
npm run start
```

Use this when you want multiplayer enabled while iterating locally.

Server dev loop:

```bash
cd multiplayer-server
nvm use 20 || nvm install 20
npm install
npm run start
```

Server tests:

```bash
cd multiplayer-server
nvm use 20 || nvm install 20
npm test
```
