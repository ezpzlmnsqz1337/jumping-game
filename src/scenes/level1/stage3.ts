import * as BABYLON from '@babylonjs/core';
import { ArcRotateCameraOptions } from '../../cameras/arc-rotate-camera';
import { PlayerEntity } from '../../entities/player';
import { WallEntity } from '../../entities/walls';
import { GameLevel } from '../../game-level';
import { Trigger } from '../../triggers/trigger';
import { AutomaticCamera } from '../../cameras/automatic-camera';

// back wall camera
export const stage3Camera1: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(12.37, 20.50, -8.56),
  alpha: 1.6465,
  beta: 1.1284,
  radius: 6
};

// left wall camera
export const stage3Camera2: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(8.32, 16.13, -5.27),
  alpha: 2.6993,
  beta: 1.1284,
  radius: 6
};

// right wall camera
export const stage3Camera3: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(5.10, 17.00, -12.00),
  alpha: 6.3692,
  beta: 1.1284,
  radius: 6
};

// front wall camera
export const stage3Camera4: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(6.62, 21.18, -15.02),
  alpha: 4.8616,
  beta: 1.1284,
  radius: 6
};

// left wall camera (up)
export const stage3Camera5: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(6.59, 23.93, -8.48),
  alpha: 3.2898,
  beta: 1.1284,
  radius: 6
};

// final part camera
export const stage3Camera6: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(19.86, 28.25, -9.14),
  alpha: 6.8884,
  beta: 0.8010,
  radius: 9.41
}

export const createStage3 = (scene: BABYLON.Scene, level: GameLevel) => {
  const walls = []

  walls.push(
    // third stage
    new WallEntity(scene, level, 'box', { width: 10, depth: 10, height: 12 }, new BABYLON.Vector3(10, 6, -12)),
    // side walls
    new WallEntity(scene, level, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(14.9, 17, -12)),
    new WallEntity(scene, level, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(5.1, 17, -12)),
    new WallEntity(scene, level, 'box', { width: 9.6, depth: 0.2, height: 10 }, new BABYLON.Vector3(10, 17, -16.9)),
    new WallEntity(scene, level, 'box', { width: 9.6, depth: 0.2, height: 5 }, new BABYLON.Vector3(10, 19.5, -7.1)),
    // jumps
    // left side
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 12.7, -8)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.1, -10)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.6, -12)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 14, -14.5)),
    // back side
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 14.7, -16.4)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 15.1, -16.4)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9, 15.6, -16.4)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(6.5, 16.3, -16.4)),
    // right side
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17, -14.5)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17.5, -12)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.1, -10)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.7, -8)),
    // front side
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(7.5, 19.1, -7.6)),
    new WallEntity(scene, level, 'box', { width: 0.3, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9.3, 19.6, -7.6)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 20, -7.6)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 20.5, -7.6)),
    // left side
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21, -10)),
    new WallEntity(scene, level, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21.4, -13)),
    new WallEntity(scene, level, 'box', { width: 5.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(8.1, 21.4, -13))
  )


  // back wall camera trigger main (in the center)
  const trigger1 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(10.20, 13.00, -11.80),
    width: 5,
    depth: 5,
    height: 2,
  });
  trigger1.onEnter = showBackWallCamera;

  // left wall camera trigger
  const trigger2 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(13.78, 13.00, -11.79),
    width: 2,
    depth: 9.6,
    height: 2
  });
  trigger2.onEnter = showLeftWallCamera;

  // back wall camera trigger
  const trigger3 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(9.94, 15.20, -15.39),
    width: 9.6,
    depth: 2,
    height: 2,
    onEnter: showBackWallCamera
  });
  trigger3.onEnter = showBackWallCamera;

  // right wall camera trigger
  const trigger4 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(6.24, 17.60, -11.99),
    width: 2,
    depth: 9.6,
    height: 2
  });
  trigger4.onEnter = showRightWallCamera;

  // front wall camera trigger
  const trigger5 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(9.94, 19.70, -8.19),
    width: 9.6,
    depth: 2,
    height: 1
  });
  trigger5.onEnter = showFrontWallCamera;

  // left wall camera trigger up
  const trigger6 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(13.84, 21.40, -8.79),
    width: 2,
    depth: 3,
    height: 2,
  });
  trigger6.onEnter = showLeftWallCameraUp;

  // final part trigger
  const trigger7 = new Trigger(scene, {
    level,
    position: new BABYLON.Vector3(10.04, 22.30, -13.09),
    width: 9,
    depth: 2,
    height: 2
  });
  trigger7.onEnter = showFinalPartCamera;

  return walls;
}

const showBackWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera1.alpha, stage3Camera1.beta, stage3Camera1.radius, 50);
}

const showLeftWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera2.alpha, stage3Camera2.beta, stage3Camera2.radius, 50);
}

const showLeftWallCameraUp = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera5.alpha, stage3Camera5.beta, stage3Camera5.radius, 50);
}

const showRightWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera3.alpha, stage3Camera3.beta, stage3Camera3.radius, 50);
}

const showFrontWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera4.alpha, stage3Camera4.beta, stage3Camera4.radius, 50);
}

const showFinalPartCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
  if (!camera) return
  camera.setMoveToTarget(stage3Camera6.alpha, stage3Camera6.beta, stage3Camera6.radius, 50);
}