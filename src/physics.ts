import * as BABYLON from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";

export const createPhysics = async (scene: BABYLON.Scene) => {
  // pass the engine to the plugin
  const havokInstance = await HavokPhysics();
  const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
  const gravityVector = new BABYLON.Vector3(0, -19.8, 0);
  // enable physics in the scene with a gravity
  scene.enablePhysics(gravityVector, physicsPlugin);
}