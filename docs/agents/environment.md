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
