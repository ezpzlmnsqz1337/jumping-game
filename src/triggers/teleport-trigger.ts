import * as BABYLON from '@babylonjs/core';
import { teleportTriggerColor } from '../assets/colors';
import { PlayerEntity } from '../entities/player-entity';
import { CreateTriggerOptions, Trigger } from './trigger';

export class TeleportTrigger extends Trigger {
  destination: BABYLON.Vector3;
  name: string;

  constructor(
    name: string,
    scene: BABYLON.Scene,
    opts: CreateTriggerOptions,
    destination: BABYLON.Vector3
  ) {
    super(scene, {
      ...opts,
      scaling: opts.scaling || new BABYLON.Vector3(1, 0.2, 1),
      isVisible: opts.isVisible ?? true,
      triggerType: 'teleport',
    });
    this.name = name;
    this.destination = destination;
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = teleportTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    this.level.resetRunForTeleport(player, this.destination);
  }

  onExit(trigger: BABYLON.Mesh, _player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  }

  serialize() {
    return {
      ...super.serialize(),
      destination: {
        x: this.destination.x,
        y: this.destination.y,
        z: this.destination.z,
      },
    };
  }
}
