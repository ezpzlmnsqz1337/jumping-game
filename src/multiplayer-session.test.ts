import * as BABYLON from '@babylonjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_EXTRAPOLATION_DISTANCE,
  MAX_EXTRAPOLATION_MS,
  MultiplayerSession,
} from './multiplayer-session';
import type { PlayerInfo } from './multiplayer-session';

describe('MultiplayerSession interpolation', () => {
  let session: MultiplayerSession;
  let mockScene: BABYLON.Scene;
  let mockPlayer: { mesh: null; collisionEnabled: boolean };

  beforeEach(() => {
    mockScene = {
      onBeforeRenderObservable: {
        add: vi.fn(),
      },
    } as never;

    mockPlayer = {
      mesh: null,
      collisionEnabled: true,
    };

    // Disable actual network connection
    session = new MultiplayerSession(mockScene, mockPlayer as never, []);
    session.localPlayerId = 'local-id';
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes player with interpolation duration', () => {
    expect(session.players.size).toBe(0);
  });

  it('lerps position over interpolation duration', () => {
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(0, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: {
          disablePreStep: false,
        },
      } as never,
    };

    session.players.set('remote-1', player);

    const startTime = 1000;
    // Simulate receiving an update at position (10, 0, 0)
    player.targetPosition = new BABYLON.Vector3(10, 0, 0);
    player.targetRotation = BABYLON.Quaternion.Identity();
    player.interpolationStartTime = startTime;

    // Mock performance.now() to return halfway through interpolation
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 50);

    session.applyInterpolation();

    // Should be at approximately (5, 0, 0) - halfway
    expect(player.mesh!.position.x).toBeCloseTo(5, 0.1);
    expect(player.mesh!.position.y).toBe(0);
    expect(player.mesh!.position.z).toBe(0);
  });

  it('clamps interpolation at duration end', () => {
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(0, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: {
          disablePreStep: false,
        },
      } as never,
    };

    session.players.set('remote-1', player);

    const startTime = 2000;
    player.targetPosition = new BABYLON.Vector3(10, 0, 0);
    player.targetRotation = BABYLON.Quaternion.Identity();
    player.interpolationStartTime = startTime;

    // Mock performance.now() to return past interpolation duration
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 150);

    session.applyInterpolation();

    // Should be exactly at target
    expect(player.mesh!.position.x).toBeCloseTo(10, 0.01);
    // Interpolation should be cleared
    expect(player.interpolationStartTime).toBeUndefined();
    expect(player.targetPosition).toBeUndefined();
  });

  it('disables physics pre-step during interpolation and re-enables on completion', () => {
    const physicsBody = {
      disablePreStep: false,
    };
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(0, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: physicsBody as never,
      } as never,
    };

    session.players.set('remote-1', player);

    const startTime = 5000;
    player.targetPosition = new BABYLON.Vector3(10, 0, 0);
    player.targetRotation = BABYLON.Quaternion.Identity();
    player.interpolationStartTime = startTime;

    // Mock performance.now() to return during interpolation
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 50);

    session.applyInterpolation();

    // Should have disablePreStep = true during interpolation
    expect(physicsBody.disablePreStep).toBe(true);
    expect(player.interpolationActive).toBe(true);

    // Now simulate interpolation completing
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 150);
    session.applyInterpolation();

    // Should re-enable physics after interpolation completes
    expect(physicsBody.disablePreStep).toBe(false);
    expect(player.interpolationActive).toBe(false);
  });

  it('skips players without interpolation targets', () => {
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(0, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: { disablePreStep: false } as never,
      } as never,
      // No targetPosition or interpolationStartTime
    };

    session.players.set('remote-1', player);

    const originalPos = player.mesh!.position.clone();
    session.applyInterpolation();

    // Position should not change
    expect(player.mesh!.position.equals(originalPos)).toBe(true);
  });

  it('applies bounded extrapolation when packets are briefly missing', () => {
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(0, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: { disablePreStep: false } as never,
      } as never,
      lastServerPosition: new BABYLON.Vector3(0, 0, 0),
      lastServerRotation: BABYLON.Quaternion.Identity(),
      extrapolationStartAt: 1000,
      lastExtrapolationAt: 1000,
      predictedVelocity: new BABYLON.Vector3(30, 0, 0),
    };

    session.players.set('remote-1', player);
    vi.spyOn(performance, 'now').mockReturnValue(1010);

    session.applyInterpolation();

    expect(player.mesh!.position.x).toBeGreaterThan(0);
    expect(player.mesh!.position.x).toBeLessThanOrEqual(MAX_EXTRAPOLATION_DISTANCE);
  });

  it('stops extrapolation beyond max time window', () => {
    const player: PlayerInfo = {
      status: 'playing',
      interpolationDuration: 100,
      mesh: {
        position: new BABYLON.Vector3(1, 0, 0),
        rotationQuaternion: BABYLON.Quaternion.Identity(),
        physicsBody: { disablePreStep: false } as never,
      } as never,
      lastServerPosition: new BABYLON.Vector3(0, 0, 0),
      lastServerRotation: BABYLON.Quaternion.Identity(),
      extrapolationStartAt: 1000,
      lastExtrapolationAt: 1000,
      predictedVelocity: new BABYLON.Vector3(10, 0, 0),
    };

    session.players.set('remote-1', player);
    vi.spyOn(performance, 'now').mockReturnValue(1000 + MAX_EXTRAPOLATION_MS + 1);

    session.applyInterpolation();

    expect(player.mesh!.position.x).toBe(1);
  });
});
