#!/bin/bash -i

shopt -s expand_aliases
DESTINATION="hosting@hosting"

podman build --pull --rm -f 'Dockerfile' -t 'jumping-game-server:latest' '.'
podman save jumping-game-server:latest -o jumping-game-server.tar

scp -r jumping-game-server.tar $DESTINATION:/opt/containers/jumping-game-server.tar

ssh $DESTINATION 'podman load -i /opt/containers/jumping-game-server.tar'

ssh $DESTINATION 'systemctl --user restart container-jumping-game-server'
