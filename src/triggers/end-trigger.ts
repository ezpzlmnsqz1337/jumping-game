import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player-entity';
import { CreateTriggerOptions, Trigger } from './trigger';
import { endTriggerColor } from '../assets/colors';

export class EndTrigger extends Trigger {
  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    super(scene, { ...opts, isVisible: true, triggerType: 'end' });
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = endTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    this.level.finishRun(player);
  }

  onExit(trigger: BABYLON.Mesh, _player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  }
}
