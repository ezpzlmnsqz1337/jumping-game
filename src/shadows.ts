import * as BABYLON from '@babylonjs/core';

export interface ShadowGeneratorOptions {
  mapSize?: number;
  blurKernel?: number;
}

export class ShadowGenerator {
  shadowGenerator: BABYLON.ShadowGenerator;

  constructor(
    light: BABYLON.IShadowLight,
    meshesCastingShadow?: BABYLON.Mesh[],
    meshesReceivingShadows?: BABYLON.Mesh[],
    options?: ShadowGeneratorOptions
  ) {
    const mapSize = options?.mapSize ?? 2048;
    this.shadowGenerator = new BABYLON.ShadowGenerator(mapSize, light);

    (meshesCastingShadow ?? []).forEach(x => this.shadowGenerator.addShadowCaster(x));
    (meshesReceivingShadows ?? []).forEach(x => (x.receiveShadows = true));

    this.shadowGenerator.useBlurCloseExponentialShadowMap = true;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = options?.blurKernel ?? 64;
  }

  addShadowCaster(mesh: BABYLON.Mesh) {
    this.shadowGenerator.addShadowCaster(mesh);
  }
}
