import * as BABYLON from '@babylonjs/core';
import { createPlayer } from '../entities/player.ts';
import { createPhysics } from '../physics.ts';
import { createControls } from '../controls.ts';
import { createGround } from '../entities/ground.ts';
import { createArcRotateCamera, createFollowCamera } from '../camera.ts';
import { createShadowGenerator } from '../shadows.ts';
import { bindUI } from '../ui.ts';
import { createWalls } from '../entities/walls.ts';
import { createMultiplayer } from '../multiplayer.ts';
import { createStartTrigger } from '../triggers/start.ts';
import { createTimer } from '../timer.ts';
import { createEndTrigger } from '../triggers/end.ts';

export const createScene1 = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  // const followCamera = createFollowCamera(scene);
  const followCamera = createArcRotateCamera(scene);

  const controls = createControls(scene);
  const ground = createGround(scene);
  const player = createPlayer(scene, { startPosition: new BABYLON.Vector3(7.5, 19.1, -7.6) });
  controls.player = player;

  const walls = createWalls(scene);
  const timer = createTimer();
  createStartTrigger(scene, {player, timer, position: new BABYLON.Vector3(-8, 0, -2), scaling: new BABYLON.Vector3(5, 0.5, 7) });
  createEndTrigger(scene, {player, timer, position: new BABYLON.Vector3(0, 22, -12), scaling: new BABYLON.Vector3(5, 0.5, 5) });

  followCamera.lockedTarget = player.mesh;

  const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light1 = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(-6, 6, 0), scene);
  light1.intensity = 0.4;
  light1.shadowEnabled = true;
  light1.shadowMinZ = 0.1;
  light1.shadowMaxZ = 100;
  const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo1.light = light1;

  createShadowGenerator(scene, light1, [player.mesh, ...walls], [player.mesh, ground, ...walls]);

  // fog
  // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  // scene.fogStart = 20;
  // scene.fogEnd = 40;

  // UI
  bindUI(scene, player, timer);

  // multiplayer
  if (!import.meta.env.DEV) { // if not running in dev mode
    createMultiplayer(scene, player);
  }

  return scene;
}