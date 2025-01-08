import * as BABYLON from '@babylonjs/core';
import { WallEntity } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';
import { ArcRotateCameraOptions } from '../../cameras/arc-rotate-camera';
import { GameLevel } from '../../game-level';
import { Trigger } from '../../triggers/trigger';
import { AutomaticCamera } from '../../cameras/automatic-camera';

// front
export const stage4Camera1: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(8.45, 25.39, -12.14),
  alpha: 0,
  beta: 1.0646,
  radius: 6
};

// left
export const stage4Camera2: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(-5.17, 30.62, -22.25),
  alpha: 4.2592,
  beta: 0.8755,
  radius: 12
};

// right
export const stage4Camera3: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(-1.54, 34.70, -2.79),
  alpha: 1.4415,
  beta: 0.8745,
  radius: 12
};

// final
export const stage4Camera4: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(12.37, 20.50, -8.56),
  alpha: 1.6465,
  beta: 1.1284,
  radius: 6
};

export const createStage4 = (scene: BABYLON.Scene, level: GameLevel) => {
  const walls = []

  walls.push(
    // fourth stage
    new WallEntity(scene, level, 'box', { width: 10, depth: 10, height: 22 }, new BABYLON.Vector3(0, 11, -12)),
    // main cylinder
    new WallEntity(scene, level, 'cylinder', { diameter: 5, height: 20 }, new BABYLON.Vector3(0, 22, -12)),
    // cylinder walls
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(2.60, 23.00, -12.00)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.29, 24.20, -14.18), new BABYLON.Quaternion(0.00, -0.30, 0.00, 0.96)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-1.19, 25.50, -14.28), new BABYLON.Quaternion(-0.00, 0.25, -0.00, 0.97)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-2.55, 26.70, -12.0), new BABYLON.Quaternion(0.00, 0.68, 0.00, 0.73)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-0.65, 27.60, -9.53), new BABYLON.Quaternion(0.00, 0.00, 0.00, 1.00)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.84, 28.60, -10.15), new BABYLON.Quaternion(0.00, 0.92, 0.00, -0.3)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(2.43, 29.70, -12.77), new BABYLON.Quaternion(0.00, -0.60, 0.00, 0.80)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.34, 30.90, -14.23), new BABYLON.Quaternion(0.00, -0.24, 0.00, 0.97))
  )

    // front camera trigger
    const trigger1 = new Trigger(scene, {
      level,
      position: new BABYLON.Vector3(3.50, 27.10, -10.46),
      width: 3,
      depth: 5,
      height: 10
    });
    trigger1.onEnter = showFrontCamera;

    // left camera trigger
    const trigger2 = new Trigger(scene, {
      level,
      position: new BABYLON.Vector3( -1.50, 25.50, -15.66),
      width: 6,
      depth: 3,
      height: 6
    });
    trigger2.onEnter = showCameraLeft;

    // right camera trigger
    const trigger3 = new Trigger(scene, {
      level,
      position: new BABYLON.Vector3(-1.77, 27.10, -10.45),      
      width: 3,
      depth: 3,
      height: 9
    });
    trigger3.onEnter = showCameraRight;
    
  return walls;
}  
  
const showFrontCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage4Camera1.alpha, stage4Camera1.beta, stage4Camera1.radius, 50);
}

const showCameraLeft = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage4Camera2.alpha, stage4Camera2.beta, stage4Camera2.radius, 50);
}

const showCameraRight = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage4Camera3.alpha, stage4Camera3.beta, stage4Camera3.radius, 50);
}