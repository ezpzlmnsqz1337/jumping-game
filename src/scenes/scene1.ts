import * as BABYLON from '@babylonjs/core';
import { createSounds } from '../assets/sounds.ts';
import { CameraOptions, createCamera } from '../camera.ts';
import { createControls } from '../controls.ts';
import { createGround } from '../entities/ground.ts';
import { createPlayer, PlayerEntity } from '../entities/player.ts';
import { createSpawnPoint, getRandomSpawnPoint } from '../entities/spawn-point.ts';
import { createTimer } from '../entities/timer.ts';
import { createMultiplayer } from '../multiplayer.ts';
import { createPhysics } from '../physics.ts';
import { createShadowGenerator } from '../shadows.ts';
import { getGameSettings } from '../storage.ts';
import { createEndTrigger } from '../triggers/end.ts';
import { createStartTrigger } from '../triggers/start.ts';
import { bindUI } from '../ui/ui.ts';
import { createBorder } from './level1/border.ts';
import { createLongJumps } from './level1/longjumps.ts';
import { createStage1 } from './level1/stage1.ts';
import { createStage2 } from './level1/stage2.ts';
import { createStage3 } from './level1/stage3.ts';
import { createStage4 } from './level1/stage4.ts';
import { createStage5 } from './level1/stage5.ts';
import { createStage6 } from './level1/stage6.ts';
import { createSkybox } from './level1/skybox.ts';

const ENABLE_EDITOR = true && import.meta.env.DEV;

const cameraPosition: CameraOptions = {
  position: new BABYLON.Vector3(13.29, 20.68, 26.17),
  alpha: 7.3822,
  beta: 1.3079,
  radius: 48.54
}

export const createScene1 = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const fontMontserratRegular = await (await fetch('fonts/Montserrat_Regular.json')).json();
  scene.metadata = { fonts: { fontMontserratRegular }};

  scene.sounds = createSounds(scene)

  const camera = createCamera(scene, cameraPosition); // stage1Camera1);
  const gameSettings = getGameSettings();
  console.log(gameSettings);

  const controls = createControls(scene);
  const ground = createGround(scene);
  const skybox = createSkybox(scene);
  const spawnPoints = [
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, 1)),
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, 0)),
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, -1)),
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, -2)),
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, -3)),
    createSpawnPoint(scene, new BABYLON.Vector3(-11.80, 0.05, -4)),
  ]
  scene.metadata.spawnPoints = spawnPoints;

  const startPosition = getRandomSpawnPoint(spawnPoints).mesh.position.clone();
  startPosition.y += 1;
  const player = await createPlayer(scene, {
    startPosition: new BABYLON.Vector3(12.50, 12.60, -11.70),
    nickname: gameSettings.nickname,
    color: gameSettings.color
  });

  controls.player = player;

  const walls = createWalls(scene, player);
  const timer = createTimer();
  createStartTrigger(scene, { player, timer, position: new BABYLON.Vector3(-8, 0, -2), scaling: new BABYLON.Vector3(5, 0.1, 7) });
  createEndTrigger(scene, { player, timer, position: new BABYLON.Vector3(-10.00, 42.00, 8.00), scaling: new BABYLON.Vector3(5, 0.1, 5) });
  // testing end trigger
  createEndTrigger(scene, { player, timer, position: new BABYLON.Vector3(-14, 0, -8), scaling: new BABYLON.Vector3(5, 0.1, 5) });

  // camera.lockedTarget = player.mesh;

  const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light1 = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(-6, 6, 0), scene);
  light1.intensity = 0.4;
  light1.shadowEnabled = true;
  light1.shadowMinZ = 0.1;
  light1.shadowMaxZ = 100;
  const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo1.light = light1;


  const cg = createShadowGenerator(scene, light1, [...walls], [player.mesh, ground, ...walls]);

  scene.onNewMeshAddedObservable.add(mesh => {
    if (mesh.name === 'player-body') cg.addShadowCaster(mesh);
  });

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
  if (!import.meta.env.DEV) { // if not running in dev mode
    createMultiplayer(scene, player);
  }

  // UI
  bindUI(scene, player, gizmoManager);

  return scene;
}

export const createWalls = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls: BABYLON.Mesh[] = [
    ...createStage1(scene, player),
    ...createStage2(scene, player),
    ...createStage3(scene, player),
    ...createStage4(scene, player),
    ...createStage5(scene, player),
    ...createStage6(scene, player),
    ...createLongJumps(scene),
    ...createBorder(scene)
  ];

  // last wall
  // (walls[walls.length - 1].material as BABYLON.StandardMaterial).diffuseTexture = getRedTexture({ uScale: 1, vScale: 1 }, scene);

  return walls;
};