import * as BABYLON from '@babylonjs/core';
import { teleportTriggerColor } from '../assets/colors';
import { PlayerEntity } from '../entities/player-entity';
import { CreateTriggerOptions, Trigger } from './trigger';
import { GameLevel } from '../game-level';

export class TeleportTrigger extends Trigger {
  destination: BABYLON.Vector3;
  name: string;

  constructor(name: string, scene: BABYLON.Scene, level: GameLevel, opts: CreateTriggerOptions, destination: BABYLON.Vector3) {
    super(scene, level, {
      ...opts,
      scaling: new BABYLON.Vector3(1, 0.2, 1),
      isVisible: true
    });
    this.name = name;
    this.destination = destination;
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = teleportTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    
    if (!player.mesh) return;

    player.checkpoints = [];
    player.lastCheckpointIndex = 0;
    this.level.timer?.reset();

    player.physics.body.disablePreStep = true;
    player.mesh.position = this.destination.clone();
    player.physics.body.setLinearVelocity(BABYLON.Vector3.Zero());
    player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
    player.physics.body.disablePreStep = false;
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  }

  serialize(): any {
    return {
      ...super.serialize(),
      destination: this.destination,
      type: 'teleport'
    }
  }
}