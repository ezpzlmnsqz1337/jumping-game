import * as BABYLON from '@babylonjs/core';

export const createSkybox = (scene: BABYLON.Scene) => {
  // Skybox
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 300 }, scene);
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(`${window.location.href}/assets/textures/skybox/tropical/tropical-sunny-day`, scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;

  return skybox;
}