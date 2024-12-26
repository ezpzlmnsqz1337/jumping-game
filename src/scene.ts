import * as BABYLON from '@babylonjs/core';
import { createPlayer } from './player.ts';
import { createPhysics } from './physics.ts';
import { createControls } from './controls.ts';
import { createGround } from './ground.ts';
import { createFollowCamera } from './camera.ts';
import { createShadowGenerator } from './shadows.ts';

export const createScene = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const followCamera = createFollowCamera(scene);

  const controls = createControls(scene);
  const ground = createGround(scene);
  const player = createPlayer(scene, { startPosition: new BABYLON.Vector3(0, 4, 0) });
  
  followCamera.lockedTarget = player.mesh;

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light1 = new BABYLON.DirectionalLight('directionalLight1', new BABYLON.Vector3(-2, -3, 0), scene);
  light1.intensity = 0.7;
  const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo1.light = light1;
  
  const light2 = new BABYLON.DirectionalLight('directionalLight2', new BABYLON.Vector3(2, -3, 0), scene);
  light2.intensity = 0.6;
  const lightGizmo2 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo2.light = light2;

  createShadowGenerator(scene, light1, [player.mesh], [ground]);

  // fog
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 20;
  scene.fogEnd = 40;

  return scene;
}