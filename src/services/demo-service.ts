import * as BABYLON from '@babylonjs/core';
import { getModel } from '../assets/models';
import { GameEntity } from '../entities/game-entity';
import { PlayerEntity } from "../entities/player-entity";
import gameRoot from '../game-root';

interface DemoEntry {
  position: BABYLON.Vector3;
  rotation: BABYLON.Quaternion;
}

interface DemoRecording {
  entires: DemoEntry[];
  time: number;
}

const SAMPLE_RATE_MS = 1000 / 60;

export class DemoService {
  recording: DemoEntry[] = [];
  recordingInterval: NodeJS.Timeout | null = null;

  playing: DemoEntry[] = [];
  playingFrameIndex = 0;
  playingInterval: NodeJS.Timeout | null = null;
  playingEntity: BABYLON.Mesh | null = null;

  startRecording(player: PlayerEntity): void {
    if (!player.mesh) return;
    if (this.recordingInterval || this.recording.length > 0) this.reset();

    this.recordingInterval = setTimeout(() => this.storeFrame(player), SAMPLE_RATE_MS);
  }

  storeFrame(player: PlayerEntity): void {
    const frame = {
      position: player.mesh!.position.clone(),
      rotation: player.mesh!.rotationQuaternion!.clone()
    };
    this.recording.push(frame);
    this.recordingInterval = setTimeout(() => this.storeFrame(player), SAMPLE_RATE_MS);
  }

  reset(): void {
    this.recording = [];
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  stopRecording(): DemoEntry[] {
    if (!this.recordingInterval) return [];
    if (this.recordingInterval) clearInterval(this.recordingInterval);

    localStorage.setItem('demo', JSON.stringify(this.recording));

    return this.recording;
  }

  async playDemo(demo: DemoEntry[]): Promise<void> {
    if (this.playingInterval) {
      clearInterval(this.playingInterval);
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
    const scene = gameRoot.activeScene!;
    const nickname = 'Map record';

    const box = BABYLON.MeshBuilder.CreateBox('player-demo', {
      width: 0.4,
      height: 0.4,
      depth: 0.4
    }, scene);
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