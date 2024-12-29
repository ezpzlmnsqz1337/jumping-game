import * as BABYLON from '@babylonjs/core';

export const createFollowCamera = (scene: BABYLON.Scene) => {
  const camera = new BABYLON.FollowCamera('mainFollowCamera', new BABYLON.Vector3(0, 15, 5), scene);

  camera.radius = 5;
  camera.heightOffset = 1.8;
  camera.rotationOffset = 45;
  camera.cameraAcceleration = 0.005;
  camera.maxCameraSpeed = 2;
  camera.attachControl(true);

  return camera
}

export const createArcRotateCamera = (scene: BABYLON.Scene) => {
  const camera = new BABYLON.ArcRotateCamera('mainArcRotateCamera', 6, 1, 5, new BABYLON.Vector3(55, 10, -30), scene);
  // camera.useAutoRotationBehavior = true;
  camera.wheelDeltaPercentage = 0.01;
  camera.speed = 0.1;
  camera.angularSensibilityX = 1000; // Adjust this value to change horizontal turning speed
  camera.angularSensibilityY = 1000; // Adjust this value to change vertical turning speed  
  
  camera.attachControl(true);

  return camera;
}