import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { PlayerEntity } from './entities/player-entity';
import { SpawnPointEntity } from './entities/spawn-point-entity';
import { WallEntity, WallType } from './entities/wall-entity';
import { Skybox } from './scenes/level1/skybox';
import { ShadowGenerator } from './shadows';
import { LevelTimer } from './level-timer';
import { Trigger } from './triggers/trigger';
import { EndTrigger } from './triggers/end-trigger';
import { StartTrigger } from './triggers/start-trigger';
import { TeleportTrigger } from './triggers/teleport-trigger';
import { GameEntity } from './entities/game-entity';
import { AutomaticCamera } from './cameras/automatic-camera';
import gameRoot from './game-root';
import {
  deserializeColor3,
  deserializeQuaternion,
  deserializeVector3,
  serializeColor3,
  serializeQuaternion,
  serializeVector3,
  type LevelDocument,
  type SerializedTrigger,
  type TextureVariant,
} from './level-document';
import { getDarkTexture, getLightTexture, getRedTexture } from './assets/textures';
import { FILTER_GROUP_GROUND } from './collission-groups';

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
    gameRoot.uiManager?.timerUI.showRunStatus('ready');
    return true;
  }

  startRunFromStart(player: PlayerEntity) {
    if (!this.timer?.startRun()) return false;

    gameRoot.demoService.startRecording(player);
    gameRoot.uiManager?.timerUI.showRunStatus('running');
    return true;
  }

  finishRun(player: PlayerEntity) {
    if (!this.timer?.finishRun()) return false;

    // Anti-cheat: validate run is legitimate
    const validation = this.timer.isValidRun(player.checkpoints.length);
    if (!validation.valid) {
      console.warn('Run rejected:', validation.reason);
      this.timer.resetRun();
      gameRoot.uiManager?.timerUI.showRunStatus('reset', validation.reason);
      return false;
    }

    gameRoot.multiplayer?.sendTimeToServer({
      nickname: player.nickname,
      timeStr: this.timer.getTimeAsString(),
      time: this.timer.getTime(),
      checkpoints: player.checkpoints.length,
    });

    this.scene?.sounds?.find(sound => sound.name === 'wicked-sick')?.play();

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

    gameRoot.demoService.saveReplay(replay, 'local-best');
    gameRoot.uiManager?.timeTableUI.updateReplayMetadata(replay.metadata);
    gameRoot.uiManager?.timerUI.showRunStatus('finished', replay.metadata.timeStr);
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
    gameRoot.uiManager?.timerUI.showRunStatus('reset', 'teleport');

    if (gameRoot.multiplayer) {
      gameRoot.multiplayer.pendingTeleportFlag = true;
    }

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

export function createTemplateLevelDocument(name: string): LevelDocument {
  return {
    version: 1,
    name,
    walls: [
      {
        wallType: 'ground',
        opts: { width: 40, height: 1, depth: 40, textureVariant: 'light' as TextureVariant },
        textureVariant: 'light',
        position: { x: 0, y: -0.5, z: 0 },
      },
    ],
    spawnPoints: [{ name: 'spawn-1', position: { x: 0, y: 0.5, z: 0 } }],
    startTriggers: [
      {
        triggerType: 'start',
        debugType: 'trigger',
        position: { x: -5, y: 0, z: 0 },
        scaling: { x: 3, y: 0.1, z: 3 },
        isVisible: true,
      },
    ],
    endTriggers: [
      {
        triggerType: 'end',
        debugType: 'trigger',
        position: { x: 5, y: 0, z: 0 },
        scaling: { x: 3, y: 0.1, z: 3 },
        isVisible: true,
      },
    ],
    teleports: [],
    triggers: [],
    environment: {
      skyboxEnabled: true,
      ground: {
        width: 40,
        height: 40,
        textureVariant: 'light',
        uScale: 20,
        vScale: 20,
      },
    },
  };
}

export class DocumentLevel extends GameLevel {
  private doc: LevelDocument;

  constructor(doc: LevelDocument) {
    super(doc.name);
    this.doc = doc;
  }

  protected createSkybox(): void {
    if (this.doc.environment?.skyboxEnabled === false) {
      this.skybox = null;
      return;
    }
    this.skybox = new Skybox(this.scene!);
  }

  protected createGround() {
    const scene = this.scene!;
    const serializedGround = this.doc.environment?.ground;

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    const uScale = serializedGround?.uScale ?? 20;
    const vScale = serializedGround?.vScale ?? 20;
    const textureVariant = serializedGround?.textureVariant ?? 'dark';

    if (textureVariant === 'light') {
      groundMaterial.diffuseTexture = getLightTexture({ uScale, vScale }, scene);
    } else if (textureVariant === 'red') {
      groundMaterial.diffuseTexture = getRedTexture({ uScale, vScale }, scene);
    } else {
      groundMaterial.diffuseTexture = getDarkTexture({ uScale, vScale }, scene);
    }
    groundMaterial.roughness = serializedGround?.roughness ?? 0.7;

    this.ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      {
        height: serializedGround?.height ?? 40,
        width: serializedGround?.width ?? 40,
      },
      scene
    );
    this.ground.material = groundMaterial;
    if (serializedGround?.scaling) {
      this.ground.scaling = deserializeVector3(serializedGround.scaling);
    }

    const groundAggregate = new BABYLON.PhysicsAggregate(
      this.ground,
      BABYLON.PhysicsShapeType.BOX,
      { mass: 0, friction: 0.4 },
      scene
    );
    groundAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
  }

  protected createWalls() {
    const scene = this.scene!;
    this.walls = this.doc.walls.map(wall => {
      const opts =
        wall.textureVariant && typeof wall.textureVariant === 'string'
          ? { ...wall.opts, textureVariant: wall.textureVariant }
          : wall.opts;

      const wallEntity = new WallEntity(
        scene,
        this,
        wall.wallType as WallType,
        opts,
        deserializeVector3(wall.position),
        wall.rotation ? deserializeQuaternion(wall.rotation) : undefined
      );

      if (wall.scaling) {
        wallEntity.mesh.scaling = deserializeVector3(wall.scaling);
      }
      return wallEntity;
    });

    if (this.doc.texts && this.doc.texts.length > 0) {
      this.createSerializedTexts(this.doc.texts);
    }
  }

  protected createSpawnPoints() {
    this.spawnPoints = this.doc.spawnPoints.map(
      spawnPoint =>
        new SpawnPointEntity(
          spawnPoint.name,
          this,
          this.scene!,
          deserializeVector3(spawnPoint.position)
        )
    );
  }

  protected createStartTriggers() {
    this.startTriggers = this.doc.startTriggers.map(
      trigger =>
        new StartTrigger(this.scene!, {
          level: this,
          position: deserializeVector3(trigger.position),
          scaling: deserializeVector3(trigger.scaling),
          rotationQuaternion: trigger.rotation
            ? deserializeQuaternion(trigger.rotation)
            : undefined,
          isVisible: trigger.isVisible,
          debugType: trigger.debugType,
        })
    );
  }

  protected createEndTriggers() {
    this.endTriggers = this.doc.endTriggers.map(
      trigger =>
        new EndTrigger(this.scene!, {
          level: this,
          position: deserializeVector3(trigger.position),
          scaling: deserializeVector3(trigger.scaling),
          rotationQuaternion: trigger.rotation
            ? deserializeQuaternion(trigger.rotation)
            : undefined,
          isVisible: trigger.isVisible,
          debugType: trigger.debugType,
        })
    );
  }

  protected createTeleports() {
    const scene = this.scene!;
    this.teleports = this.doc.teleports.map((teleport, index) => {
      const teleportTrigger = new TeleportTrigger(
        `teleport-${index + 1}`,
        scene,
        {
          level: this,
          position: deserializeVector3(teleport.position),
          scaling: deserializeVector3(teleport.scaling),
          rotationQuaternion: teleport.rotation
            ? deserializeQuaternion(teleport.rotation)
            : undefined,
          isVisible: teleport.isVisible,
          debugType: teleport.debugType,
        },
        deserializeVector3(teleport.destination)
      );
      GameEntity.createLabelTag(scene, teleportTrigger.mesh, teleportTrigger.name);
      return teleportTrigger;
    });

    this.doc.triggers.forEach(triggerData => {
      const trigger = new Trigger(scene, {
        level: this,
        position: deserializeVector3(triggerData.position),
        scaling: deserializeVector3(triggerData.scaling),
        width: triggerData.boxSize?.x,
        height: triggerData.boxSize?.y,
        depth: triggerData.boxSize?.z,
        rotationQuaternion: triggerData.rotation
          ? deserializeQuaternion(triggerData.rotation)
          : undefined,
        isVisible: triggerData.isVisible,
        debugType: triggerData.debugType,
        triggerType: triggerData.triggerType,
        cameraTarget: triggerData.cameraTarget,
      });
      this.bindSerializedTriggerBehavior(trigger, triggerData);
    });
  }

  protected createLights() {
    const scene = this.scene!;
    const hemiLight = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    this.lights = [hemiLight];
  }

  private createSerializedTexts(texts: NonNullable<LevelDocument['texts']>) {
    const scene = this.scene!;
    const font = scene.metadata?.fonts?.fontMontserratRegular;
    if (!font) return;

    texts.forEach(textData => {
      const textMesh = BABYLON.MeshBuilder.CreateText(
        '',
        textData.text,
        font,
        { size: 1, depth: 0.3 },
        scene,
        earcut
      ) as BABYLON.Mesh;

      textMesh.position = deserializeVector3(textData.position);
      if (textData.rotation) {
        textMesh.rotationQuaternion = deserializeQuaternion(textData.rotation);
      }

      const material = new BABYLON.StandardMaterial('serializedTextMaterial', scene);
      material.diffuseColor = textData.color
        ? deserializeColor3(textData.color)
        : new BABYLON.Color3(1, 1, 1);
      textMesh.material = material;
      textMesh.metadata = {
        levelTextDecoration: {
          text: textData.text,
          color: material.diffuseColor,
        },
      };
    });
  }

  private bindSerializedTriggerBehavior(trigger: Trigger, triggerData: SerializedTrigger) {
    if (triggerData.triggerType === 'camera' && triggerData.cameraTarget) {
      trigger.onEnter = (_mesh: BABYLON.Mesh, player: PlayerEntity) => {
        const camera = player.mesh!.getScene().activeCamera as unknown as AutomaticCamera;
        if (!camera) return;
        const { alpha, beta, radius, speed } = triggerData.cameraTarget!;
        camera.setMoveToTarget(alpha, beta, radius, speed ?? 50);
      };
      return;
    }

    if (triggerData.triggerType === 'jump') {
      trigger.onEnter = (_mesh: BABYLON.Mesh, player: PlayerEntity) => {
        setTimeout(() => {
          const velocity = player.physics.body.getLinearVelocity();
          player.physics.body.setLinearVelocity(
            velocity.multiply(new BABYLON.Vector3(0.5, 0, 0.5))
          );
          player.jump();
        });
      };
    }
  }
}
