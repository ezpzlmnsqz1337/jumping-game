import * as BABYLON from '@babylonjs/core';
import { startTriggerColor } from '../assets/colors';
import { PlayerEntity } from '../entities/player-entity';
import { CreateTriggerOptions, Trigger } from './trigger';

export class StartTrigger extends Trigger {
  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    super(scene, { ...opts, isVisible: true, triggerType: 'start' });
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = startTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    this.level.armRunFromStart(player);
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
    this.level.startRunFromStart(player);
  }
}
