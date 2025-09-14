FROM node:22-slim AS build

WORKDIR /app

COPY . /app

RUN npm ci && npm run build
RUN cd multiplayer-server && npm ci && npm run build

FROM node:22-slim

WORKDIR /app

COPY --from=build /app/multiplayer-server /app
ENTRYPOINT [ "node", "/app/build/index.js" ]
