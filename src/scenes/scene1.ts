import * as BABYLON from '@babylonjs/core';
import { createSounds } from '../assets/sounds.ts';
import { GameControls } from '../controls.ts';
import { PlayerEntity } from '../entities/player-entity.ts';
import gameRoot from '../game-root.ts';
import { createOptimizations } from '../optimizations.ts';
import { createPhysics } from '../physics.ts';
import { UIManager } from '../ui/ui-manager.ts';
import { createBall } from './level1/football.ts';
import { Level1 } from './level1/level1.ts';
import { DocumentLevel } from '../game-level.ts';
import { MultiplayerSession } from '../multiplayer-session.ts';
import { GameLevel } from '../game-level.ts';
import { GameStorage } from '../game-storage.ts';
import { ArcRotateCameraOptions, MyArcRotateCamera } from '../cameras/arc-rotate-camera.ts';
import { FollowCameraOptions, MyFollowCamera } from '../cameras/follow-camera.ts';
import { hardwareScalingCapForTier } from '../quality.ts';

const ENABLE_EDITOR = import.meta.env.DEV;
const ENABLE_MULTIPLAYER = !import.meta.env.DEV;

const arcRotateCameraOptions: ArcRotateCameraOptions = {
  position: new BABYLON.Vector3(0, 0, 0),
  alpha: 1,
  beta: 1,
  radius: 6,
};

const followCameraOptions: FollowCameraOptions = {
  position: new BABYLON.Vector3(0, 0, 0),
  radius: 4.5,
};

function resolveLevel(): GameLevel {
  const storedLevelName = localStorage.getItem('level-manager-selected-level');
  if (storedLevelName) {
    const doc = GameStorage.getLevel(storedLevelName);
    if (doc) {
      return new DocumentLevel(doc);
    }
  }
  // Check for legacy imported level document
  const legacyDoc = GameStorage.getLevel();
  if (legacyDoc) {
    return new DocumentLevel(legacyDoc);
  }
  return new Level1('level1');
}

export const createScene1 = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const fontMontserratRegular = await (await fetch('fonts/Montserrat_Regular.json')).json();
  scene.metadata = { fonts: { fontMontserratRegular } };

  scene.sounds = createSounds(scene);

  const arcRotateCamera = new MyArcRotateCamera('arcRotateCamera', arcRotateCameraOptions, scene);
  const followCamera = new MyFollowCamera('followCamera', followCameraOptions, scene);

  gameRoot.level = resolveLevel();
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

  createOptimizations(scene, hardwareScalingCapForTier(gameRoot.qualityTier));

  scene.onBeforeRenderObservable.add(() => {
    if (scene.activeCamera?.name === 'followCamera') return;
    arcRotateCamera.moveToTarget();
  });

  // football
  const mpObjects = [
    createBall(scene, new BABYLON.Vector3(-12.6, 43.5, 9.7)),
    createBall(scene, new BABYLON.Vector3(-12.6, 43.5, 5.7)),
  ];

  // fog
  // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  // scene.fogStart = 20;
  // scene.fogEnd = 40;

  // editor
  let gizmoManager!: BABYLON.GizmoManager;

  if (ENABLE_EDITOR) {
    gizmoManager = new BABYLON.GizmoManager(scene);
    gameRoot.gizmoManager = gizmoManager;
  }

  // UI
  gameRoot.uiManager = new UIManager(scene, gameRoot.player, gizmoManager);
  await gameRoot.uiManager.bindUI();

  // multiplayer
  if (ENABLE_MULTIPLAYER) {
    // if not running in dev mode
    gameRoot.multiplayer = new MultiplayerSession(scene, gameRoot.player, mpObjects);
  }

  // demo
  const replay = await gameRoot.demoService.loadOrCreateStoredReplay(
    'assets/demo/map-record.json',
    gameRoot.level.name
  );
  if (replay) {
    gameRoot.uiManager?.timeTableUI.updateReplayMetadata(replay.metadata);
    setTimeout(() => {
      void gameRoot.demoService.playReplay(replay, scene);
    }, 1000);
  }

  return scene;
};
