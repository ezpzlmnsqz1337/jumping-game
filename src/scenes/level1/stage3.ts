import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';
import { CameraOptions, MyCamera, setCameraOptions } from '../../camera';
import { createTrigger } from '../../triggers/trigger';

// back wall camera
export const stage3Camera1: CameraOptions = {
  position: new BABYLON.Vector3(12.37, 20.50, -8.56),
  alpha: 1.6465,
  beta: 1.1284,
  radius: 6
};

// left wall camera
export const stage3Camera2: CameraOptions = {
  position: new BABYLON.Vector3(8.32, 16.13, -5.27),
  alpha: 2.6993,
  beta: 1.1284,
  radius: 6
};

// right wall camera
export const stage3Camera3: CameraOptions = {
  position: new BABYLON.Vector3(5.10, 17.00, -12.00),
  alpha: 6.3692,
  beta: 1.1284,
  radius: 6
};

// front wall camera
export const stage3Camera4: CameraOptions = {
  position: new BABYLON.Vector3(6.62, 21.18, -15.02),
  alpha: 4.8616,
  beta: 1.1284,
  radius: 6
};

// left wall camera (up)
export const stage3Camera5: CameraOptions = {
  position: new BABYLON.Vector3(6.59, 23.93, -8.48),
  alpha: 3.2898,
  beta: 1.1284,
  radius: 6
};

// final part camera
export const stage3Camera6: CameraOptions = {
  position: new BABYLON.Vector3( 19.86, 28.25, -9.14),
  alpha: 6.8884,
  beta: 0.8010,
  radius: 9.41
}

export const createStage3 = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // third stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 12 }, new BABYLON.Vector3(10, 6, -12)),
    // side walls
    createWall(scene, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(14.9, 17, -12)),
    createWall(scene, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(5.1, 17, -12)),
    createWall(scene, 'box', { width: 9.6, depth: 0.2, height: 10 }, new BABYLON.Vector3(10, 17, -16.9)),
    createWall(scene, 'box', { width: 9.6, depth: 0.2, height: 5 }, new BABYLON.Vector3(10, 19.5, -7.1)),
    // jumps
    // left side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 12.7, -8)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.1, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.6, -12)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 14, -14.5)),
    // back side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 14.7, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 15.1, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9, 15.6, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(6.5, 16.3, -16.4)),
    // right side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17, -14.5)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17.5, -12)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.1, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.7, -8)),
    // front side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(7.5, 19.1, -7.6)),
    createWall(scene, 'box', { width: 0.3, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9.3, 19.6, -7.6)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 20, -7.6)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 20.5, -7.6)),
    // left side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21.4, -13)),
    createWall(scene, 'box', { width: 5.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(8.1, 21.4, -13))
  )


  // back wall camera trigger main (in the center)
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(10.20, 13.00, -11.80),
    width: 5,
    depth: 5,
    height: 2,
    onEnter: showBackWallCamera,
    onExit: onExitTriggerAction
  });

  // left wall camera trigger
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(13.78, 13.00, -11.79),
    width: 2,
    depth: 9.6,
    height: 2,
    onEnter: showLeftWallCamera,
    onExit: onExitTriggerAction
  });

  // back wall camera trigger
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(9.94, 15.20, -15.39),
    width: 9.6,
    depth: 2,
    height: 2,
    onEnter: showBackWallCamera,
    onExit: onExitTriggerAction
  });

  // right wall camera trigger
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(6.24, 17.60, -11.99),
    width: 2,
    depth: 9.6,
    height: 2,
    onEnter: showRightWallCamera,
    onExit: onExitTriggerAction
  });

  // front wall camera trigger
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(9.94, 19.70, -8.19),
    width: 9.6,
    depth: 2,
    height: 1,
    onEnter: showFrontWallCamera,
    onExit: onExitTriggerAction
  });

  // left wall camera trigger up
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3( 13.84, 21.40, -8.79),
    width: 2,
    depth: 3,
    height: 2,
    onEnter: showLeftWallCameraUp,
    onExit: onExitTriggerAction
  });

  // final part trigger
  createTrigger(scene, {
    player,
    position: new BABYLON.Vector3(10.04, 22.30, -13.09),
    width: 9,
    depth: 2,
    height: 2,
    onEnter: showFinalPartCamera,
    onExit: onExitTriggerAction
  });

  return walls;
}

const showBackWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera1);
  }, 300);
}
const showLeftWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera2);
  }, 300);
}
const showLeftWallCameraUp = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera5);
  }, 300);
}
const showRightWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera3);
  }, 300);
}
const showFrontWallCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera4);
  }, 300);
}

const showFinalPartCamera = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
  setTimeout(() => {
    const camera = player.mesh.getScene().activeCamera as MyCamera;
    if (!camera) return
    setCameraOptions(camera, stage3Camera6);
  }, 300);
}

const onExitTriggerAction = (trigger: BABYLON.Mesh, player: PlayerEntity) => {

}