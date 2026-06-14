import * as BABYLON from '@babylonjs/core';
import { getModel } from '../assets/models';
import { GameEntity } from '../entities/game-entity';
import { PlayerEntity } from '../entities/player-entity';

interface DemoEntry {
  position: BABYLON.Vector3;
  rotation: BABYLON.Quaternion;
}

interface ReplayFrameData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
}

export interface ReplayMetadata {
  playerName: string;
  timeMs: number;
  timeStr: string;
  completedAt: string;
  mapName: string;
  replayVersion: number;
  source: 'local' | 'bundled' | 'migrated-legacy';
}

interface ReplayPayloadV1 {
  version: 1;
  frames: ReplayFrameData[];
  metadata: ReplayMetadata;
}

interface ReplayMetadataInput {
  playerName: string;
  timeMs: number;
  timeStr: string;
  completedAt: string;
  mapName: string;
  source: 'local' | 'bundled';
}

export type ReplayPayload = ReplayPayloadV1;

const SAMPLE_RATE_MS = 1000 / 60;
export const REPLAY_FORMAT_VERSION = 1;
const LOCAL_BEST_STORAGE_KEY_PREFIX = 'replay_local_best_';
const BUNDLED_RECORD_STORAGE_KEY_PREFIX = 'replay_bundled_record_';
const LEGACY_STORAGE_KEY = 'demo'; // Maintained for migration

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readNumber = (value: unknown, ...keys: string[]): number | null => {
  if (!isRecord(value)) return null;
  for (const key of keys) {
    const maybeNumber = value[key];
    if (typeof maybeNumber === 'number' && Number.isFinite(maybeNumber)) {
      return maybeNumber;
    }
  }
  return null;
};

const readString = (value: unknown, key: string): string | null => {
  if (!isRecord(value)) return null;
  const maybeString = value[key];
  if (typeof maybeString === 'string' && maybeString.trim().length > 0) {
    return maybeString;
  }
  return null;
};

export class DemoService {
  recording: DemoEntry[] = [];
  recordingInterval: ReturnType<typeof setTimeout> | null = null;

  playing: DemoEntry[] = [];
  playingFrameIndex = 0;
  playingInterval: ReturnType<typeof setTimeout> | null = null;
  playingEntity: BABYLON.Mesh | null = null;
  scene: BABYLON.Scene | null = null;

  private defaultMetadata(mapName: string, source: ReplayMetadata['source']): ReplayMetadata {
    return {
      playerName: 'Map record',
      timeMs: 0,
      timeStr: '00:00.000',
      completedAt: new Date().toISOString(),
      mapName,
      replayVersion: REPLAY_FORMAT_VERSION,
      source,
    };
  }

  private toFrameData(entry: DemoEntry): ReplayFrameData {
    return {
      position: {
        x: entry.position.x,
        y: entry.position.y,
        z: entry.position.z,
      },
      rotation: {
        x: entry.rotation.x,
        y: entry.rotation.y,
        z: entry.rotation.z,
        w: entry.rotation.w,
      },
    };
  }

  private fromFrameData(frame: ReplayFrameData): DemoEntry {
    return {
      position: new BABYLON.Vector3(frame.position.x, frame.position.y, frame.position.z),
      rotation: new BABYLON.Quaternion(
        frame.rotation.x,
        frame.rotation.y,
        frame.rotation.z,
        frame.rotation.w
      ),
    };
  }

  private parseFrameData(frame: unknown): ReplayFrameData | null {
    if (!isRecord(frame)) return null;

    const position = frame.position;
    const rotation = frame.rotation;
    const x = readNumber(position, 'x', '_x');
    const y = readNumber(position, 'y', '_y');
    const z = readNumber(position, 'z', '_z');
    const rx = readNumber(rotation, 'x', '_x');
    const ry = readNumber(rotation, 'y', '_y');
    const rz = readNumber(rotation, 'z', '_z');
    const rw = readNumber(rotation, 'w', '_w');

    if (
      x === null ||
      y === null ||
      z === null ||
      rx === null ||
      ry === null ||
      rz === null ||
      rw === null
    ) {
      return null;
    }

    return {
      position: { x, y, z },
      rotation: { x: rx, y: ry, z: rz, w: rw },
    };
  }

  private normalizeMetadata(
    metadata: unknown,
    mapName: string,
    defaultSource: ReplayMetadata['source']
  ): ReplayMetadata {
    const defaults = this.defaultMetadata(mapName, defaultSource);

    const playerName = readString(metadata, 'playerName') ?? defaults.playerName;
    const timeStr = readString(metadata, 'timeStr') ?? defaults.timeStr;
    const mapNameValue = readString(metadata, 'mapName') ?? defaults.mapName;

    const timeMsValue = readNumber(metadata, 'timeMs');
    const timeMs = timeMsValue === null || timeMsValue < 0 ? defaults.timeMs : timeMsValue;

    const completedAt = readString(metadata, 'completedAt') ?? defaults.completedAt;
    const completedAtDate = new Date(completedAt);

    const replayVersionValue = readNumber(metadata, 'replayVersion');
    const replayVersion = replayVersionValue === null ? REPLAY_FORMAT_VERSION : replayVersionValue;

    const sourceValue = readString(metadata, 'source');
    const source =
      sourceValue === 'local' || sourceValue === 'bundled' || sourceValue === 'migrated-legacy'
        ? sourceValue
        : defaults.source;

    return {
      playerName,
      timeMs,
      timeStr,
      completedAt: Number.isNaN(completedAtDate.getTime()) ? defaults.completedAt : completedAt,
      mapName: mapNameValue,
      replayVersion,
      source,
    };
  }

  private normalizeReplayPayload(
    payload: unknown,
    mapName: string,
    defaultSource: ReplayMetadata['source']
  ): { replay: ReplayPayload | null; migrated: boolean } {
    if (Array.isArray(payload)) {
      const frames = payload
        .map(frame => this.parseFrameData(frame))
        .filter((frame): frame is ReplayFrameData => frame !== null);
      if (frames.length === 0) return { replay: null, migrated: false };

      const source = defaultSource === 'local' ? 'migrated-legacy' : defaultSource;
      return {
        replay: {
          version: REPLAY_FORMAT_VERSION,
          frames,
          metadata: this.defaultMetadata(mapName, source),
        },
        migrated: true,
      };
    }

    if (!isRecord(payload)) return { replay: null, migrated: false };
    if (payload.version !== REPLAY_FORMAT_VERSION) return { replay: null, migrated: false };
    if (!Array.isArray(payload.frames)) return { replay: null, migrated: false };

    const frames = payload.frames
      .map(frame => this.parseFrameData(frame))
      .filter((frame): frame is ReplayFrameData => frame !== null);

    if (frames.length === 0) return { replay: null, migrated: false };

    const metadata = this.normalizeMetadata(payload.metadata, mapName, defaultSource);
    const migrated = !isRecord(payload.metadata) || typeof payload.metadata.source !== 'string';

    return {
      replay: {
        version: REPLAY_FORMAT_VERSION,
        frames,
        metadata,
      },
      migrated,
    };
  }

  createReplayPayload(recording: DemoEntry[], metadata: ReplayMetadataInput): ReplayPayload | null {
    if (recording.length === 0) return null;
    const frames = recording.map(frame => this.toFrameData(frame));

    return {
      version: REPLAY_FORMAT_VERSION,
      frames,
      metadata: {
        ...metadata,
        replayVersion: REPLAY_FORMAT_VERSION,
      },
    };
  }

  saveReplay(replay: ReplayPayload, type: 'local-best' | 'bundled-record' = 'local-best'): void {
    const key =
      type === 'local-best'
        ? `${LOCAL_BEST_STORAGE_KEY_PREFIX}${replay.metadata.mapName}`
        : `${BUNDLED_RECORD_STORAGE_KEY_PREFIX}${replay.metadata.mapName}`;

    localStorage.setItem(key, JSON.stringify(replay));
  }

  loadStoredReplay(mapName: string): {
    replay: ReplayPayload | null;
    type: 'local-best' | 'bundled-record' | null;
  } {
    // 1. Try to load local best first
    const localBestKey = `${LOCAL_BEST_STORAGE_KEY_PREFIX}${mapName}`;
    const localBestJson = localStorage.getItem(localBestKey);

    if (localBestJson) {
      try {
        const { replay, migrated } = this.normalizeReplayPayload(
          JSON.parse(localBestJson),
          mapName,
          'local'
        );
        if (replay) {
          if (migrated) {
            console.warn('[Replay] Migrated local-best replay data to v1 format.');
            this.saveReplay(replay, 'local-best');
          }
          return { replay, type: 'local-best' };
        } else {
          localStorage.removeItem(localBestKey);
        }
      } catch {
        localStorage.removeItem(localBestKey);
      }
    }

    // 2. Try to load bundled record
    const bundledRecordKey = `${BUNDLED_RECORD_STORAGE_KEY_PREFIX}${mapName}`;
    const bundledRecordJson = localStorage.getItem(bundledRecordKey);

    if (bundledRecordJson) {
      try {
        const { replay, migrated } = this.normalizeReplayPayload(
          JSON.parse(bundledRecordJson),
          mapName,
          'bundled'
        );
        if (replay) {
          if (migrated) {
            console.warn('[Replay] Migrated bundled-record replay data to v1 format.');
            this.saveReplay(replay, 'bundled-record');
          }
          return { replay, type: 'bundled-record' };
        } else {
          localStorage.removeItem(bundledRecordKey);
        }
      } catch {
        localStorage.removeItem(bundledRecordKey);
      }
    }

    // 3. Fallback to legacy demo key migration
    const legacyJson = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyJson) {
      try {
        const { replay } = this.normalizeReplayPayload(JSON.parse(legacyJson), mapName, 'local');
        if (replay) {
          console.warn('[Replay] Migrated legacy generic replay data to local-best v1 format.');
          this.saveReplay(replay, 'local-best');
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return { replay, type: 'local-best' };
        }
      } catch {
        // Just ignore legacy parse errors
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    return { replay: null, type: null };
  }

  async loadOrCreateStoredReplay(
    fallbackUrl: string,
    mapName: string
  ): Promise<ReplayPayload | null> {
    const { replay: storedReplay, type } = this.loadStoredReplay(mapName);

    // If we have a local best, or we already downloaded the bundled record, use it.
    if (storedReplay && (type === 'local-best' || type === 'bundled-record')) {
      return storedReplay;
    }

    try {
      const response = await fetch(fallbackUrl);
      if (!response.ok) return null;
      const { replay, migrated } = this.normalizeReplayPayload(
        await response.json(),
        mapName,
        'bundled'
      );
      if (!replay) return null;

      if (migrated) {
        console.warn('[Replay] Migrated downloaded bundled replay data to v1 format.');
      }

      this.saveReplay(replay, 'bundled-record');
      return replay;
    } catch {
      return null;
    }
  }

  async playReplay(replay: ReplayPayload, scene?: BABYLON.Scene): Promise<void> {
    await this.playDemo(
      replay.frames.map(frame => this.fromFrameData(frame)),
      scene
    );
  }

  startRecording(player: PlayerEntity): void {
    if (!player.mesh) return;
    if (this.recordingInterval || this.recording.length > 0) this.reset();

    this.recordingInterval = setTimeout(() => this.storeFrame(player), SAMPLE_RATE_MS);
  }

  storeFrame(player: PlayerEntity): void {
    const frame = {
      position: player.mesh!.position.clone(),
      rotation: player.mesh!.rotationQuaternion!.clone(),
    };
    this.recording.push(frame);
    this.recordingInterval = setTimeout(() => this.storeFrame(player), SAMPLE_RATE_MS);
  }

  reset(): void {
    this.recording = [];
    if (this.recordingInterval) {
      clearTimeout(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  stopRecording(): DemoEntry[] {
    if (!this.recordingInterval) return [];
    clearTimeout(this.recordingInterval);
    this.recordingInterval = null;

    return this.recording;
  }

  async playDemo(demo: DemoEntry[], scene?: BABYLON.Scene): Promise<void> {
    if (this.playingInterval) {
      clearTimeout(this.playingInterval);
      this.playingInterval = null;
    }
    if (scene) {
      this.scene = scene;
    }
    this.playing = demo;
    this.playingFrameIndex = 0;

    if (!this.playingEntity) {
      this.playingEntity = await this.createPlayingEntity();
    }
    this.playingInterval = setTimeout(() => this.playFrame(), SAMPLE_RATE_MS);
  }

  playFrame(): void {
    if (this.playingFrameIndex >= this.playing.length) {
      this.playingFrameIndex = 0;
    }

    const frame = this.playing[this.playingFrameIndex];
    if (frame) {
      this.playingEntity!.position = frame.position;
      this.playingEntity!.rotationQuaternion = frame.rotation;
    }

    this.playingFrameIndex++;
    this.playingInterval = setTimeout(() => this.playFrame(), SAMPLE_RATE_MS);
  }

  async createPlayingEntity(): Promise<BABYLON.Mesh> {
    if (!this.scene) {
      throw new Error('DemoService scene is not set');
    }
    const scene = this.scene;
    const nickname = 'Map record';

    const box = BABYLON.MeshBuilder.CreateBox(
      'player-demo',
      {
        width: 0.4,
        height: 0.4,
        depth: 0.4,
      },
      scene
    );
    box.visibility = 0;

    const playerModel = await getModel(scene, 'player-red.glb');
    playerModel.meshes.forEach(mesh => {
      if (mesh.parent === null) {
        mesh.setParent(box);
        mesh.position = new BABYLON.Vector3(0, 0.001, 0);
      }
    });

    GameEntity.createNameTag(scene, box, nickname);

    return box;
  }
}
