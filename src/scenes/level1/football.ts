import * as BABYLON from '@babylonjs/core';
import { getOrangeTexture } from '../../assets/textures';

let noOfBalls = 0;

export const createBall = (scene: BABYLON.Scene, position: BABYLON.Vector3) => {
  const ball = BABYLON.MeshBuilder.CreateSphere(`ball${noOfBalls}`, { diameter: 1 }, scene);
  ball.position = position;

  const material = new BABYLON.StandardMaterial('ballMaterial', scene);
  material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  material.diffuseTexture = getOrangeTexture({ uScale: 1, vScale: 1 }, scene);
  material.roughness = 0;
  ball.material = material;
  
  // physics
  const ballAggregate = new BABYLON.PhysicsAggregate(
    ball,
    BABYLON.PhysicsShapeType.SPHERE,
    { mass: 1, restitution: 1, friction: 0.4 },
    scene
  );

  noOfBalls++;
  return ball;
}