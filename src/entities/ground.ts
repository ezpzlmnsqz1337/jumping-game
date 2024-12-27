import * as BABYLON from '@babylonjs/core';

export const createGround = (scene: BABYLON.Scene) => {
  const groundMaterial = new BABYLON.StandardMaterial('groundMaterial');
  groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  groundMaterial.roughness = 0.3;

  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    height: 100,
    width: 100
  }, scene);
  ground.material = groundMaterial;

  const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.7 }, scene);

  return ground;
}