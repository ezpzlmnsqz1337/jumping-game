import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoService, REPLAY_FORMAT_VERSION } from './demo-service';

describe('DemoService replay format', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates replay payload with versioned metadata', () => {
    const service = new DemoService();
    const replay = service.createReplayPayload(
      [
        {
          position: { x: 1, y: 2, z: 3 } as never,
          rotation: { x: 0, y: 0, z: 0, w: 1 } as never,
        },
      ],
      {
        playerName: 'alice',
        timeMs: 1234,
        timeStr: '00:01.234',
        completedAt: '2026-01-01T00:00:00.000Z',
        mapName: 'level1',
        source: 'local',
      }
    );

    expect(replay).toBeTruthy();
    expect(replay?.version).toBe(REPLAY_FORMAT_VERSION);
    expect(replay?.metadata.playerName).toBe('alice');
    expect(replay?.metadata.replayVersion).toBe(REPLAY_FORMAT_VERSION);
    expect(replay?.metadata.source).toBe('local');
    expect(replay?.frames).toHaveLength(1);
  });

  it('loads and normalizes legacy frame-array replay', () => {
    const service = new DemoService();
    localStorage.setItem(
      'demo',
      JSON.stringify([
        {
          position: { _x: 10, _y: 11, _z: 12 },
          rotation: { _x: 0, _y: 0.1, _z: 0, _w: 1 },
        },
      ])
    );

    const { replay, type } = service.loadStoredReplay('level1');

    expect(replay).toBeTruthy();
    expect(replay?.version).toBe(REPLAY_FORMAT_VERSION);
    expect(replay?.frames[0].position).toEqual({ x: 10, y: 11, z: 12 });
    expect(replay?.metadata.mapName).toBe('level1');
    expect(replay?.metadata.source).toBe('migrated-legacy');
    expect(replay?.metadata.timeMs).toBeGreaterThan(0);
    expect(replay?.metadata.timeStr).not.toBe('00:00.000');
    expect(type).toBe('local-best');
  });

  it('rejects corrupted replay payload and clears storage', () => {
    const service = new DemoService();
    localStorage.setItem(
      'replay_local_best_level1',
      JSON.stringify({ version: REPLAY_FORMAT_VERSION, frames: 'bad' })
    );

    const { replay, type } = service.loadStoredReplay('level1');

    expect(replay).toBeNull();
    expect(type).toBeNull();
    expect(localStorage.getItem('replay_local_best_level1')).toBeNull();
  });

  it('rejects unsupported replay versions and clears storage', () => {
    const service = new DemoService();
    localStorage.setItem('replay_local_best_level1', JSON.stringify({ version: 999, frames: [] }));

    const { replay, type } = service.loadStoredReplay('level1');

    expect(replay).toBeNull();
    expect(type).toBeNull();
    expect(localStorage.getItem('replay_local_best_level1')).toBeNull();
  });

  it('loads fallback replay when storage is missing', async () => {
    const service = new DemoService();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            position: { _x: 1, _y: 2, _z: 3 },
            rotation: { _x: 0, _y: 0, _z: 0, _w: 1 },
          },
        ],
      })
    );

    const replay = await service.loadOrCreateStoredReplay('assets/demo/map-record.json', 'level1');

    expect(replay).toBeTruthy();
    expect(replay?.version).toBe(REPLAY_FORMAT_VERSION);
    expect(replay?.metadata.source).toBe('bundled');
    expect(replay?.metadata.timeMs).toBeGreaterThan(0);
    expect(replay?.metadata.timeStr).not.toBe('00:00.000');
    expect(fetch).toHaveBeenCalledWith('assets/demo/map-record.json');
    expect(localStorage.getItem('replay_bundled_record_level1')).toContain('"version":1');
  });

  it('estimates time from frame count for legacy replay', () => {
    const service = new DemoService();
    const frameCount = 600; // 10 seconds at 60fps
    const frames = Array.from({ length: frameCount }, (_, i) => ({
      position: { _x: i, _y: 0, _z: 0 },
      rotation: { _x: 0, _y: 0, _z: 0, _w: 1 },
    }));
    localStorage.setItem('demo', JSON.stringify(frames));

    const { replay } = service.loadStoredReplay('level1');

    expect(replay).toBeTruthy();
    // 600 frames * (1000/60) ms per frame = 10000ms = 10 seconds
    expect(replay?.metadata.timeMs).toBe(10000);
    expect(replay?.metadata.timeStr).toBe('00:10.000');
  });

  it('warns when migrating legacy stored replay', () => {
    const service = new DemoService();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(
      'demo',
      JSON.stringify([
        {
          position: { _x: 1, _y: 2, _z: 3 },
          rotation: { _x: 0, _y: 0, _z: 0, _w: 1 },
        },
      ])
    );

    const { replay } = service.loadStoredReplay('level1');

    expect(replay).toBeTruthy();
    expect(warnSpy).toHaveBeenCalledWith(
      '[Replay] Migrated legacy generic replay data to local-best v1 format.'
    );
  });

  it('re-estimates time for v1 replay with timeMs=0 (stale localStorage)', () => {
    const service = new DemoService();
    // Simulate a v1 replay stored with timeMs: 0 (as produced by the old defaultMetadata)
    const frames = Array.from({ length: 120 }, (_, i) => ({
      position: { x: i, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
    }));
    const staleReplay = {
      version: REPLAY_FORMAT_VERSION,
      frames,
      metadata: {
        playerName: 'Map record',
        timeMs: 0,
        timeStr: '00:00.000',
        completedAt: '2026-01-01T00:00:00.000Z',
        mapName: 'level1',
        replayVersion: 1,
        source: 'bundled',
      },
    };
    localStorage.setItem('replay_bundled_record_level1', JSON.stringify(staleReplay));

    const { replay, type } = service.loadStoredReplay('level1');

    expect(replay).toBeTruthy();
    expect(replay?.metadata.timeMs).toBeGreaterThan(0);
    expect(replay?.metadata.timeStr).not.toBe('00:00.000');
    expect(replay?.metadata.source).toBe('bundled');
    expect(type).toBe('bundled-record');

    // The stale data should have been migrated (saved back with corrected time)
    const stored = JSON.parse(localStorage.getItem('replay_bundled_record_level1')!);
    expect(stored.metadata.timeMs).toBeGreaterThan(0);
    expect(stored.metadata.timeStr).not.toBe('00:00.000');
  });

  it('preserves valid timeMs from existing v1 replay', () => {
    const service = new DemoService();
    const frames = Array.from({ length: 10 }, (_, i) => ({
      position: { x: i, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
    }));
    const goodReplay = {
      version: REPLAY_FORMAT_VERSION,
      frames,
      metadata: {
        playerName: 'Player1',
        timeMs: 5000,
        timeStr: '00:05.000',
        completedAt: '2026-01-01T00:00:00.000Z',
        mapName: 'level1',
        replayVersion: 1,
        source: 'local',
      },
    };
    localStorage.setItem('replay_local_best_level1', JSON.stringify(goodReplay));

    const { replay, type } = service.loadStoredReplay('level1');

    expect(replay).toBeTruthy();
    expect(replay?.metadata.timeMs).toBe(5000);
    expect(replay?.metadata.timeStr).toBe('00:05.000');
    expect(type).toBe('local-best');
  });
});
