import * as BABYLON from '@babylonjs/core';

export const createOptimizations = (scene: BABYLON.Scene, hardwareScalingCap = 1) => {
  const options = new BABYLON.SceneOptimizerOptions();
  options.addOptimization(new BABYLON.HardwareScalingOptimization(0, hardwareScalingCap));
  const optimizer = new BABYLON.SceneOptimizer(scene, options);
  optimizer.start();

  return optimizer;
};
