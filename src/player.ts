import * as BABYLON from '@babylonjs/core';

export interface PlayerEntity {
  speed: 1
  isJumping: boolean
  mesh: BABYLON.Mesh
}

export interface CreatePlayerOptions {
  startPosition?: BABYLON.Vector3
  color?: BABYLON.Color3
}

export const createPlayer = (scene: BABYLON.Scene, opts: CreatePlayerOptions) => {
  const boxMaterial = new BABYLON.StandardMaterial('boxMaterial');
  boxMaterial.diffuseColor = opts.color || new BABYLON.Color3(0,0,1);

  const redMaterial = new BABYLON.StandardMaterial('redMaterial');
  redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

  const multiMaterial = new BABYLON.MultiMaterial('multiMaterial', scene);
  multiMaterial.subMaterials.push(boxMaterial); // Default material
  multiMaterial.subMaterials.push(redMaterial); // Red material

  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.2,
    height: 0.2,
    depth: 0.2
  }, scene);
  box.position = opts.startPosition || new BABYLON.Vector3(0,0,0);
  box.material = multiMaterial;

  // Assign materials to specific faces
  box.subMeshes = [];
  const verticesCount = box.getTotalVertices();
  box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, box)); // Face 1
  box.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, 6, 6, box)); // Face 2 (red)
  box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 12, 6, box)); // Face 3
  box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 18, 6, box)); // Face 4
  box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 24, 6, box)); // Face 5
  box.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 30, 6, box)); // Face 6

  const boxAggregate = new BABYLON.PhysicsAggregate(
    box,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 1, restitution: 0.75, friction: 0.4 },
    scene
  );

  // Continuously set angular velocity to zero to disallow rotation
  scene.onBeforeRenderObservable.add(() => {
    boxAggregate.body.setAngularVelocity(BABYLON.Vector3.Zero());
  });  

  const player: PlayerEntity = {
    speed: 1,
    isJumping: false,
    mesh: box
  }
  
  return player;
}
