#!/bin/bash -i

set -euo pipefail
shopt -s expand_aliases

DESTINATION="hosting@hosting"
TAR_FILE="jumping-game.tar"

log_info()  { printf "\033[34m%s\033[0m %s\n"  "$1" "$2"; }
log_ok()    { printf "\033[32m%s\033[0m %s\n"  "$1" "$2"; }
log_warn()  { printf "\033[33m%s\033[0m %s\n"  "$1" "$2"; }
log_error() { printf "\033[31m%s\033[0m %s\n"  "$1" "$2"; }
log_dim()    { printf "\033[2m%s\033[0m\n" "$1"; }

now_seconds() { date +%s; }

CURRENT_STEP=""
FAILED=0

cleanup() {
  if [[ -f "$TAR_FILE" ]]; then
    log_warn "⚠️" "Removing local $TAR_FILE"
    rm -f "$TAR_FILE"
  fi
}

on_error() {
  FAILED=1
  if [[ -n "$CURRENT_STEP" ]]; then
    log_error "❌" "Deployment failed at step: $CURRENT_STEP"
  fi
}

trap on_error ERR
trap cleanup EXIT

DEPLOY_START=$(now_seconds)

CURRENT_STEP="Building container image"
START=$(now_seconds)
log_info "📦" "Building container image..."
podman build --no-cache --pull --rm -f 'Dockerfile' -t 'jumping-game:latest' '.'
log_dim "  Image built in $(( $(now_seconds) - START ))s"
log_ok "✅" "Image built"

CURRENT_STEP="Exporting image to $TAR_FILE"
START=$(now_seconds)
log_info "💾" "Exporting image to $TAR_FILE..."
podman save jumping-game:latest -o "$TAR_FILE"
TAR_SIZE=$(du -h "$TAR_FILE" | cut -f1)
log_dim "  Saved $TAR_SIZE"
log_ok "✅" "Saved ($TAR_SIZE, in $(( $(now_seconds) - START ))s)"

CURRENT_STEP="Copying image to $DESTINATION:/opt/containers/$TAR_FILE"
START=$(now_seconds)
log_info "📤" "Copying image to $DESTINATION:/opt/containers/$TAR_FILE..."
scp -r "$TAR_FILE" "$DESTINATION:/opt/containers/$TAR_FILE"
log_ok "✅" "Copied in $(( $(now_seconds) - START ))s"

CURRENT_STEP="Loading image on remote host"
START=$(now_seconds)
log_info "🔄" "Loading image on remote host..."
ssh "$DESTINATION" 'podman load -i /opt/containers/jumping-game.tar'
log_ok "✅" "Remote image loaded in $(( $(now_seconds) - START ))s"

CURRENT_STEP="Restarting container-jumping-game service"
START=$(now_seconds)
log_info "🚀" "Restarting container-jumping-game service..."
ssh "$DESTINATION" 'systemctl --user restart container-jumping-game'
log_ok "✅" "Service restarted in $(( $(now_seconds) - START ))s)"

CURRENT_STEP=""

TOTAL=$(( $(now_seconds) - DEPLOY_START ))
log_ok "✅" "Deployment complete in ${TOTAL}s"
