import * as BABYLON from '@babylonjs/core';

export type TextureCategory = 'dark' | 'light' | 'green' | 'orange' | 'purple' | 'red';
export type TextureType = 'texture_01' | 'texture_02' | 'texture_03' | 'texture_04' | 'texture_05' | 'texture_06' | 'texture_07' |
  'texture_08' | 'texture_09' | 'texture_10' | 'texture_11' | 'texture_12' | 'texture_13';
export interface TextureOptions {
  uScale: number;
  vScale: number;
}

export const createTexture = (category: TextureCategory, type: TextureType, opts: TextureOptions, scene: BABYLON.Scene) => {
  const t = new BABYLON.Texture(`${window.location.href}assets/textures/${category}/${type}.png`, scene);
  t.uScale = opts.uScale || 1;
  t.vScale = opts.vScale || 1;
  return t;
}

export const getDarkTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('dark', 'texture_01', opts, scene);

export const getLightTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('light', 'texture_01', opts, scene);

export const getGreenTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('green', 'texture_01', opts, scene);

export const getOrangeTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('orange', 'texture_01', opts, scene);

export const getPurpleTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('purple', 'texture_01', opts, scene);

export const getRedTexture = (opts: TextureOptions, scene: BABYLON.Scene) => createTexture('red', 'texture_01', opts, scene);
