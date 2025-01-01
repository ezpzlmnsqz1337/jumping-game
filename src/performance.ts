import * as BABYLON from '@babylonjs/core';

const fpsCounerDiv = document.querySelector('.performance .fps .value') as HTMLDivElement;

export const createOptimizations = (scene: BABYLON.Scene) => {
  const options = new BABYLON.SceneOptimizerOptions();
  options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
  const optimizer = new BABYLON.SceneOptimizer(scene, options);
  optimizer.start();

  return optimizer;
}
  
let lastUpdateTime = 0;
const updateInterval = 1000; // Update every second

export const createPerformanceMonitor = (scene: BABYLON.Scene) => {
  const perfMonitor = new BABYLON.PerformanceMonitor();
  perfMonitor.enable();

  scene.onBeforeRenderObservable.add(() => {
    perfMonitor.sampleFrame();
    const currentTime = performance.now();
    if (currentTime - lastUpdateTime >= updateInterval) {
      fpsCounerDiv.innerText = perfMonitor.instantaneousFPS.toFixed(0);
      lastUpdateTime = currentTime;
    }
  });
}