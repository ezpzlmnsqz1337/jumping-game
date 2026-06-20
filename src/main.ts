import * as BABYLON from '@babylonjs/core';
import '@babylonjs/gui';
import '@babylonjs/loaders/glTF';

import { createScene1 } from './scenes/scene1.ts';
import './style.css';
import gameRoot from './game-root.ts';
import { resolveQualityTier, shouldEnableAntialias, applyEngineQuality } from './quality.ts';

const canvas = document.getElementById('render-canvas') as BABYLON.Nullable<HTMLCanvasElement>;

const setting = gameRoot.gameSettings.qualityTier ?? 'auto';
const effectiveTier = resolveQualityTier(setting);
gameRoot.qualityTier = effectiveTier;

const antialias = shouldEnableAntialias(effectiveTier);

const engine = new BABYLON.Engine(canvas, antialias, { adaptToDeviceRatio: false });
applyEngineQuality(engine, effectiveTier);
gameRoot.engine = engine;

gameRoot.activeScene = await createScene1(engine);

engine.runRenderLoop(() => {
  if (gameRoot.activeScene) {
    gameRoot.activeScene.render();
  }
});

window.addEventListener('resize', () => {
  engine.resize();
});
