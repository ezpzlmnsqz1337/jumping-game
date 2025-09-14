FROM node:22 AS build

WORKDIR /app

COPY . /app

RUN npm ci && npm run build

FROM nginx
COPY --from=build /app/multiplayer-server/dist /usr/share/nginx/html
