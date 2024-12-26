import * as BABYLON from '@babylonjs/core';
import { createPlayer } from './player.ts';
import { createPhysics } from './physics.ts';
import { createControls } from './controls.ts';
import { createGround } from './ground.ts';

export const createScene = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);
  scene.createDefaultCamera(true, false, true);
  const controls = createControls(scene);
  const ground = createGround(scene);
  const player = createPlayer(scene, { startPosition: new BABYLON.Vector3(0, 1, 0) });

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-2, -3, 0), scene);
  const lightGizmo = new BABYLON.LightGizmo(utilLayer);
  lightGizmo.light = light

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
  shadowGenerator.addShadowCaster(player);
  ground.receiveShadows = true;
  shadowGenerator.useBlurCloseExponentialShadowMap = true;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = 64;

  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 10;
  scene.fogEnd = 16;

  return scene;
}