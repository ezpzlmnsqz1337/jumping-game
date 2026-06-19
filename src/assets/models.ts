import * as BABYLON from '@babylonjs/core';

export const ModelId = {
  playerBlue: 'player-blue.glb',
  playerGreen: 'player-green.glb',
  playerRed: 'player-red.glb',
  playerOrange: 'player-orange.glb',
  playerYellow: 'player-yellow.glb',
  playerPink: 'player-pink.glb',
  playerPurple: 'player-purple.glb',
  tree01: 'tree-01.glb',
  tree02: 'tree-02.glb',
};

export const getModel = (
  scene: BABYLON.Scene,
  model: string
): Promise<BABYLON.ISceneLoaderAsyncResult> => {
  return BABYLON.SceneLoader.ImportMeshAsync('', './assets/models/', model, scene);
};
