import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { CameraOptions, MyCamera, setCameraOptions } from '../../camera';
import { createTrigger } from '../../triggers/trigger';
import { PlayerEntity } from '../../entities/player';

export const stage2Camera1: CameraOptions = {
  position: new BABYLON.Vector3(1.93, 10.95, 1.52),
  alpha: 2.8882,
  beta: 1.0083,
  radius: 7.41
};

export const createStage2 = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // second stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 5.8 }, new BABYLON.Vector3(10, 2.9, -2)),

    // narrow pillars
    createWall(scene, 'box', { width: 0.2, depth: 0.3, height: 0.5 }, new BABYLON.Vector3(7.4, 6, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 1 }, new BABYLON.Vector3(8, 6.3, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 1.6 }, new BABYLON.Vector3(8, 6.6, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 2.2 }, new BABYLON.Vector3(8, 6.9, -4)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 2.8 }, new BABYLON.Vector3(10, 7.2, -4)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 3.4 }, new BABYLON.Vector3(10, 7.5, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 4 }, new BABYLON.Vector3(10, 7.8, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 4.6 }, new BABYLON.Vector3(12, 8.1, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 5.2 }, new BABYLON.Vector3(12, 8.4, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 5.8 }, new BABYLON.Vector3(12, 8.7, -4))
  )

  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3( 8.00, 6.80, 0.20),
    width: 2,
    depth: 2,
    height: 2,
    onEnter: onEnterTriggerAction,
    onExit: onExitTriggerAction
  });

  return walls;
}

const onEnterTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh.getScene().activeCamera as MyCamera;
  if (!camera) return
  setCameraOptions(camera, stage2Camera1);
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {

}