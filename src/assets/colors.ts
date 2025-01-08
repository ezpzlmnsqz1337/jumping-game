import * as BABYLON from '@babylonjs/core';

export type PlayerColor = 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'pink' | 'purple';

export const playerColor = new BABYLON.Color3(0.11, 0.58, 1);
export const startTriggerColor = new BABYLON.Color3(0.58, 1.0, 0.11);
export const endTriggerColor = new BABYLON.Color3(1, 0.19, 0.19);
export const defaultTriggerColor = new BABYLON.Color3(0.7, 0.7, 0.7);
export const teleportTriggerColor = new BABYLON.Color3(1, 1, 0.19);

export const easyColor = new BABYLON.Color3(0.58, 1.0, 0.11);
export const mediumColor = new BABYLON.Color3(0.87, 0.76, 0.26);
export const hardColor = new BABYLON.Color3(1, 0.19, 0.19);
