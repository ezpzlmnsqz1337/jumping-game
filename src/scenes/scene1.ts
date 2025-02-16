import * as BABYLON from '@babylonjs/core';
import { createSounds } from '../assets/sounds.ts';
import { ArcRotateCameraOptions, MyArcRotateCamera } from '../cameras/arc-rotate-camera.ts';
import { FollowCameraOptions, MyFollowCamera } from '../cameras/follow-camera.ts';
import { GameControls } from '../controls.ts';
import { PlayerEntity } from '../entities/player-entity.ts';
import { GameLevel } from '../game-level.ts';
import gameRoot from '../game-root.ts';
import { MultiplayerSession } from '../multiplayer-session.ts';
import { createOptimizations } from '../optimizations.ts';
import { createPhysics } from '../physics.ts';
import { UIManager } from '../ui/ui-manager.ts';
import { Level1 } from './level1/level1.ts';
import { Editor } from '../editor.ts';

const ENABLE_EDITOR = false || import.meta.env.DEV;
const ENABLE_MULTIPLAYER = false || !import.meta.env.DEV;

const arcRotateCameraOptions: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(0, 0, 0),
  alpha: 1,
  beta: 1,
  radius: 6
}

const followCameraOptions: FollowCameraOptions = {
  position: new BABYLON.Vector3(0, 0, 0),
  radius: 2
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

  const arcRotateCamera = new MyArcRotateCamera('arcRotateCamera', arcRotateCameraOptions, scene);
  const followCamera = new MyFollowCamera('followCamera', followCameraOptions, scene);
  
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
  
  arcRotateCamera.lockedTarget = gameRoot.player.mesh;
  followCamera.lockedTarget = gameRoot.player.mesh;
  
  scene.activeCamera = arcRotateCamera;  

  const optimizations = createOptimizations(scene);

  scene.onBeforeRenderObservable.add(() => {
    if (scene.activeCamera?.name === 'followCamera') return;
    arcRotateCamera.moveToTarget();
  });

  // fog
  // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  // scene.fogStart = 20;
  // scene.fogEnd = 40;

  let gizmoManager!: BABYLON.GizmoManager;

  // editor
  if (ENABLE_EDITOR) {
    gizmoManager = new BABYLON.GizmoManager(scene);
    gameRoot.editor = new Editor(scene, gizmoManager, {});
  }

  // UI
  gameRoot.uiManager = new UIManager(scene, gameRoot.player, gizmoManager);
  await gameRoot.uiManager.bindUI();

  // multiplayer
  if (ENABLE_MULTIPLAYER) { // if not running in dev mode
    gameRoot.multiplayer = new MultiplayerSession(scene, gameRoot.player, []);
  }

  // demo
  if (!localStorage.getItem('demo')) {
    const demo = await fetch('assets/demo/map-record.json');
    const demoJson = await demo.json();
    localStorage.setItem('demo', JSON.stringify(demoJson));
  }
  const lastDemo = localStorage.getItem('demo');
  if (lastDemo) {
    setTimeout(() => gameRoot.demoService.playDemo(JSON.parse(lastDemo)), 1000);
  }

  return scene;
}