import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { defaultTriggerColor } from '../assets/colors';

export interface CreateTriggerOptions {
  player: PlayerEntity
  position?: BABYLON.Vector3
  scaling?: BABYLON.Vector3
  isVisible?: boolean
  [key: string]: any
}


export const createTrigger = (scene: BABYLON.Scene, opts: CreateTriggerOptions) => {  
  const material = new BABYLON.StandardMaterial('triggerMaterial');
  material.diffuseColor = defaultTriggerColor;
  material.alpha = 0.7;

  const trigger = BABYLON.MeshBuilder.CreateBox('trigger', { size: 1, ...opts }, scene);
  trigger.isVisible = opts.isVisible || false;
  trigger.position = opts.position || new BABYLON.Vector3(0, 0, 0);
  trigger.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
  trigger.checkCollisions = true;

  trigger.actionManager = new BABYLON.ActionManager(scene);
  trigger.actionManager.registerAction(onEnterTriggerAction(trigger, opts.player, opts.onEnter));
  trigger.actionManager.registerAction(onExitTriggerAction(trigger, opts.player, opts.onExit));
  trigger.material = material;

  return trigger;
}

const onEnterTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity, onEnter: (trigger: BABYLON.Mesh, player: PlayerEntity) => void) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: player
    },
    () => onEnter(trigger, player)
  )
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity, onExit: (trigger: BABYLON.Mesh, player: PlayerEntity) => void) => {
  return new BABYLON.ExecuteCodeAction(
    { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: player
    },
    () => onExit(trigger, player)
  )
}