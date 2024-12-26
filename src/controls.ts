import * as BABYLON from '@babylonjs/core';

export const createControls = (scene: BABYLON.Scene) => {
  const keyStatus = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    ControlLeft: false
  }

  scene.actionManager = new BABYLON.ActionManager(scene);

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      e => {
        let key = e.sourceEvent.code as string;
        if (key in keyStatus) {
          keyStatus[key as keyof typeof keyStatus] = true;
          console.table(keyStatus);
        }
      }
    )
  )

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyUpTrigger,
      e => {
        let key = e.sourceEvent.code as string;
        if (key in keyStatus) {
          keyStatus[key as keyof typeof keyStatus] = false;
          console.table(keyStatus);
        }
      }
    )
  )
  
  return keyStatus;
}