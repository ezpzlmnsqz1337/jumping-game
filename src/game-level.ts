import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from './entities/player-entity';
import { SpawnPointEntity } from './entities/spawn-point-entity';
import { WallEntity } from './entities/wall-entity';
import { Skybox } from './scenes/level1/skybox';
import { ShadowGenerator } from './shadows';
import { LevelTimer } from './level-timer';
import { Trigger } from './triggers/trigger';
import { EndTrigger } from './triggers/end-trigger';
import { StartTrigger } from './triggers/start-trigger';
import { TeleportTrigger } from './triggers/teleport-trigger';
import gameRoot from './game-root';
import {
  serializeColor3,
  serializeQuaternion,
  serializeVector3,
  type LevelDocument,
} from './level-document';

export class GameLevel {
  name: string;
  skybox: BABYLON.Nullable<Skybox> = null;
  ground: BABYLON.Nullable<BABYLON.Mesh> = null;
  walls: WallEntity[] = [];
  spawnPoints: SpawnPointEntity[] = [];
  triggers: Trigger[] = [];
  startTriggers: StartTrigger[] = [];
  endTriggers: EndTrigger[] = [];
  teleports: TeleportTrigger[] = [];
  lights: BABYLON.Light[] = [];
  shadowGenerators: ShadowGenerator[] = [];
  scene: BABYLON.Nullable<BABYLON.Scene> = null;
  player: BABYLON.Nullable<PlayerEntity> = null;
  timer: BABYLON.Nullable<LevelTimer> = null;

  constructor(name: string) {
    this.name = name;
  }

  create(scene: BABYLON.Scene, player: PlayerEntity) {
    this.scene = scene;
    this.player = player;

    this.timer = new LevelTimer();
    this.triggers = [];
    this.startTriggers = [];
    this.endTriggers = [];
    this.teleports = [];
    this.createSkybox();
    this.createGround();
    this.createWalls();
    this.createSpawnPoints();
    this.createStartTriggers();
    this.createEndTriggers();
    this.createTeleports();
    this.createLights();

    scene.onNewMeshAddedObservable.add(mesh => {
      if (mesh.name === 'player-body') {
        this.shadowGenerators.forEach(x => x.addShadowCaster(mesh as BABYLON.Mesh));
      }
    });

    const spawnPoint = this.getRandomSpawnPoint().mesh;
    if (spawnPoint) {
      player.physics.body.disablePreStep = true;
      player.mesh!.position = spawnPoint.position.clone();
      player.physics.body.setLinearVelocity(BABYLON.Vector3.Zero());
      player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
      player.physics.body.disablePreStep = false;
    }
  }

  protected createSkybox() {
    this.skybox = null;
  }

  protected createGround() {
    this.ground = null;
  }

  protected createWalls() {
    this.walls = [];
  }

  protected createSpawnPoints() {
    this.spawnPoints = [];
  }

  protected createStartTriggers() {
    this.startTriggers = [];
  }

  protected createEndTriggers() {
    this.endTriggers = [];
  }

  protected createTeleports() {
    this.teleports = [];
  }

  protected createLights() {
    this.lights = [];
  }

  resetPlayerProgress(player: PlayerEntity) {
    player.checkpoints = [];
    player.lastCheckpointIndex = 0;
  }

  armRunFromStart(player: PlayerEntity) {
    if (!this.timer) return false;

    this.timer.resetRun();
    this.timer.armRun();
    this.resetPlayerProgress(player);
    gameRoot.demoService.reset();
    return true;
  }

  startRunFromStart(player: PlayerEntity) {
    if (!this.timer?.startRun()) return false;

    gameRoot.demoService.startRecording(player);
    return true;
  }

  finishRun(player: PlayerEntity) {
    if (!this.timer?.finishRun()) return false;

    // Anti-cheat: validate run is legitimate
    const validation = this.timer.isValidRun(player.checkpoints.length);
    if (!validation.valid) {
      console.warn('Run rejected:', validation.reason);
      this.timer.resetRun();
      return false;
    }

    gameRoot.multiplayer?.sendTimeToServer({
      nickname: player.nickname,
      timeStr: this.timer.getTimeAsString(),
      time: this.timer.getTime(),
      checkpoints: player.checkpoints.length,
    });

    this.scene
      ?.sounds?.find(sound => sound.name === 'wicked-sick')
      ?.play();

    const demo = gameRoot.demoService.stopRecording();
    const replay = gameRoot.demoService.createReplayPayload(demo, {
      playerName: player.nickname,
      timeMs: this.timer.getTime(),
      timeStr: this.timer.getTimeAsString(),
      completedAt: new Date().toISOString(),
      mapName: this.name,
      source: 'local',
    });

    if (!replay) return true;

    gameRoot.demoService.saveReplay(replay);
    gameRoot.uiManager?.timeTableUI.updateReplayMetadata(replay.metadata);
    if (this.scene) {
      gameRoot.demoService.playReplay(replay, this.scene);
    }
    return true;
  }

  resetRunForTeleport(player: PlayerEntity, destination: BABYLON.Vector3) {
    if (!player.mesh) return false;

    this.resetPlayerProgress(player);
    this.timer?.resetRun();
    gameRoot.demoService.reset();

    player.physics.body.disablePreStep = true;
    player.mesh.position = destination.clone();
    player.physics.body.setLinearVelocity(BABYLON.Vector3.Zero());
    player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
    player.physics.body.disablePreStep = false;
    return true;
  }

  getRandomSpawnPoint() {
    const index = Math.round(Math.random() * (this.spawnPoints.length - 1));
    return this.spawnPoints[index];
  }

  private serializeTextDecorations() {
    if (!this.scene) return [];

    return this.scene.meshes
      .filter(mesh => {
        const metadata = mesh.metadata as { levelTextDecoration?: { text?: string } } | undefined;
        return Boolean(metadata?.levelTextDecoration?.text);
      })
      .map(mesh => {
        const metadata = mesh.metadata as {
          levelTextDecoration?: { text: string; color?: BABYLON.Color3 };
        };
        const textData = metadata.levelTextDecoration!;

        return {
          text: textData.text,
          position: serializeVector3(mesh.position),
          rotation: mesh.rotationQuaternion
            ? serializeQuaternion(mesh.rotationQuaternion)
            : undefined,
          color: textData.color ? serializeColor3(textData.color) : undefined,
        };
      });
  }

  private serializeEnvironment() {
    const skyboxMesh = this.scene?.getMeshByName('skyBox');
    const groundMaterial = this.ground?.material as BABYLON.StandardMaterial | null;
    const groundTexture = groundMaterial?.diffuseTexture as BABYLON.Texture | null;
    const groundTextureName = groundTexture?.name || '';

    let textureVariant: 'dark' | 'light' | 'red' | undefined;
    if (groundTextureName.includes('/light/')) textureVariant = 'light';
    if (groundTextureName.includes('/red/')) textureVariant = 'red';
    if (groundTextureName.includes('/dark/')) textureVariant = 'dark';

    return {
      skyboxEnabled: Boolean(skyboxMesh),
      ground: this.ground
        ? {
            width: this.ground.getBoundingInfo().boundingBox.extendSize.x * 2,
            height: this.ground.getBoundingInfo().boundingBox.extendSize.z * 2,
            scaling: serializeVector3(this.ground.scaling),
            textureVariant,
            uScale: groundTexture?.uScale,
            vScale: groundTexture?.vScale,
            roughness: groundMaterial?.roughness,
            color: groundMaterial?.diffuseColor
              ? serializeColor3(groundMaterial.diffuseColor)
              : undefined,
          }
        : undefined,
    };
  }

  serialize(): LevelDocument {
    const startTriggerSet = new Set(this.startTriggers);
    const endTriggerSet = new Set(this.endTriggers);
    const teleportSet = new Set(this.teleports);

    return {
      version: 1,
      name: this.name,
      walls: this.walls.map(wall => wall.serialize()),
      spawnPoints: this.spawnPoints.map(spawnPoint => spawnPoint.serialize()),
      startTriggers: this.startTriggers.map(trigger => trigger.serialize()),
      endTriggers: this.endTriggers.map(trigger => trigger.serialize()),
      teleports: this.teleports.map(teleport => teleport.serialize()),
      triggers: this.triggers
        .filter(
          trigger =>
            !startTriggerSet.has(trigger as StartTrigger) &&
            !endTriggerSet.has(trigger as EndTrigger) &&
            !teleportSet.has(trigger as TeleportTrigger)
        )
        .map(trigger => trigger.serialize()),
      texts: this.serializeTextDecorations(),
      environment: this.serializeEnvironment(),
    };
  }
}
