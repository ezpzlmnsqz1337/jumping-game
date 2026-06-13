import * as BABYLON from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

/**
 * PHYSICS CADENCE NORMALIZATION
 * =============================
 * Babylon physics engine (Havok) runs at fixed timestep determined by the engine's _deltaTime.
 * Default: ~16.67ms per frame (60 FPS physics)
 * Network updates: 33ms (30 Hz player position sync)
 * 
 * This mismatch means remote players experience 2 physics ticks between network updates.
 * To prevent desync:
 * 1. Remote player bodies have disablePreStep = true during interpolation (no gravity/forces)
 * 2. Interpolation spans the full 33ms network interval using Lerp for position and Slerp for rotation
 * 3. Physics bodies are re-enabled after interpolation completes
 * 
 * Local player physics is unaffected and computes normally for responsive gameplay.
 */
export const createPhysics = async (scene: BABYLON.Scene) => {
  // pass the engine to the plugin
  const havokInstance = await HavokPhysics();
  const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
  const gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  // enable physics in the scene with a gravity
  scene.enablePhysics(gravityVector, physicsPlugin);

  // Log physics timestep for diagnostics (useful for debugging desync issues)
  scene.onBeforePhysicsObservable.add(() => {
    // Timestep is automatically managed by Babylon based on deltaTime
    // Typical values: 1/60 for 60 FPS, 1/30 for 30 FPS
    // This is informational; do not modify manually to avoid breaking physics
  });
};
