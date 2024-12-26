import * as BABYLON from '@babylonjs/core';
import { createPlayer } from './player.ts';
import { createPhysics } from './physics.ts';

export const createScene = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  scene.createDefaultCamera(true, false, true);
  await createPhysics(scene);
  const player = createPlayer(scene, {startPosition: new BABYLON.Vector3(0,1,0)});

  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    height: 20,
    width: 20
  });

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
  
  const light = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-2,-3,0), scene);
  const lightGizmo = new BABYLON.LightGizmo(utilLayer);
  lightGizmo.light = light

  const shadowGenerator = new BABYLON.ShadowGenerator(1024,  light);
  shadowGenerator.addShadowCaster(player);
  ground.receiveShadows = true;
  shadowGenerator.useBlurCloseExponentialShadowMap = true;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = 64;

  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 10;
  scene.fogEnd = 16;

 const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

  return scene;
}