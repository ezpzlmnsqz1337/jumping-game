import * as BABYLON from '@babylonjs/core';
import { type QualityTier } from './quality';

export class ShadowGenerator {
  shadowGenerator: BABYLON.ShadowGenerator | null;

  constructor(
    tier: QualityTier,
    light: BABYLON.IShadowLight,
    meshesCastingShadow: BABYLON.Mesh[],
    meshesReceivingShadows: BABYLON.Mesh[]
  ) {
    if (tier === 'low') {
      light.shadowEnabled = false;
      this.shadowGenerator = null;
      return;
    }

    const mapSize = tier === 'medium' ? 1024 : 2048;
    this.shadowGenerator = new BABYLON.ShadowGenerator(mapSize, light);

    meshesCastingShadow.forEach(x => this.shadowGenerator!.addShadowCaster(x));
    meshesReceivingShadows.forEach(x => (x.receiveShadows = true));

    if (tier === 'medium') {
      this.shadowGenerator.useExponentialShadowMap = true;
    } else {
      this.shadowGenerator.useBlurCloseExponentialShadowMap = true;
      this.shadowGenerator.useKernelBlur = true;
      this.shadowGenerator.blurKernel = 64;
    }
  }

  addShadowCaster(mesh: BABYLON.Mesh) {
    this.shadowGenerator?.addShadowCaster(mesh);
  }

  dispose() {
    this.shadowGenerator?.dispose();
    this.shadowGenerator = null;
  }
}
