import * as BABYLON from '@babylonjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLevel } from './game-level';
import gameRoot from './game-root';
import { LevelTimer } from './level-timer';

interface MockPlayer {
  nickname?: string;
  checkpoints: unknown[];
  lastCheckpointIndex: number;
  mesh?: { position: BABYLON.Vector3 };
  physics?: {
    body: {
      disablePreStep: boolean;
      setLinearVelocity: ReturnType<typeof vi.fn>;
      setAngularVelocity: ReturnType<typeof vi.fn>;
    };
  };
  level?: {
    timer: {
      getTimeAsString: ReturnType<typeof vi.fn>;
    };
  };
}

describe('GameLevel run transitions', () => {
  const originalDemoService = gameRoot.demoService;
  const originalMultiplayer = gameRoot.multiplayer;
  const originalUiManager = gameRoot.uiManager;

  beforeEach(() => {
    gameRoot.demoService = {
      reset: vi.fn(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(() => [{ frame: 1 }]),
      createReplayPayload: vi.fn(() => ({
        version: 1,
        frames: [{ frame: 1 }],
        metadata: { timeStr: '00:30.000' },
      })),
      saveReplay: vi.fn(),
      playReplay: vi.fn(),
    } as never;
    gameRoot.multiplayer = {
      sendTimeToServer: vi.fn(),
    } as never;
    gameRoot.uiManager = {
      timerUI: {
        showRunStatus: vi.fn(),
      },
      timeTableUI: {
        updateReplayMetadata: vi.fn(),
      },
    } as never;
  });

  afterEach(() => {
    gameRoot.demoService = originalDemoService;
    gameRoot.multiplayer = originalMultiplayer;
    gameRoot.uiManager = originalUiManager;
    vi.restoreAllMocks();
  });

  it('arms and starts a run from the start trigger sequence once', () => {
    const level = new GameLevel('test');
    level.timer = new LevelTimer();
    const player = {
      checkpoints: [{}],
      lastCheckpointIndex: 4,
    } as MockPlayer;

    expect(level.armRunFromStart(player as never)).toBe(true);
    expect(level.timer.state).toBe('armed');
    expect(player.checkpoints).toEqual([]);
    expect(player.lastCheckpointIndex).toBe(0);
    expect(gameRoot.demoService.reset).toHaveBeenCalledTimes(1);
    expect(gameRoot.uiManager?.timerUI.showRunStatus).toHaveBeenCalledWith('ready');

    expect(level.startRunFromStart(player as never)).toBe(true);
    expect(level.timer.state).toBe('running');
    expect(gameRoot.demoService.startRecording).toHaveBeenCalledWith(player);
    expect(gameRoot.uiManager?.timerUI.showRunStatus).toHaveBeenCalledWith('running');

    expect(level.startRunFromStart(player as never)).toBe(false);
    expect(gameRoot.demoService.startRecording).toHaveBeenCalledTimes(1);
  });

  it('finishes a run once and forwards the result', () => {
    const level = new GameLevel('test');
    level.timer = new LevelTimer();
    level.timer.armRun();
    level.timer.startRun();

    // Simulate realistic run time: advance timer to 30 seconds later
    const mockStartTime = level.timer.startedAt;
    vi.spyOn(Date, 'now').mockReturnValue(mockStartTime + 30000); // 30 seconds

    const sound = { name: 'wicked-sick', play: vi.fn() };
    level.scene = { sounds: [sound] } as never;
    const player = {
      nickname: 'runner',
      checkpoints: [{}, {}],
    } as never;

    expect(level.finishRun(player)).toBe(true);
    expect(level.timer.state).toBe('finished');
    expect(gameRoot.multiplayer?.sendTimeToServer).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: 'runner',
        checkpoints: 2,
      })
    );
    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(gameRoot.demoService.stopRecording).toHaveBeenCalledTimes(1);
    expect(gameRoot.demoService.createReplayPayload).toHaveBeenCalledWith(
      [{ frame: 1 }],
      expect.objectContaining({
        playerName: 'runner',
        mapName: 'test',
      })
    );
    expect(gameRoot.demoService.saveReplay).toHaveBeenCalledWith(expect.anything(), 'local-best');
    expect(gameRoot.uiManager?.timeTableUI.updateReplayMetadata).toHaveBeenCalledTimes(1);
    expect(gameRoot.uiManager?.timerUI.showRunStatus).toHaveBeenCalledWith(
      'finished',
      expect.any(String)
    );
    expect(gameRoot.demoService.playReplay).toHaveBeenCalledTimes(1);

    expect(level.finishRun(player)).toBe(false);
    expect(gameRoot.multiplayer?.sendTimeToServer).toHaveBeenCalledTimes(1);
  });

  it('rejects runs that fail anti-cheat validation', () => {
    const level = new GameLevel('test');
    level.timer = new LevelTimer();
    level.timer.armRun();
    level.timer.startRun();

    const mockStartTime = level.timer.startedAt;
    // Mock Date.now to return immediately after start (triggers anti-cheat)
    vi.spyOn(Date, 'now').mockReturnValue(mockStartTime + 50);

    const sound = { name: 'wicked-sick', play: vi.fn() };
    level.scene = { sounds: [sound] } as never;
    const player = {
      nickname: 'cheater',
      checkpoints: [],
    } as never;

    expect(level.finishRun(player)).toBe(false);
    expect(level.timer.state).toBe('idle'); // Run should be reset
    expect(gameRoot.multiplayer?.sendTimeToServer).not.toHaveBeenCalled();
    expect(gameRoot.uiManager?.timerUI.showRunStatus).toHaveBeenCalledWith(
      'reset',
      'Run too short (likely invalid)'
    );
  });

  it('finishRun returns false when run was never started', () => {
    const level = new GameLevel('test');
    const player = { nickname: 'test', checkpoints: [] } as never;
    expect(level.finishRun(player)).toBe(false);
    expect(gameRoot.demoService.stopRecording).not.toHaveBeenCalled();
  });

  it('resets and teleports the player deterministically', () => {
    const level = new GameLevel('test');
    level.timer = new LevelTimer();
    level.timer.armRun();
    level.timer.startRun();
    const setLinearVelocity = vi.fn();
    const setAngularVelocity = vi.fn();
    const player = {
      checkpoints: [{}, {}],
      lastCheckpointIndex: 3,
      mesh: { position: new BABYLON.Vector3(0, 0, 0) },
      physics: {
        body: {
          disablePreStep: false,
          setLinearVelocity,
          setAngularVelocity,
        },
      },
    } as MockPlayer;
    const destination = new BABYLON.Vector3(4, 5, 6);

    expect(level.resetRunForTeleport(player as never, destination)).toBe(true);
    expect(level.timer.state).toBe('idle');
    expect(player.checkpoints).toEqual([]);
    expect(player.lastCheckpointIndex).toBe(0);
    expect(player.mesh!.position.equals(destination)).toBe(true);
    expect(setLinearVelocity).toHaveBeenCalledWith(BABYLON.Vector3.Zero());
    expect(setAngularVelocity).toHaveBeenCalledWith(BABYLON.Vector3.Zero());
    expect(gameRoot.demoService.reset).toHaveBeenCalledTimes(1);
    expect(gameRoot.uiManager?.timerUI.showRunStatus).toHaveBeenCalledWith('reset', 'teleport');
  });
});
