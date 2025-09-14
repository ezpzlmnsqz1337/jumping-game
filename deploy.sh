#!/bin/bash -i

shopt -s expand_aliases
DESTINATION="hosting@hosting"

podman build --pull --rm -f 'Dockerfile' -t 'jumping-game-ui:latest' '.'
podman save jumping-game-ui:latest -o jumping-game-ui.tar

scp -r jumping-game-ui.tar $DESTINATION:/opt/containers/jumping-game-ui.tar

ssh $DESTINATION 'podman load -i /opt/containers/jumping-game-ui.tar'

ssh $DESTINATION 'systemctl --user restart container-jumping-game-ui'
