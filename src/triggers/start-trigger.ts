import * as BABYLON from '@babylonjs/core';
import { startTriggerColor } from '../assets/colors';
import { PlayerEntity } from '../entities/player-entity';
import { CreateTriggerOptions, Trigger } from './trigger';
import gameRoot from '../game-root';

export class StartTrigger extends Trigger {
  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    super(scene, { ...opts, isVisible: true, triggerType: 'start' });
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = startTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    const timer = this.level.timer;
    if (!timer) return;

    timer.resetRun();
    timer.armRun();

    player.checkpoints = [];
    player.lastCheckpointIndex = 0;
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
    const timer = this.level.timer;
    if (!timer?.startRun()) return;

    gameRoot.demoService.startRecording(player);
  }
}
