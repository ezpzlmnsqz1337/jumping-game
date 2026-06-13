# Linting And Formatting

All code is linted with ESLint 9 and formatted with Prettier 3.

# Testing And Coverage

Client/UI tests use Vitest with jsdom.
Server tests use Mocha in `multiplayer-server`.

## Commands

Lint client:
```bash
npm run lint
npm run lint:fix
```

Lint server:
```bash
cd multiplayer-server
npm run lint
npm run lint:fix
```

Format client:
```bash
npm run format
npm run format:check
```

Format server:
```bash
cd multiplayer-server
npm run format
npm run format:check
```

Run UI tests (client):
```bash
npm run test:ui
```

Run UI tests with coverage:
```bash
npm run test:ui:coverage
```

Run server tests:
```bash
cd multiplayer-server
npm test
```

## ESLint Config

- Root: `eslint.config.js`
- Server: `multiplayer-server/eslint.config.js`

## Prettier Config

- Root: `.prettierrc.json`
- Server: `multiplayer-server/.prettierrc.json`

## Vitest Config

- Root: `vitest.config.ts`
- Test setup hook: `src/test/vitest.setup.ts`
- Coverage output: `coverage/ui` (ignored by git)

## CI/CD

GitHub Actions workflow automatically lints, checks formatting, builds, and tests on every push and PR.

Workflow jobs are separated for clarity and faster feedback:

- `lint` (root + server)
- `format` (root + server)
- `build` (depends on `lint` and `format`)
- `test` (depends on `lint` and `format`)

Current CI test coverage includes:

- Root UI tests: `npm run test:ui`
- Server tests: `cd multiplayer-server && npm test`

Server tests are enforced (not `continue-on-error`).

See `.github/workflows/ci.yml`.
