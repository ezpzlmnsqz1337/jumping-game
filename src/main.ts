import * as BABYLON from '@babylonjs/core';
import '@babylonjs/gui';
import '@babylonjs/loaders/glTF';

import { createScene1 } from './scenes/scene1.ts'
import './style.css'

const canvas = document.getElementById('render-canvas') as BABYLON.Nullable<HTMLCanvasElement>;

const engine = new BABYLON.Engine(canvas);

const scene = await createScene1(engine);

engine.runRenderLoop(() => {
  if(scene) {
    scene.render();
  }
});

window.addEventListener('resize', () => {
  engine.resize();
});