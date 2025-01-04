import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { defaultTriggerColor } from '../assets/colors';
import { GameLevel } from '../game-level';

export interface CreateTriggerOptions {
  level: GameLevel
  position?: BABYLON.Vector3
  scaling?: BABYLON.Vector3
  isVisible?: boolean
  [key: string]: any
}

export class Trigger {
  level: GameLevel;
  mesh: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    this.level = opts.level;

    const material = new BABYLON.StandardMaterial('triggerMaterial');
    material.diffuseColor = defaultTriggerColor;
    material.alpha = 0.7;

    this.mesh = BABYLON.MeshBuilder.CreateBox('trigger', { size: 1, ...opts }, scene);
    this.mesh.isVisible = opts.isVisible || false;
    this.mesh.position = opts.position || new BABYLON.Vector3(0, 0, 0);
    this.mesh.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
    this.mesh.checkCollisions = true;

    this.mesh.actionManager = new BABYLON.ActionManager(scene);
    this.mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        { 
          trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
          parameter: this.level.player
        },
        () => this.onEnter(this.mesh, this.level.player as PlayerEntity)
      ));
    this.mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        { 
          trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
          parameter: this.level.player
        },
        () => this.onExit(this.mesh, this.level.player as PlayerEntity)
      )
    );
    this.mesh.material = material;
  }

  onEnter(trigger: BABYLON.Mesh, player: PlayerEntity) {
    console.log(`Player ${player.nickname} entered the trigger ${trigger.name}`);    
  }

  onExit(trigger: BABYLON.Mesh, player: PlayerEntity) {
    console.log(`Player ${player.nickname} exitted the trigger ${trigger.name}`);    
  }
}