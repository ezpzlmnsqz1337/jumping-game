import * as BABYLON from '@babylonjs/core';

export const createGround = (scene: BABYLON.Scene) => {
  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    height: 20,
    width: 20
  }, scene);
  
  const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

  return ground;
}