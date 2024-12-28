import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { getCurrentTimerTime, getCurrentTimerTimeStr, stopTimer, TimerEntity } from '../timer';
import { endTriggerColor } from '../colors';
import { getMultiplayerSession } from '../multiplayer';

export interface CreateEndTriggerOptions {
  player: PlayerEntity
  timer: TimerEntity
  position?: BABYLON.Vector3
  scaling?:  BABYLON.Vector3
}

export const createEndTrigger = (scene: BABYLON.Scene, opts: CreateEndTriggerOptions) => {
  const endTriggerMaterial = new BABYLON.StandardMaterial('endTriggerMaterial');
  endTriggerMaterial.diffuseColor = endTriggerColor;

  const endTrigger = BABYLON.MeshBuilder.CreateBox('endTrigger', { size: 1 }, scene);
  endTrigger.isVisible = true;
  endTrigger.position = opts.position || new BABYLON.Vector3(0, 0, 0);
  endTrigger.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
  endTrigger.checkCollisions = true;
  endTrigger.actionManager = new BABYLON.ActionManager(scene);
  endTrigger.actionManager.registerAction(onEnterTriggerAction(opts.player));
  endTrigger.actionManager.registerAction(onExitTriggerAction(opts.player));
  endTrigger.material = endTriggerMaterial;

  return endTrigger;
}

const onEnterTriggerAction = (player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: player
    },
    () => {
      console.log('Player entered the end trigger');
      stopTimer();
      const defaultNickname = `player${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}`;
      getMultiplayerSession().sendTimeToServer({
        nickname: player.nickname || defaultNickname,
        timeStr: getCurrentTimerTimeStr(true),
        time: getCurrentTimerTime(true),
        checkpoints: 0
      });
    }
  )
}

const onExitTriggerAction = (player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: player
    },
    () => {
      console.log('Player exited the end trigger');
    }
  )
}