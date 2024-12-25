import * as BABYLON from '@babylonjs/core';

const canvas = document.getElementById('render-canvas');

const engine = new BABYLON.Engine(canvas);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

