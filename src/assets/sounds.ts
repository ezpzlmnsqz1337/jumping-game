import * as BABYLON from '@babylonjs/core';

// sounds
export const createSounds = (scene: BABYLON.Scene) => {
  return [
    holyShit(scene),
    dominating(scene),
    godlike(scene),
    unstoppable(scene),
    wickedSick(scene),
    closeLobby(scene),
    openLobby(scene),
    waterSplash1(scene),
    waterSplash2(scene),
    keyPress(scene),
    openLobby(scene),
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

const closeLobby = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("close-lobby", "./assets/sounds/close-lobby.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const openLobby = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("open-lobby", "./assets/sounds/open-lobby.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const waterSplash1 = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("water-splash1", "./assets/sounds/water-splash1.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const waterSplash2 = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("water-splash2", "./assets/sounds/water-splash2.mp3", scene, null, {
  volume: 0.1,
  ...opts
});

const keyPress = (scene: BABYLON.Scene, opts?: BABYLON.ISoundOptions) => new BABYLON.Sound("key-press", "./assets/sounds/key-press.mp3", scene, null, {
  volume: 0.1,
  ...opts
});
