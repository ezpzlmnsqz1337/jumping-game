import * as BABYLON from '@babylonjs/core';

export class ShadowGenerator {
  shadowGenerator: BABYLON.ShadowGenerator;

  constructor(
    light: BABYLON.IShadowLight,
    meshesCastingShadow: BABYLON.Mesh[],
    meshesReceivingShadows: BABYLON.Mesh[]
  ) {
    this.shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

    meshesCastingShadow.forEach(x => this.shadowGenerator.addShadowCaster(x));
    meshesReceivingShadows.forEach(x => x.receiveShadows = true);

    this.shadowGenerator.useBlurCloseExponentialShadowMap = true;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = 64;

    // shadowGenerator.useCloseExponentialShadowMap = true;
    // shadowGenerator.usePercentageCloserFiltering  = true;
  }

  addShadowCaster(mesh: BABYLON.Mesh) {
    this.shadowGenerator.addShadowCaster(mesh);
  }
}