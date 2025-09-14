FROM node:22 AS build

WORKDIR /app

COPY . /app

RUN npm ci && npm run build:server

FROM node:22

WORKDIR /app

COPY --from=build /app/multiplayer-server/build /app
ENTRYPOINT [ "node /app/index.js" ]
