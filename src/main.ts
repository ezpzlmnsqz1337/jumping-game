import * as BABYLON from '@babylonjs/core';
import { createScene } from './scene.ts'
import './style.css'

const canvas = <BABYLON.Nullable<HTMLCanvasElement>>document.getElementById('render-canvas');

const engine = new BABYLON.Engine(canvas);

const scene = await createScene(engine);

engine.runRenderLoop(() => {
  if(scene) {
    scene.render();
  }
});

window.addEventListener('resize', () => {
  engine.resize();
});