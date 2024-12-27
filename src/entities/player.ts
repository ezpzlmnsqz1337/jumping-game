import * as BABYLON from '@babylonjs/core';

export interface PlayerEntity {
  moving: boolean
  speed: number
  rotationSpeed: number
  jumpingPower: number
  jumping: boolean
  mesh: BABYLON.Mesh
  physics: BABYLON.PhysicsAggregate
}

export interface CreatePlayerOptions {
  startPosition?: BABYLON.Vector3
  color?: BABYLON.Color3
}

export const createPlayer = (scene: BABYLON.Scene, opts: CreatePlayerOptions) => {
  const boxMaterial = new BABYLON.StandardMaterial('boxMaterial');
  boxMaterial.diffuseColor = opts.color || new BABYLON.Color3(29/255, 150/255, 1);

  const redMaterial = new BABYLON.StandardMaterial('redMaterial');
  redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

  const multiMaterial = new BABYLON.MultiMaterial('multiMaterial', scene);
  multiMaterial.subMaterials.push(boxMaterial); // Default material
  multiMaterial.subMaterials.push(redMaterial); // Red material

  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.4,
    height: 0.4,
    depth: 0.4
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

  // physics
  const boxAggregate = new BABYLON.PhysicsAggregate(
    box,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 10, restitution: 0.75, friction: 3},
    scene
  );

  const player: PlayerEntity = {
    speed: 2,
    rotationSpeed: 4,
    jumpingPower: 100,
    jumping: false,
    moving: false,
    mesh: box,
    physics: boxAggregate
  }

  boxAggregate.body.setCollisionCallbackEnabled(true);
  boxAggregate.body.setLinearDamping(5);
  
  const observable = boxAggregate.body.getCollisionObservable();
  const observer = observable.add(collisionEvent => {
    if (collisionEvent.collidedAgainst === null) return;
    if (['ground', 'wall'].includes(collisionEvent.collidedAgainst.transformNode.name)) {
      if (collisionEvent.type === BABYLON.PhysicsEventType.COLLISION_STARTED) {
        const upCollission = collisionEvent.normal?.dot(BABYLON.Vector3.Up()) ?? -1;
        if(upCollission < -0.999 && upCollission > -1.001) {
          player.jumping = false;
        }
      }
    }
  });

  // Continuously set angular velocity to zero to disallow rotation
  scene.onBeforeRenderObservable.add(() => {
    const angularVelocity = boxAggregate.body.getAngularVelocity();
    // boxAggregate.body.setAngularVelocity(new BABYLON.Vector3(0, angularVelocity.y, 0));
  });
  
  return player;
}
