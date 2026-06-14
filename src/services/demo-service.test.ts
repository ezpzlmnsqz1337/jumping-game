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
    expect(fetch).toHaveBeenCalledWith('assets/demo/map-record.json');
    expect(localStorage.getItem('replay_bundled_record_level1')).toContain('"version":1');
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
});
