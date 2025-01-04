import * as BABYLON from '@babylonjs/core';
import { getDarkTexture, getRedTexture } from '../../assets/textures';
import { FILTER_GROUP_GROUND } from '../../collission-groups';
import { SpawnPointEntity } from '../../entities/spawn-point';
import { GameLevel } from '../../game-level';
import { ShadowGenerator } from '../../shadows';
import { EndTrigger } from '../../triggers/end';
import { StartTrigger } from '../../triggers/start';
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
    ];

    // last wall red
    (this.walls[this.walls.length - 1].mesh.material as BABYLON.StandardMaterial).diffuseTexture = getRedTexture({ uScale: 1, vScale: 1 }, scene);
  };

  protected createSpawnPoints() {
    const scene = this.scene!;

    this.spawnPoints = [
      new SpawnPointEntity('spawn-point-1', this, scene, new BABYLON.Vector3(-11.80, 0.05, 1)),
      new SpawnPointEntity('spawn-point-2', this, scene, new BABYLON.Vector3(-11.80, 0.05, 0)),
      new SpawnPointEntity('spawn-point-3', this, scene, new BABYLON.Vector3(-11.80, 0.05, -1)),
      new SpawnPointEntity('spawn-point-4', this, scene, new BABYLON.Vector3(-11.80, 0.05, -2)),
      new SpawnPointEntity('spawn-point-5', this, scene, new BABYLON.Vector3(-11.80, 0.05, -3)),
      new SpawnPointEntity('spawn-point-6', this, scene, new BABYLON.Vector3(-11.80, 0.05, -4)),
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
      // createEndTrigger(scene, { level: this, position: new BABYLON.Vector3(-14, 0, -8), scaling: new BABYLON.Vector3(5, 0.1, 5) });
    ];
  }

  protected createTeleports() {
    // todo
  }

  protected createLights() {
    const scene = this.scene!;
    const player = this.player!;

    const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

    const light1 = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(-6, 6, 0), scene);
    light1.intensity = 0.4;
    light1.shadowEnabled = true;
    light1.shadowMinZ = 0.1;
    light1.shadowMaxZ = 100;
    const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
    lightGizmo1.light = light1;

    this.lights = [hemiLight, light1];
    this.shadowGenerators = [
      new ShadowGenerator(light1, [...this.walls.map(x => x.mesh)], [player.mesh!, this.ground!, ...this.walls.map(x => x.mesh)]),
    ];
  }
}
