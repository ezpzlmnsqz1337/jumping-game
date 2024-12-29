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
  startTriggerMaterial.alpha = 0.7;

  const startTrigger = BABYLON.MeshBuilder.CreateBox('startTrigger', { size: 1 }, scene);
  startTrigger.isVisible = true;
  startTrigger.position = opts.position || new BABYLON.Vector3(0, 0, 0);
  startTrigger.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
  startTrigger.checkCollisions = true;
  startTrigger.actionManager = new BABYLON.ActionManager(scene);
  startTrigger.actionManager.registerAction(onEnterTriggerAction(startTrigger, opts.player));
  startTrigger.actionManager.registerAction(onExitTriggerAction(startTrigger, opts.player));
  startTrigger.material = startTriggerMaterial;

  return startTrigger;
}

const onEnterTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: player
    },
    () => {
      console.log('Player entered the start trigger');
      (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Gray();
      resetTimer();
    }
  )
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: player
    },
    () => {
      console.log('Player exited the start trigger');
      (trigger.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
      startTimer();
    }
  )
}