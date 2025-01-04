import * as BABYLON from '@babylonjs/core';
import { CameraOptions, MyCamera, MyFollowCamera, setCameraOptions } from '../../camera';
import { PlayerEntity } from '../../entities/player';
import { WallEntity } from '../../entities/walls';
import { GameLevel } from '../../game-level';
import { Trigger } from '../../triggers/trigger';

export const stage1Camera1: CameraOptions = {
  position: new BABYLON.Vector3(-17.85, 3.04, -4.01),
  alpha: 3.3075,
  beta: 1.1366,
  radius: 6.76
};

export const createStage1 = (scene: BABYLON.Scene, level: GameLevel) => {
  const walls = []

  // wide pillars
  walls.push(
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 1 }, new BABYLON.Vector3(-3, 0.5, 1)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 1.6 }, new BABYLON.Vector3(-3, 0.8, -2)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 2.2 }, new BABYLON.Vector3(-3, 1.1, -5)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 2.8 }, new BABYLON.Vector3(0, 1.4, -5)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 3.4 }, new BABYLON.Vector3(0, 1.7, -2)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 4 }, new BABYLON.Vector3(0, 2, 1)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 4.6 }, new BABYLON.Vector3(3, 2.3, 1)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 5.2 }, new BABYLON.Vector3(3, 2.6, -2)),
    new WallEntity(scene, level, 'box', { width: 2, depth: 2, height: 5.8 }, new BABYLON.Vector3(3, 2.9, -5))
  )

  const trigger = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(-3, 1.5, 1),
    width: 2,
    depth: 2,
    height: 1
  });
  trigger.onEnter = onEnterTriggerAction;
  return walls;
}

const onEnterTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as MyCamera | MyFollowCamera;
  if (!camera) return
  setCameraOptions(camera, stage1Camera1);
}
