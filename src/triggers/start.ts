import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { resetTimer, startTimer, TimerEntity } from '../entities/timer';
import { startTriggerColor } from '../assets/colors';

export interface CreateStartTriggerOptions {
  player: PlayerEntity
  timer: TimerEntity
  position?: BABYLON.Vector3
  scaling?: BABYLON.Vector3
}

export const createStartTrigger = (scene: BABYLON.Scene, opts: CreateStartTriggerOptions) => {
  const startTriggerMaterial = new BABYLON.StandardMaterial('startTriggerMaterial');
  startTriggerMaterial.diffuseColor = startTriggerColor;

  const startTrigger = BABYLON.MeshBuilder.CreateBox('startTrigger', { size: 1 }, scene);
  startTrigger.isVisible = true;
  startTrigger.position = opts.position || new BABYLON.Vector3(0, 0, 0);
  startTrigger.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
  startTrigger.checkCollisions = true;
  startTrigger.actionManager = new BABYLON.ActionManager(scene);
  startTrigger.actionManager.registerAction(onEnterTriggerAction(opts.player));
  startTrigger.actionManager.registerAction(onExitTriggerAction(opts.player));
  startTrigger.material = startTriggerMaterial;

  return startTrigger;
}

const onEnterTriggerAction = (player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: player
    },
    () => {
      console.log('Player entered the start trigger');
      resetTimer();
    }
  )
}

const onExitTriggerAction = (player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: player
    },
    () => {
      console.log('Player exited the start trigger');
      startTimer();
    }
  )
}