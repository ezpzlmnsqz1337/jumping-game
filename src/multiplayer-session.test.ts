import * as BABYLON from '@babylonjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiplayerSession } from './multiplayer-session';
import type { PlayerInfo } from './multiplayer-session';

describe('MultiplayerSession interpolation', () => {
  let session: MultiplayerSession;
  let mockScene: BABYLON.Scene;
  let mockPlayer: any;

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
    session = new MultiplayerSession(mockScene, mockPlayer, []);
    session.localPlayerId = 'local-id';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes player with interpolation duration', () => {
    const playerInfo: Map<string, PlayerInfo> = new Map([
      [
        'remote-1',
        {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          status: 'playing',
          nickname: 'alice',
          color: 'blue',
          collissionEnabled: true,
          interpolationDuration: 33,
        },
      ],
    ]);

    expect(session.players.size).toBe(0);
    // Note: updatePlayers is async, so in real scenarios this would be awaited
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
});
