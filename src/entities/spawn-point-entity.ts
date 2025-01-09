import * as BABYLON from '@babylonjs/core';
import { GameEntity } from './game-entity';
import { GameLevel } from '../game-level';

export class SpawnPointEntity extends GameEntity {
  constructor(name: string, level: GameLevel, scene: BABYLON.Scene, position: BABYLON.Vector3) {
    super(name, level, scene);
    this.mesh = BABYLON.MeshBuilder.CreateBox(name, {
      width: 0.4,
      height: 0.1,
      depth: 0.4,
    }, scene);

    this.mesh.visibility = 0;
    this.mesh.position = position;
  }
}