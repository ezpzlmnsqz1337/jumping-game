import * as BABYLON from '@babylonjs/core';

export const createFollowCamera = (scene: BABYLON.Scene) => {
  const camera = new BABYLON.FollowCamera('mainFollowCamera', new BABYLON.Vector3(0, 5, 5), scene);

  camera.radius = 3;
  camera.heightOffset = 1.8;
  camera.rotationOffset = 45;
  camera.cameraAcceleration = 0.005;
  camera.maxCameraSpeed = 10;
  camera.attachControl(true);
  
  return camera
}