# Physics Cadence Strategy

This document explains the physics cadence normalization strategy used in the jumping game.

## Overview

The game runs physics at ~60 Hz (16.67ms ticks) but receives network updates at 30 Hz (33ms intervals). This creates a 2:1 tick ratio — 2 physics ticks occur between every network update.

## Strategy

1. **Local player** uses standard physics (responsive to gravity/controls)
2. **Remote players** have `disablePreStep = true` during interpolation (no ghost forces)
3. **Interpolation** spans the full 33ms network interval (synchronizes with updates)
4. **Physics is re-enabled** after interpolation completes

## Why `disablePreStep` Must Stay Enabled Throughout Interpolation

Without suspension (`disablePreStep = false`):
- Frame 0: Position at A, network update to target B received
- Frame 1: Physics applies gravity to remote body at A
- Frame 1: We manually set position to lerped position (A + 0.5 × (B - A))
- Frame 2: Physics applies gravity again
- **Result**: Body bounces around during interpolation

With suspension (`disablePreStep = true`):
- Frame 0: Position at A, `disablePreStep = true`
- Frame 1-N: We lerp position, physics does NOT apply gravity
- Frame N+1: `disablePreStep = false`, physics resumes normally
- **Result**: Smooth movement, no jitter

## Cleanup Strategy for Orphaned Remote Players

Edge case: interpolation state cleared mid-update (e.g., player left the game during interpolation). Must re-enable physics to prevent frozen body:

```typescript
if (player.mesh?.physicsBody && player.interpolationActive) {
  player.mesh.physicsBody.disablePreStep = false;
  player.interpolationActive = false;
}
```
