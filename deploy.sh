#!/bin/bash -i

set -euo pipefail
shopt -s expand_aliases

DESTINATION="${DESTINATION:-hosting@hosting}"
REMOTE_DIR="${REMOTE_DIR:-work/jumping-game}"
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

# Build locally when Podman is available (workstation). Otherwise build on the
# hosting VM — that is how the OpenCode container deploys, since it has no
# local Podman and only SSH access to the host.
if command -v podman >/dev/null 2>&1 && podman ps >/dev/null 2>&1; then
  BUILT_LOCALLY=1

  CURRENT_STEP="Building container image"
  START=$(now_seconds)
  log_info "📦" "Building container image..."
  podman build --no-cache --pull --rm -f 'Dockerfile' -t 'localhost/jumping-game:latest' '.'
  log_dim "  Image built in $(( $(now_seconds) - START ))s"
  log_ok "✅" "Image built"

  CURRENT_STEP="Exporting image to $TAR_FILE"
  START=$(now_seconds)
  log_info "💾" "Exporting image to $TAR_FILE..."
  podman save localhost/jumping-game:latest -o "$TAR_FILE"
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
else
  CURRENT_STEP="Building container image on the hosting VM"
  START=$(now_seconds)
  log_warn "⚠️" "No working local Podman — building on $DESTINATION instead..."
  ssh "$DESTINATION" "set -e; cd \"\$HOME/$REMOTE_DIR\"; podman build --no-cache --pull --rm -f Dockerfile -t localhost/jumping-game:latest ."
  log_dim "  Image built in $(( $(now_seconds) - START ))s"
  log_ok "✅" "Image built on the hosting VM"
fi

CURRENT_STEP="Installing Quadlet units"
START=$(now_seconds)
log_info "📦" "Installing Quadlet units..."
DESTINATION="$DESTINATION" bash "$(dirname "$0")/deployment/install-quadlet.sh"
log_ok "✅" "Units installed in $(( $(now_seconds) - START ))s"

CURRENT_STEP="Restarting jumping-game service"
START=$(now_seconds)
log_info "🚀" "Restarting jumping-game service..."
ssh "$DESTINATION" 'systemctl --user restart jumping-game.service && systemctl --user is-active jumping-game.service'
log_ok "✅" "Service restarted in $(( $(now_seconds) - START ))s"

CURRENT_STEP=""

TOTAL=$(( $(now_seconds) - DEPLOY_START ))
log_ok "✅" "Deployment complete in ${TOTAL}s"
