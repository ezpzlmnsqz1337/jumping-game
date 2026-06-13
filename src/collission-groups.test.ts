import { describe, expect, it } from 'vitest';
import {
  auditCollisionLayers,
  FILTER_GROUP_PLAYER,
  FILTER_GROUP_GROUND,
  FILTER_GROUP_WALL,
  FILTER_GROUP_PLAYER_MP,
  FILTER_MASK_PLAYER_WITH_COLLISSIONS,
  FILTER_MASK_PLAYER_NO_COLLISSIONS,
  FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS,
  FILTER_MASK_PLAYER_MP_NO_COLLISSIONS,
} from './collission-groups';

describe('Collision layer configuration', () => {
  it('has unique, non-overlapping collision groups', () => {
    const groups = [
      FILTER_GROUP_PLAYER,
      FILTER_GROUP_GROUND,
      FILTER_GROUP_WALL,
      FILTER_GROUP_PLAYER_MP,
    ];

    // All groups should be powers of 2 (single bit set)
    for (const group of groups) {
      const bitCount = (group & (group - 1)) === 0 ? 1 : 0;
      expect(bitCount).toBe(1);
    }

    // No overlap between any two groups
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        expect(groups[i] & groups[j]).toBe(0);
      }
    }
  });

  it('prevents local player from self-colliding', () => {
    // FILTER_MASK_PLAYER_WITH_COLLISSIONS should NOT include FILTER_GROUP_PLAYER
    expect(FILTER_MASK_PLAYER_WITH_COLLISSIONS & FILTER_GROUP_PLAYER).toBe(0);
    expect(FILTER_MASK_PLAYER_NO_COLLISSIONS & FILTER_GROUP_PLAYER).toBe(0);
  });

  it('prevents remote players from self-colliding', () => {
    // FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS should NOT include FILTER_GROUP_PLAYER_MP
    expect(FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS & FILTER_GROUP_PLAYER_MP).toBe(0);
    expect(FILTER_MASK_PLAYER_MP_NO_COLLISSIONS & FILTER_GROUP_PLAYER_MP).toBe(0);
  });

  it('allows local player to collide with ground and walls', () => {
    expect(FILTER_MASK_PLAYER_WITH_COLLISSIONS & FILTER_GROUP_GROUND).toBe(FILTER_GROUP_GROUND);
    expect(FILTER_MASK_PLAYER_WITH_COLLISSIONS & FILTER_GROUP_WALL).toBe(FILTER_GROUP_WALL);
  });

  it('allows local player to collide with remote players', () => {
    expect(FILTER_MASK_PLAYER_WITH_COLLISSIONS & FILTER_GROUP_PLAYER_MP).toBe(FILTER_GROUP_PLAYER_MP);
  });

  it('allows remote players to collide with ground and walls', () => {
    expect(FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS & FILTER_GROUP_GROUND).toBe(FILTER_GROUP_GROUND);
    expect(FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS & FILTER_GROUP_WALL).toBe(FILTER_GROUP_WALL);
  });

  it('allows remote players to collide with local player', () => {
    expect(FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS & FILTER_GROUP_PLAYER).toBe(FILTER_GROUP_PLAYER);
  });

  it('audit reports valid configuration', () => {
    const audit = auditCollisionLayers();
    expect(audit.valid).toBe(true);
    expect(audit.issues).toHaveLength(0);
    expect(audit.report).toContain('✓ VALID');
  });
});
