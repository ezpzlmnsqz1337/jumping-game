#!/bin/bash -i

shopt -s expand_aliases
DESTINATION="hosting@hosting"

podman build --pull --rm -f 'Dockerfile' -t 'jumping-game:latest' '.'
podman save jumping-game:latest -o jumping-game.tar

scp -r jumping-game.tar $DESTINATION:/opt/containers/jumping-game.tar

ssh $DESTINATION 'podman load -i /opt/containers/jumping-game.tar'

ssh $DESTINATION 'systemctl --user restart container-jumping-game'
