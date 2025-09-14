import * as BABYLON from '@babylonjs/core';
import { getDarkTexture } from '../../assets/textures';
import { WallEntity } from '../../entities/wall-entity';
import { GameLevel } from '../../game-level';
import { Trigger } from '../../triggers/trigger';
import { PlayerEntity } from '../../entities/player-entity';

export const createBunnyHops = (scene: BABYLON.Scene, level: GameLevel) => {
  const initialX = -47.5;
  const initialY = 1.9;
  const initialZ = -40;

  const height = 4;
  const leftJumpOffset = 2;
  const rightJumpOffset = 6;

  const walls = [
    // start
    new WallEntity(scene, level, 'box', { width: 5, depth: 20, height }, new BABYLON.Vector3(initialX, initialY, initialZ)),
    createJump(scene, level, new BABYLON.Vector3(initialX+10, initialY, initialZ-rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+15, initialY, initialZ-leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+20, initialY, initialZ-rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+25, initialY, initialZ-leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+30, initialY, initialZ-rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+35, initialY, initialZ-leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+40, initialY, initialZ-rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+45, initialY, initialZ-leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+50, initialY, initialZ-rightJumpOffset), height),

    createJump(scene, level, new BABYLON.Vector3(initialX+15, initialY, initialZ+rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+10, initialY, initialZ+leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+25, initialY, initialZ+rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+20, initialY, initialZ+leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+35, initialY, initialZ+rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+30, initialY, initialZ+leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+45, initialY, initialZ+rightJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+40, initialY, initialZ+leftJumpOffset), height),
    createJump(scene, level, new BABYLON.Vector3(initialX+50, initialY, initialZ+rightJumpOffset), height),
    // end
    new WallEntity(scene, level, 'box', { width: 5, depth: 20, height }, new BABYLON.Vector3(initialX+61, initialY, initialZ)),
    // stairs
    new WallEntity(scene, level, 'box', { width: 5, depth: 1, height: height-1 }, new BABYLON.Vector3(initialX, initialY-0.5, initialZ+10.5)),
    new WallEntity(scene, level, 'box', { width: 5, depth: 1, height: height-2 }, new BABYLON.Vector3(initialX, initialY-1, initialZ+11.5)),
    new WallEntity(scene, level, 'box', { width: 5, depth: 1, height: height-3 }, new BABYLON.Vector3(initialX, initialY-1.5, initialZ+12.5)),
  ]  

  walls.forEach(wall => (wall.mesh!.material as BABYLON.StandardMaterial).diffuseTexture = getDarkTexture({ uScale: 1, vScale: 1 }, scene));
  return walls;
}

const createJump = (scene:BABYLON.Scene, level: GameLevel, position: BABYLON.Vector3, height: number) => {
  const wall = new WallEntity(scene, level, 'box', { width: 2, depth: 2, height }, position);
  const jumpTrigger = new Trigger(scene, level, {
    isVisible: false,
    position: position.add(new BABYLON.Vector3(0, 2, 0)),
    scaling: new BABYLON.Vector3(2, 0.2, 2),
  });

  jumpTrigger.onEnter = (trigger: BABYLON.Mesh, player: PlayerEntity) => {
    setTimeout(() => {
      const velocity = player.physics.body.getLinearVelocity()
      player.physics.body.setLinearVelocity(velocity.multiply(new BABYLON.Vector3(0.5, 0, 0.5)));
      player.jump();
    })
  }

  return wall;
}