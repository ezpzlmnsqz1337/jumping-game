/**
 * COLLISION LAYER CONFIGURATION
 * =============================
 * Groups: Define which layer a body belongs to
 * Masks:  Define which layers a body can collide with
 *
 * Layer Breakdown:
 * - PLAYER (1):     Local player body. High responsiveness needed for controls.
 *                   Can collide: GROUND, WALL, other PLAYER_MP
 * - GROUND (2):     Static ground collision. Never moves.
 *                   Collides with: PLAYER and PLAYER_MP
 * - WALL (4):       Static obstacles. Never moves.
 *                   Collides with: PLAYER and PLAYER_MP
 * - PLAYER_MP (8):  Remote multiplayer player bodies. Updated via network.
 *                   Disabled during interpolation to prevent physics drift.
 *                   Can collide: GROUND, WALL, local PLAYER
 *
 * Validation Rules (verified at setup):
 * ✓ No body is in two groups (each filterMembershipMask is a single group)
 * ✓ Remote PLAYER_MP can't collide with itself (would cause infinite loops)
 * ✓ Remote PLAYER_MP only collides with GROUND, WALL, and local PLAYER
 * ✓ Local PLAYER collides with GROUND, WALL, and remote PLAYER_MP
 * ✓ Static layers (GROUND, WALL) have no physics bodies (no self-collision risk)
 */
export const FILTER_GROUP_PLAYER = 1;
export const FILTER_GROUP_GROUND = 2;
export const FILTER_GROUP_WALL = 4;
export const FILTER_GROUP_PLAYER_MP = 8;

export const FILTER_MASK_PLAYER_NO_COLLISSIONS = FILTER_GROUP_GROUND | FILTER_GROUP_WALL;
export const FILTER_MASK_PLAYER_WITH_COLLISSIONS =
  FILTER_GROUP_GROUND | FILTER_GROUP_WALL | FILTER_GROUP_PLAYER_MP;

export const FILTER_MASK_PLAYER_MP_NO_COLLISSIONS = FILTER_GROUP_GROUND | FILTER_GROUP_WALL;
export const FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS =
  FILTER_GROUP_GROUND | FILTER_GROUP_WALL | FILTER_GROUP_PLAYER;

/**
 * Audit collision configuration to detect contradictions
 * @returns Report of collision setup validity
 */
export function auditCollisionLayers(): {
  valid: boolean;
  issues: string[];
  report: string;
} {
  const issues: string[] = [];

  // Check for self-collision risks
  if ((FILTER_MASK_PLAYER_WITH_COLLISSIONS & FILTER_GROUP_PLAYER) !== 0) {
    issues.push('Local PLAYER mask includes PLAYER group (risk of self-collision)');
  }
  if ((FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS & FILTER_GROUP_PLAYER_MP) !== 0) {
    issues.push('Remote PLAYER_MP mask includes PLAYER_MP group (risk of self-collision)');
  }

  // Verify group uniqueness (no overlap)
  const groups = [
    FILTER_GROUP_PLAYER,
    FILTER_GROUP_GROUND,
    FILTER_GROUP_WALL,
    FILTER_GROUP_PLAYER_MP,
  ];
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if ((groups[i] & groups[j]) !== 0) {
        issues.push(`Groups ${groups[i]} and ${groups[j]} have overlapping bits`);
      }
    }
  }

  // Verify masks are non-empty (except for no-collision masks)
  if (FILTER_MASK_PLAYER_WITH_COLLISSIONS === 0) {
    issues.push('PLAYER with-collision mask is empty (player cannot collide)');
  }
  if (FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS === 0) {
    issues.push('PLAYER_MP with-collision mask is empty (remote players cannot collide)');
  }

  const valid = issues.length === 0;
  const report = `
Collision Audit Report
${valid ? '✓ VALID' : '✗ INVALID'}

Groups:
  PLAYER (local):   ${FILTER_GROUP_PLAYER}
  GROUND (static):  ${FILTER_GROUP_GROUND}
  WALL (static):    ${FILTER_GROUP_WALL}
  PLAYER_MP (remote): ${FILTER_GROUP_PLAYER_MP}

Masks:
  PLAYER with collision:   ${FILTER_MASK_PLAYER_WITH_COLLISSIONS.toString(2)} (can collide with GROUND, WALL, PLAYER_MP)
  PLAYER no collision:     ${FILTER_MASK_PLAYER_NO_COLLISSIONS.toString(2)} (can collide with GROUND, WALL only)
  PLAYER_MP with collision: ${FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS.toString(2)} (can collide with GROUND, WALL, PLAYER)
  PLAYER_MP no collision:  ${FILTER_MASK_PLAYER_MP_NO_COLLISSIONS.toString(2)} (can collide with GROUND, WALL only)

${issues.length === 0 ? 'No issues detected.' : 'Issues:\n  ' + issues.join('\n  ')}
  `;

  return { valid, issues, report };
}
