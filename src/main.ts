import * as BABYLON from '@babylonjs/core';
import '@babylonjs/gui';
import '@babylonjs/loaders/glTF';

import { createScene1 } from './scenes/scene1.ts'
import './style.css'
import gameRoot from './game-root.ts';

const canvas = document.getElementById('render-canvas') as BABYLON.Nullable<HTMLCanvasElement>;

const engine = new BABYLON.Engine(canvas);

gameRoot.activeScene = await createScene1(engine);

engine.runRenderLoop(() => {
  if(gameRoot.activeScene) {
    gameRoot.activeScene.render();
  }
});

window.addEventListener('resize', () => {
  engine.resize();
});