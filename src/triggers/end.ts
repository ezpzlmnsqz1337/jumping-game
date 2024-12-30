import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { getCurrentTimerTime, getCurrentTimerTimeStr, isTimerActive, stopTimer } from '../entities/timer';
import { getMultiplayerSession } from '../multiplayer';
import { createTrigger, CreateTriggerOptions } from './trigger';
import { endTriggerColor } from '../assets/colors';

export const createEndTrigger = (scene: BABYLON.Scene, opts: CreateTriggerOptions) => {
  const material = new BABYLON.StandardMaterial('triggerMaterial');
  material.diffuseColor = endTriggerColor;
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
  console.log('Player entered the end trigger');
  (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
  if (!isTimerActive()) return;
  stopTimer();
  const defaultNickname = `player${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
  getMultiplayerSession()?.sendTimeToServer({
    nickname: player.nickname || defaultNickname,
    timeStr: getCurrentTimerTimeStr(),
    time: getCurrentTimerTime(),
    checkpoints: player.checkpoints.length
  });
  trigger.getScene().sounds?.find(x => x.name === 'wicked-sick')?.play();
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  console.log('Player exited the end trigger');
  (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
}