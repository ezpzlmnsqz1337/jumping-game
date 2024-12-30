import * as BABYLON from '@babylonjs/core';

export const ModelId = {
  playerBlue: 'player-blue.glb',
  playerGreen: 'player-green.glb',
  playerRed: 'player-red.glb',
  playerOrange: 'player-orange.glb',
  playerYellow: 'player-yellow.glb',
  playerPink: 'player-pink.glb',
  playerPurple: 'player-purple.glb'
}

export const getModel = (scene: BABYLON.Scene, model: string): Promise<BABYLON.ISceneLoaderAsyncResult> => {
  return BABYLON.SceneLoader.ImportMeshAsync('', './assets/models/', model, scene);
}