import * as BABYLON from '@babylonjs/core';

// sounds
export const holyShit = (scene: BABYLON.Scene, opts: BABYLON.ISoundOptions) => new BABYLON.Sound("holy-shit", "./assets/sounds/holy-shit.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

export const dominating = (scene: BABYLON.Scene, opts: BABYLON.ISoundOptions) => new BABYLON.Sound("dominating", "./assets/sounds/dominating.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

export const godlike = (scene: BABYLON.Scene, opts: BABYLON.ISoundOptions) => new BABYLON.Sound("godlike", "./assets/sounds/godlike.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

export const unstoppable = (scene: BABYLON.Scene, opts: BABYLON.ISoundOptions) => new BABYLON.Sound("unstoppable", "./assets/sounds/unstoppable.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

export const wickedSick = (scene: BABYLON.Scene, opts: BABYLON.ISoundOptions) => new BABYLON.Sound("wicked-sick", "./assets/sounds/wicked-sick.mp3", scene, null, {
  volume: 0.1,
  ...opts
});