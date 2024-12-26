import * as BABYLON from '@babylonjs/core';
import { createPlayer } from './player.ts';
import { createPhysics } from './physics.ts';
import { createControls } from './controls.ts';
import { createGround } from './ground.ts';
import { createArcRotateCamera, createFollowCamera } from './camera.ts';
import { createShadowGenerator } from './shadows.ts';

export const createScene = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const followCamera = createArcRotateCamera(scene);

  const controls = createControls(scene);
  const ground = createGround(scene);
  const player = createPlayer(scene, { startPosition: new BABYLON.Vector3(0, 1, 0) });
  controls.player = player;
  
  followCamera.lockedTarget = player.mesh;

  const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light1 = new BABYLON.DirectionalLight('directionalLight1', new BABYLON.Vector3(-6, -10, 0), scene);
  light1.intensity = 0.3;
  const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo1.light = light1;

  createShadowGenerator(scene, light1, [player.mesh], [ground]);

  // fog
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 20;
  scene.fogEnd = 40;

  return scene;
}