import * as BABYLON from '@babylonjs/core';

// sounds
export const createSounds = (scene: BABYLON.Scene) => {
  return [
    holyShit(scene),
    dominating(scene),
    godlike(scene),
    unstoppable(scene),
    wickedSick(scene)
  ] as BABYLON.Sound[];
}

const holyShit = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("holy-shit", "./assets/sounds/holy-shit.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const dominating = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("dominating", "./assets/sounds/dominating.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const godlike = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("godlike", "./assets/sounds/godlike.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const unstoppable = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("unstoppable", "./assets/sounds/unstoppable.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const wickedSick = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("wicked-sick", "./assets/sounds/wicked-sick.mp3", scene, null, {
  volume: 0.1,
  ...opts
});