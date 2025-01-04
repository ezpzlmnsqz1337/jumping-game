import * as BABYLON from '@babylonjs/core';
import { startTriggerColor } from '../assets/colors';
import { PlayerEntity } from '../entities/player';
import { CreateTriggerOptions, Trigger } from './trigger';

export class StartTrigger extends Trigger {
  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    super(scene, { ...opts, isVisible: true });
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = startTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    player.checkpoints = [];
    player.lastCheckpointIndex = 0;
    this.level.timer?.reset();
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
    this.level.timer?.start();
  }
}