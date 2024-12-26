import * as BABYLON from '@babylonjs/core';

export interface PlayerOptions {
  startPosition?: BABYLON.Vector3,
  color?: BABYLON.Color3
}

export const createPlayer = (scene: BABYLON.Scene, opts: PlayerOptions) => {
  const boxMaterial = new BABYLON.StandardMaterial('boxMaterial');
  boxMaterial.diffuseColor = opts.color || new BABYLON.Color3(0,0,1);

  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.2,
    height: 0.2,
    depth: 0.2
  }, scene);
  box.position = opts.startPosition || new BABYLON.Vector3(0,0,0);
  box.material = boxMaterial;  

  // Create a box shape and the associated body. Size will be determined automatically.
  const boxAggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  return box;
}
