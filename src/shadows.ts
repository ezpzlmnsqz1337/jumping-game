import * as BABYLON from '@babylonjs/core';

export const createShadowGenerator = (scene: BABYLON.Scene,
    light: BABYLON.IShadowLight,
    meshesCastingShadow: BABYLON.Mesh[],
    meshesReceivingShadows: BABYLON.Mesh[]) => {
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

  meshesCastingShadow.forEach(x => shadowGenerator.addShadowCaster(x));
  meshesReceivingShadows.forEach(x => x.receiveShadows = true);
  
  shadowGenerator.useBlurCloseExponentialShadowMap = true;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = 64;
  
  // shadowGenerator.useCloseExponentialShadowMap = true;
  // shadowGenerator.usePercentageCloserFiltering  = true;
  
  return shadowGenerator;
};