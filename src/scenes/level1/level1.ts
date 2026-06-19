import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { getDarkTexture, getLightTexture, getRedTexture } from '../../assets/textures';
import { FILTER_GROUP_GROUND } from '../../collission-groups';
import { SpawnPointEntity } from '../../entities/spawn-point-entity';
import { WallEntity, WallType } from '../../entities/wall-entity';
import { GameLevel } from '../../game-level';
import { GameStorage } from '../../game-storage';
import {
  deserializeColor3,
  deserializeQuaternion,
  deserializeVector3,
  LevelDocument,
  TextureVariant,
  SerializedTrigger,
} from '../../level-document';
import { ShadowGenerator } from '../../shadows';
import { AutomaticCamera } from '../../cameras/automatic-camera';
import { PlayerEntity } from '../../entities/player-entity';
import { EndTrigger } from '../../triggers/end-trigger';
import { StartTrigger } from '../../triggers/start-trigger';
import { Trigger } from '../../triggers/trigger';
import { createBorder } from './border';
import { createLongJumps } from './longjumps';
import { Skybox } from './skybox';
import { createSlide } from './slide';
import { createStage1 } from './stage1';
import { createStage2 } from './stage2';
import { createStage3 } from './stage3';
import { createStage4 } from './stage4';
import { createStage5 } from './stage5';
import { createStage6 } from './stage6';
import { TeleportTrigger } from '../../triggers/teleport-trigger';
import { GameEntity } from '../../entities/game-entity';
import { createBunnyHops } from './bunnyhops';

export class Level1 extends GameLevel {
  private serializedDocument: LevelDocument | null | undefined;

  private getSerializedDocument() {
    if (this.serializedDocument !== undefined) return this.serializedDocument;

    const storedLevel = GameStorage.getLevel();
    this.serializedDocument = storedLevel && storedLevel.name === this.name ? storedLevel : null;
    return this.serializedDocument;
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

  private applyLegacyLongJumpFallback(levelDocument: LevelDocument) {
    const scene = this.scene!;

    const hasTextureVariant = levelDocument.walls.some(
      wall => typeof wall.textureVariant === 'string'
    );

    const longJumpWalls = this.walls.filter(wall => {
      const width = typeof wall.opts.width === 'number' ? wall.opts.width : 0;
      const depth = typeof wall.opts.depth === 'number' ? wall.opts.depth : 0;
      const height = typeof wall.opts.height === 'number' ? wall.opts.height : 0;
      return (
        width === 8 && depth === 4 && height === 0.6 && Math.abs(wall.mesh.position.y - 0.3) < 0.001
      );
    });

    if (!hasTextureVariant) {
      longJumpWalls.forEach(wall => {
        wall.textureVariant = 'light' as TextureVariant;
        const material = wall.mesh.material as BABYLON.StandardMaterial;
        material.diffuseTexture = getLightTexture({ uScale: 1, vScale: 1 }, scene);
      });
    }

    if (levelDocument.texts && levelDocument.texts.length > 0) return;

    const font = scene.metadata?.fonts?.fontMontserratRegular;
    if (!font) return;

    const primarySideWalls = longJumpWalls
      .filter(wall => Math.abs(wall.mesh.position.x - 46) < 0.01)
      .sort((a, b) => a.mesh.position.z - b.mesh.position.z);

    primarySideWalls.forEach((wall, index) => {
      const jumpLength = (9.5 + 0.1 * index) * 10;
      const textMesh = BABYLON.MeshBuilder.CreateText(
        '',
        `${jumpLength}`,
        font,
        { size: 1, depth: 0.3 },
        scene,
        earcut
      ) as BABYLON.Mesh;

      textMesh.position = new BABYLON.Vector3(wall.mesh.position.x + 4, 1.3, wall.mesh.position.z);
      textMesh.rotationQuaternion = new BABYLON.Quaternion(0, -0.7, 0, -0.7);

      const material = new BABYLON.StandardMaterial('jumpLengthTextMaterial', scene);
      material.diffuseColor =
        jumpLength <= 100
          ? new BABYLON.Color3(0.58, 1.0, 0.11)
          : jumpLength <= 110
            ? new BABYLON.Color3(0.87, 0.76, 0.26)
            : new BABYLON.Color3(1, 0.19, 0.19);
      textMesh.material = material;
      textMesh.metadata = {
        levelTextDecoration: {
          text: `${jumpLength}`,
          color: material.diffuseColor,
        },
      };
    });
  }

  protected createSkybox(): void {
    const levelDocument = this.getSerializedDocument();
    if (levelDocument?.environment?.skyboxEnabled === false) {
      this.skybox = null;
      return;
    }
    this.skybox = new Skybox(this.scene!);
  }

  protected createGround() {
    const levelDocument = this.getSerializedDocument();
    const serializedGround = levelDocument?.environment?.ground;

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial');
    groundMaterial.diffuseColor = serializedGround?.color
      ? deserializeColor3(serializedGround.color)
      : new BABYLON.Color3(0.7, 0.7, 0.7);
    groundMaterial.roughness = serializedGround?.roughness ?? 0.7;

    const uScale = serializedGround?.uScale ?? 20;
    const vScale = serializedGround?.vScale ?? 20;
    const textureVariant = serializedGround?.textureVariant ?? 'dark';

    if (textureVariant === 'light') {
      groundMaterial.diffuseTexture = getLightTexture({ uScale, vScale }, this.scene!);
    } else if (textureVariant === 'red') {
      groundMaterial.diffuseTexture = getRedTexture({ uScale, vScale }, this.scene!);
    } else {
      groundMaterial.diffuseTexture = getDarkTexture({ uScale, vScale }, this.scene!);
    }

    this.ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      {
        height: serializedGround?.height ?? 100,
        width: serializedGround?.width ?? 100,
      },
      this.scene!
    );
    this.ground.material = groundMaterial;
    if (serializedGround?.scaling) {
      this.ground.scaling = deserializeVector3(serializedGround.scaling);
    }

    const groundAggregate = new BABYLON.PhysicsAggregate(
      this.ground,
      BABYLON.PhysicsShapeType.BOX,
      { mass: 0, friction: 0.4 },
      this.scene!
    );
    groundAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
  }

  protected createWalls() {
    const scene = this.scene!;
    const levelDocument = this.getSerializedDocument();

    if (levelDocument) {
      this.walls = levelDocument.walls.map(wall => {
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

      if (levelDocument.texts && levelDocument.texts.length > 0) {
        this.createSerializedTexts(levelDocument.texts);
      }

      this.applyLegacyLongJumpFallback(levelDocument);
      return;
    }

    this.walls = [
      ...createStage1(scene, this),
      ...createStage2(scene, this),
      ...createStage3(scene, this),
      ...createStage4(scene, this),
      ...createStage5(scene, this),
      ...createStage6(scene, this),
      ...createLongJumps(scene, this),
      ...createBorder(scene, this),
      ...createSlide(scene, this),
      ...createBunnyHops(scene, this),
    ];

    // last wall red
    (this.walls[this.walls.length - 2].mesh.material as BABYLON.StandardMaterial).diffuseTexture =
      getRedTexture({ uScale: 1, vScale: 1 }, scene);
  }

  protected createSpawnPoints() {
    const scene = this.scene!;
    const levelDocument = this.getSerializedDocument();

    if (levelDocument) {
      this.spawnPoints = levelDocument.spawnPoints.map(spawnPoint => {
        return new SpawnPointEntity(
          spawnPoint.name,
          this,
          scene,
          deserializeVector3(spawnPoint.position)
        );
      });
      return;
    }

    this.spawnPoints = [
      new SpawnPointEntity('spawn-point-1', this, scene, new BABYLON.Vector3(-11.8, 0.4, 1)),
      new SpawnPointEntity('spawn-point-2', this, scene, new BABYLON.Vector3(-11.8, 0.4, 0)),
      new SpawnPointEntity('spawn-point-3', this, scene, new BABYLON.Vector3(-11.8, 0.4, -1)),
      new SpawnPointEntity('spawn-point-4', this, scene, new BABYLON.Vector3(-11.8, 0.4, -2)),
      new SpawnPointEntity('spawn-point-5', this, scene, new BABYLON.Vector3(-11.8, 0.4, -3)),
      new SpawnPointEntity('spawn-point-6', this, scene, new BABYLON.Vector3(-11.8, 0.4, -4)),
    ];
  }

  protected createStartTriggers() {
    const scene = this.scene!;
    const levelDocument = this.getSerializedDocument();

    if (levelDocument) {
      this.startTriggers = levelDocument.startTriggers.map(trigger => {
        return new StartTrigger(scene, {
          level: this,
          position: deserializeVector3(trigger.position),
          scaling: deserializeVector3(trigger.scaling),
          rotationQuaternion: trigger.rotation
            ? deserializeQuaternion(trigger.rotation)
            : undefined,
          isVisible: trigger.isVisible,
          debugType: trigger.debugType,
        });
      });
      return;
    }

    this.startTriggers = [
      new StartTrigger(scene, {
        level: this,
        position: new BABYLON.Vector3(-8, 0, -2),
        scaling: new BABYLON.Vector3(5, 0.1, 7),
      }),
    ];
  }

  protected createEndTriggers() {
    const scene = this.scene!;
    const levelDocument = this.getSerializedDocument();

    if (levelDocument) {
      this.endTriggers = levelDocument.endTriggers.map(trigger => {
        return new EndTrigger(scene, {
          level: this,
          position: deserializeVector3(trigger.position),
          scaling: deserializeVector3(trigger.scaling),
          rotationQuaternion: trigger.rotation
            ? deserializeQuaternion(trigger.rotation)
            : undefined,
          isVisible: trigger.isVisible,
          debugType: trigger.debugType,
        });
      });
      return;
    }

    this.endTriggers = [
      new EndTrigger(scene, {
        level: this,
        position: new BABYLON.Vector3(-10.0, 42.0, 8.0),
        scaling: new BABYLON.Vector3(5, 0.1, 5),
      }),
      // new EndTrigger(scene, {
      //   level: this,
      //   position: new BABYLON.Vector3(-21.40, 0.00, -8.00),
      //   scaling: new BABYLON.Vector3(5, 0.1, 5)
      // }),
    ];
  }

  protected createTeleports() {
    const scene = this.scene!;
    const levelDocument = this.getSerializedDocument();

    if (levelDocument) {
      this.teleports = levelDocument.teleports.map((teleport, index) => {
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

      levelDocument.triggers.forEach(triggerData => {
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

      return;
    }

    const firstPositionZ = -8;
    const gap = 2;

    this.teleports = [
      new TeleportTrigger(
        'teleport-stage-2',
        scene,
        {
          level: this,
          position: new BABYLON.Vector3(-15.9, 0.0, firstPositionZ),
        },
        new BABYLON.Vector3(6.07, 6.0, 1.93)
      ),
      new TeleportTrigger(
        'teleport-stage-3',
        scene,
        {
          level: this,
          position: new BABYLON.Vector3(-15.9, 0.0, firstPositionZ - gap),
        },
        new BABYLON.Vector3(11.6, 12.2, -7.65)
      ),
      new TeleportTrigger(
        'teleport-stage-4',
        scene,
        {
          level: this,
          position: new BABYLON.Vector3(-15.9, 0.0, firstPositionZ - gap * 2),
        },
        new BABYLON.Vector3(4.13, 22.2, -8.09)
      ),
      new TeleportTrigger(
        'teleport-stage-5',
        scene,
        {
          level: this,
          position: new BABYLON.Vector3(-15.9, 0.0, firstPositionZ - gap * 3),
        },
        new BABYLON.Vector3(-5.8, 32.5, -8.7)
      ),
      new TeleportTrigger(
        'teleport-top',
        scene,
        {
          level: this,
          position: new BABYLON.Vector3(-15.9, 0.0, firstPositionZ - gap * 4),
        },
        new BABYLON.Vector3(-12.6, 42.5, 5.7)
      ),
    ];

    this.teleports.forEach(teleport => {
      GameEntity.createLabelTag(scene, teleport.mesh, teleport.name);
    });
  }

  protected createLights() {
    const scene = this.scene!;
    const player = this.player!;

    // Ambient sky fill (no shadows)
    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.intensity = 0.3;
    hemiLight.diffuse = new BABYLON.Color3(0.8, 0.85, 1.0);
    hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.35);

    // Sun (directional light) — casts crisp shadows across the entire map
    const sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-0.6, -1.0, -0.3),
      scene
    );
    sunLight.intensity = 1.5;
    sunLight.shadowEnabled = true;
    sunLight.autoCalcShadowZBounds = true;

    // Shadow generator with reduced blur for visible tree shadows
    const shadowGenerator = new ShadowGenerator(
      sunLight,
      [...this.walls.map(x => x.mesh)],
      [player.mesh!, this.ground!, ...this.walls.map(x => x.mesh)],
      { blurKernel: 8, mapSize: 2048 }
    );

    if (import.meta.env.DEV) {
      const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
      const sunGizmo = new BABYLON.LightGizmo(utilLayer);
      sunGizmo.light = sunLight;
    }

    this.lights = [hemiLight, sunLight];
    this.shadowGenerators = [shadowGenerator];
  }
}
