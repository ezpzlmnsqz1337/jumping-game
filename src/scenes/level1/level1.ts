import * as BABYLON from '@babylonjs/core';
import { getDarkTexture, getRedTexture } from '../../assets/textures';
import { FILTER_GROUP_GROUND } from '../../collission-groups';
import { SpawnPointEntity } from '../../entities/spawn-point-entity';
import { GameLevel } from '../../game-level';
import { ShadowGenerator } from '../../shadows';
import { EndTrigger } from '../../triggers/end-trigger';
import { StartTrigger } from '../../triggers/start-trigger';
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

  protected createSkybox(): void {
    this.skybox = new Skybox(this.scene!);
  }

  protected createGround() {
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial');
    groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    groundMaterial.roughness = 0.7;

    groundMaterial.diffuseTexture = getDarkTexture({ uScale: 20, vScale: 20 }, this.scene!);

    this.ground = BABYLON.MeshBuilder.CreateGround('ground', {
      height: 100,
      width: 100
    }, this.scene!);
    this.ground.material = groundMaterial;

    const groundAggregate = new BABYLON.PhysicsAggregate(this.ground,
      BABYLON.PhysicsShapeType.BOX,
      { mass: 0, friction: 0.4 },
      this.scene!
    );
    groundAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
  }

  protected createWalls() {
    const scene = this.scene!;
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
    (this.walls[this.walls.length - 2].mesh.material as BABYLON.StandardMaterial).diffuseTexture = getRedTexture({ uScale: 1, vScale: 1 }, scene);
  };

  protected createSpawnPoints() {
    const scene = this.scene!;

    this.spawnPoints = [
      new SpawnPointEntity('spawn-point-1', this, scene, new BABYLON.Vector3(-11.80, 0.4, 1)),
      new SpawnPointEntity('spawn-point-2', this, scene, new BABYLON.Vector3(-11.80, 0.4, 0)),
      new SpawnPointEntity('spawn-point-3', this, scene, new BABYLON.Vector3(-11.80, 0.4, -1)),
      new SpawnPointEntity('spawn-point-4', this, scene, new BABYLON.Vector3(-11.80, 0.4, -2)),
      new SpawnPointEntity('spawn-point-5', this, scene, new BABYLON.Vector3(-11.80, 0.4, -3)),
      new SpawnPointEntity('spawn-point-6', this, scene, new BABYLON.Vector3(-11.80, 0.4, -4)),      
    ];
  }

  protected createStartTriggers() {
    const scene = this.scene!;

    this.startTriggers = [
      new StartTrigger(scene,
        {
          level: this,
          position: new BABYLON.Vector3(-8, 0, -2),
          scaling: new BABYLON.Vector3(5, 0.1, 7)
        }),
    ];
  }

  protected createEndTriggers() {
    const scene = this.scene!;

    this.endTriggers = [
      new EndTrigger(scene, {
        level: this,
        position: new BABYLON.Vector3(-10.00, 42.00, 8.00),
        scaling: new BABYLON.Vector3(5, 0.1, 5)
      }),
      new EndTrigger(scene, {
        level: this,
        position: new BABYLON.Vector3(-21.40, 0.00, -8.00),
        scaling: new BABYLON.Vector3(5, 0.1, 5)
      }),
    ];
  }

  protected createTeleports() {
    const scene = this.scene!;
    const firstPositionZ = -8;
    const gap = 2;

    this.teleports = [
      new TeleportTrigger('teleport-stage-2', scene, {
        level: this,
        position: new BABYLON.Vector3(-15.90, 0.00, firstPositionZ)
      }, new BABYLON.Vector3(6.07, 6.00, 1.93)),
      new TeleportTrigger('teleport-stage-3', scene, {
        level: this,
        position: new BABYLON.Vector3(-15.90, 0.00, firstPositionZ - gap)
      }, new BABYLON.Vector3(11.60, 12.20, -7.65)),
      new TeleportTrigger('teleport-stage-4', scene, {
        level: this,
        position: new BABYLON.Vector3(-15.90, 0.00, firstPositionZ - gap * 2)
      }, new BABYLON.Vector3(4.13, 22.20, -8.09)),
      new TeleportTrigger('teleport-stage-5', scene, {
        level: this,
        position: new BABYLON.Vector3(-15.90, 0.00, firstPositionZ - gap * 3)
      }, new BABYLON.Vector3(-5.80, 32.50, -8.70)),
      new TeleportTrigger('teleport-top', scene, {
        level: this,
        position: new BABYLON.Vector3(-15.90, 0.00, firstPositionZ - gap * 4)
      }, new BABYLON.Vector3(-12.60, 42.50, 5.70)),
      
    ];

    this.teleports.forEach(teleport => {
      GameEntity.createLabelTag(scene, teleport.mesh, teleport.name);
    });
  }

  protected createLights() {
    const scene = this.scene!;
    const player = this.player!;

    const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);


    const light1 = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(-6, 6, 0), scene);
    light1.intensity = 0.4;
    light1.shadowEnabled = true;
    light1.shadowMinZ = 0.1;
    light1.shadowMaxZ = 100;
    if (import.meta.env.DEV) {
      const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
      const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
      lightGizmo1.light = light1;
    }

    this.lights = [hemiLight, light1];
    this.shadowGenerators = [
      new ShadowGenerator(light1, [...this.walls.map(x => x.mesh)], [player.mesh!, this.ground!, ...this.walls.map(x => x.mesh)]),
    ];
  }
}
