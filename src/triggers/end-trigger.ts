import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player-entity';
import {  CreateTriggerOptions, Trigger } from './trigger';
import { endTriggerColor } from '../assets/colors';
import gameRoot from '../game-root';
import { GameLevel } from '../game-level';

export class EndTrigger extends Trigger {
  constructor(scene: BABYLON.Scene, level: GameLevel, opts: CreateTriggerOptions) {
    super(scene, level, { ...opts, isVisible: true });
    (this.mesh.material as BABYLON.StandardMaterial).diffuseColor = endTriggerColor;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
    const timer = this.level.timer;
    if (!timer?.active) return;
    timer.stop();
    gameRoot.multiplayer?.sendTimeToServer({
      nickname: player.nickname,
      timeStr: timer.getTimeAsString(),
      time: timer.getTime(),
      checkpoints: player.checkpoints.length
    });
    this.mesh.getScene().sounds?.find(x => x.name === 'wicked-sick')?.play();
    const demo = gameRoot.demoService.stopRecording();
    gameRoot.demoService.playDemo(demo);
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  }

  serialize(): any {
    return {
      ...super.serialize(),
      type: 'end'
    }
  }
}