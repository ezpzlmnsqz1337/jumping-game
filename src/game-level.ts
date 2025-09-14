import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from './entities/player-entity';
import { SpawnPointEntity } from './entities/spawn-point-entity';
import { WallEntity } from './entities/wall-entity';
import { Skybox } from './scenes/level1/skybox';
import { ShadowGenerator } from './shadows';
import { LevelTimer } from './level-timer';
import { EndTrigger } from './triggers/end-trigger';
import { StartTrigger } from './triggers/start-trigger';
import { TeleportTrigger } from './triggers/teleport-trigger';

export class GameLevel {
  name: string;
  skybox: BABYLON.Nullable<Skybox> = null;
  ground: BABYLON.Nullable<BABYLON.Mesh> = null;
  walls: WallEntity[] = [];
  spawnPoints: SpawnPointEntity[] = [];
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

  getRandomSpawnPoint() {
    const index = Math.round(Math.random() * (this.spawnPoints.length - 1));
    return this.spawnPoints[index];
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      player: this.player?.serialize(),
      walls: this.walls.map(wall => wall.serialize()),
      spawnPoints: this.spawnPoints.map(spawnPoint => spawnPoint.serialize()),
      startTriggers: this.startTriggers.map(trigger => trigger.serialize()),
      endTriggers: this.endTriggers.map(trigger => trigger.serialize()),
    });
  }
}