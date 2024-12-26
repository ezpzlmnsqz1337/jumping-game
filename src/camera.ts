import * as BABYLON from '@babylonjs/core';

export const createFollowCamera = (scene: BABYLON.Scene) => {
  const camera = new BABYLON.FollowCamera('mainFollowCamera', new BABYLON.Vector3(0, 5, 5), scene);

  camera.radius = 5;
  camera.heightOffset = 1.8;
  camera.rotationOffset = 45;
  camera.cameraAcceleration = 0.005;
  camera.maxCameraSpeed = 2;
  camera.attachControl(true);

  return camera
}

export const createArcRotateCamera = (scene: BABYLON.Scene) => {
  const camera = new BABYLON.ArcRotateCamera('mainArcRotateCamera', 5, 1, 10, new BABYLON.Vector3(0, 5, 5), scene);
  camera.useAutoRotationBehavior = true;
  camera.attachControl(true);

  return camera;
}