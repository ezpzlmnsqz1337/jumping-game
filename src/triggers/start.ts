import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { resetTimer, startTimer } from '../entities/timer';
import { createTrigger, CreateTriggerOptions } from './trigger';
import { startTriggerColor } from '../assets/colors';

export const createStartTrigger = (scene: BABYLON.Scene, opts: CreateTriggerOptions) => {
  const material = new BABYLON.StandardMaterial('triggerMaterial');
  material.diffuseColor = startTriggerColor;
  material.alpha = 0.7;

  const trigger = createTrigger(scene, {
    ...opts, 
    isVisible: true,
    onEnter: onEnterTriggerAction,
    onExit: onExitTriggerAction
  });
  trigger.material = material;

  return trigger;
}

const onEnterTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  console.log('Player entered the start trigger');
  (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
  player.checkpoints = [];
  resetTimer();
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  console.log('Player exited the start trigger');
  (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  startTimer();
}