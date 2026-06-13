# Linting And Formatting

All code is linted with ESLint 9 and formatted with Prettier 3.

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

## ESLint Config

- Root: `eslint.config.js`
- Server: `multiplayer-server/eslint.config.js`

## Prettier Config

- Root: `.prettierrc.json`
- Server: `multiplayer-server/.prettierrc.json`

## CI/CD

GitHub Actions workflow automatically lints, formats, and builds on every push and PR.
See `.github/workflows/ci.yml`.
