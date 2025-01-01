import * as BABYLON from '@babylonjs/core';

export interface SpawnPointEntity {
  mesh: BABYLON.Mesh
}

export const createSpawnPoint = (scene: BABYLON.Scene, position: BABYLON.Vector3) => {

  const box = BABYLON.MeshBuilder.CreateBox('spawnPoint', {
    width: 0.4,
    height: 0.1,
    depth: 0.4,    
  }, scene);

  box.visibility = 0;
  box.position = position;

  const spawnPointEntity = {
    mesh: box
  };

  return spawnPointEntity;
}

export const getRandomSpawnPoint = (spawnPoints: SpawnPointEntity[]) => {
  const index = Math.round(Math.random() * (spawnPoints.length-1));
  return spawnPoints[index]
}