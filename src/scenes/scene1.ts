import * as BABYLON from '@babylonjs/core';
import { createSounds } from '../assets/sounds.ts';
import { CameraOptions, createCamera, createFollowCamera } from '../camera.ts';
import { GameControls } from '../controls.ts';
import { PlayerEntity } from '../entities/player.ts';
import gameRoot from '../game-root.ts';
import { createOptimizations } from '../optimizations.ts';
import { createPhysics } from '../physics.ts';
import { UIManager } from '../ui/ui-manager.ts';
import { createBall } from './level1/football.ts';
import { Level1 } from './level1/level1.ts';
import { MultiplayerSession } from '../multiplayer-session.ts';
import { GameLevel } from '../game-level.ts';

const ENABLE_EDITOR = false || import.meta.env.DEV;
const ENABLE_MULTIPLAYER = false || !import.meta.env.DEV;

const cameraPosition: CameraOptions = {
  position: new BABYLON.Vector3(0, 0, 0),
  alpha: 1,
  beta: 1,
  radius: 6
}

const levels: GameLevel[] = [
  new Level1('level1'),
];

export const createScene1 = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const fontMontserratRegular = await (await fetch('fonts/Montserrat_Regular.json')).json();
  scene.metadata = { fonts: { fontMontserratRegular }};

  scene.sounds = createSounds(scene)

  const camera = createCamera(scene, cameraPosition); // stage1Camera1);
  const followCamera = createFollowCamera(scene, cameraPosition);
  
  gameRoot.level = levels[0];
  gameRoot.player = new PlayerEntity(
    gameRoot.gameSettings.nickname,
    gameRoot.level,
    scene,
    gameRoot.gameSettings.color
  ); 

  // Controls
  gameRoot.controls = new GameControls();
  gameRoot.controls.bindControls(scene, gameRoot.player); 

  // Create level
  gameRoot.level.create(scene, gameRoot.player);
  
  camera.lockedTarget = gameRoot.player.mesh;
  followCamera.lockedTarget = gameRoot.player.mesh;
  
  scene.activeCamera = camera;  

  const optimizations = createOptimizations(scene);

  scene.onBeforeRenderObservable.add(() => {
    if (scene.activeCamera?.name === 'followCamera') return;
    camera.moveToTarget();
  });

  // football
  const mpObjects = [
    createBall(scene, new BABYLON.Vector3(-12.60, 43.50, 9.7)),
    createBall(scene, new BABYLON.Vector3(-12.60, 43.50, 5.7))
  ];

  // fog
  // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  // scene.fogStart = 20;
  // scene.fogEnd = 40;

  // editor
  let gizmoManager!: BABYLON.GizmoManager;

  if (ENABLE_EDITOR) {
    gizmoManager = new BABYLON.GizmoManager(scene);
  }

  // multiplayer
  if (ENABLE_MULTIPLAYER) { // if not running in dev mode
    gameRoot.multiplayer = new MultiplayerSession(scene, gameRoot.player, mpObjects);
  }

  // UI
  gameRoot.uiManager = new UIManager(scene, gameRoot.player, gizmoManager);
  gameRoot.uiManager.bindUI();

  return scene;
}