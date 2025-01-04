import * as BABYLON from '@babylonjs/core';

export class Skybox {
  constructor(scene: BABYLON.Scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 300 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      `${window.location.origin}/assets/textures/skybox/tropical/tropical-sunny-day`,
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
  }
}