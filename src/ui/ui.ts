import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { getCurrentTimerTimeStr, TimeEntry } from '../entities/timer';

export const bindUI = (scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) => {
  const uiTimerDiv = document.querySelector('.timer > div > .value') as HTMLDivElement;
  const uiCheckpointsDiv = document.querySelector('.checkpoints > .value') as HTMLDivElement;

  const uiPlayerInfo = {
    hSpeed: document.querySelector('.player-info > .horizontal-speed > .value') as HTMLDivElement,
    vSpeed: document.querySelector('.player-info > .vertical-speed > .value') as HTMLDivElement,
    moving: document.querySelector('.player-info > .moving > .value') as HTMLDivElement,
    jumping: document.querySelector('.player-info > .jumping > .value') as HTMLDivElement
  }

  scene.onBeforeRenderObservable.add(() => {
    updateHorizontalSpeed(player, uiPlayerInfo.hSpeed);
    updateVerticalSpeed(player, uiPlayerInfo.vSpeed);
    updateMoving(player, uiPlayerInfo.moving);
    updateJumping(player, uiPlayerInfo.jumping);
    updateTime(uiTimerDiv);
    updateCheckpoints(uiCheckpointsDiv, player.checkpoints.length);
  });

  bindEditorUI(scene, gizmoManager);
};

const updateHorizontalSpeed = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  const { x, z } = player.physics.body.getLinearVelocity();
  const hSpeed = new BABYLON.Vector3(x, 0, z).length().toFixed(2);
  if (htmlEl.innerText === hSpeed) return;
  htmlEl.innerText = hSpeed;
}

const updateVerticalSpeed = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  const { y } = player.physics.body.getLinearVelocity();
  const vSpeed = new BABYLON.Vector3(0, y, 0).length().toFixed(2);
  if (htmlEl.innerText === vSpeed) return;
  htmlEl.innerText = vSpeed;
}

const updateMoving = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  htmlEl.innerText = player.moving ? 'Yes' : 'No';
  htmlEl.classList.toggle('yes', player.moving);
  htmlEl.classList.toggle('no', !player.moving);
}

const updateJumping = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  htmlEl.innerText = player.jumping ? 'Yes' : 'No';
  htmlEl.classList.toggle('yes', player.jumping);
  htmlEl.classList.toggle('no', !player.jumping);
}

const updateTime = (htmlEl: HTMLDivElement) => {
  if (htmlEl.innerText === getCurrentTimerTimeStr()) return
  htmlEl.innerText = getCurrentTimerTimeStr();
}

const updateCheckpoints = (htmlEl: HTMLDivElement, noOfCheckpoints: number) => {
  const value = `${noOfCheckpoints}`;
  if (htmlEl.innerText === value) return;
  htmlEl.innerText = `${value} checkpoint${noOfCheckpoints === 1 ? '' : 's'}`;
}

export const updateTimes = (times: TimeEntry[]) => {
  if (times.length === 0) return;
  const timesListDiv = document.querySelector('.times-list');
  if (!timesListDiv) return;
  timesListDiv.innerHTML = ''
  const timesListOl = document.createElement('ol');
  times.forEach(time => {
    const timesListLi = document.createElement('li');
    let checkpoints = 'No checkpoints!'
    if (time.checkpoints > 0) {
      checkpoints = `${time.checkpoints} checkpoint`
    }
    if (time.checkpoints > 1) {
      checkpoints += 's'
    }
    timesListLi.innerText = `${time.timeStr} - ${checkpoints} - ${time.nickname} `;
    timesListOl.appendChild(timesListLi);
    timesListDiv.appendChild(timesListOl);
  });
};

const bindEditorUI = (scene: BABYLON.Scene, gizmoManager?: BABYLON.GizmoManager) => {
  // editor
  const editorDiv = document.querySelector('.editor') as HTMLInputElement;
  const editModeCheckBox = document.querySelector('.edit-mode-enabled') as HTMLInputElement;
  const controlsToggle = document.querySelectorAll('.editor > .editor-controls') as NodeListOf<HTMLDivElement>;

  editModeCheckBox.setAttribute('checked', 'true');

  editModeCheckBox.addEventListener('click', () => {
    if (!gizmoManager) return;
    gizmoManager.attachableMeshes = gizmoManager.attachableMeshes === null ? [] : null;
    gizmoManager.attachToMesh(null);
    controlsToggle.forEach(x => x.style.display = x.style.display === 'none' ? 'flex' : 'none');
    updateEditorSelection(null);
  });

  bindMeshInfoUI(gizmoManager || null, editorDiv);
  bindCameraInfoUI(scene);
}

export type GizmoType = 'position' | 'rotation' | 'scaling';

const updateMeshDetails = (gizmoManager: BABYLON.GizmoManager, gizmoType: GizmoType, htmlElement: HTMLDivElement) => {
  if (!gizmoManager.attachedMesh) return gizmoType === 'rotation' ? '[0, 0, 0, 0]' : '[0, 0, 0]';
  const gizmo = gizmoManager.attachedMesh![gizmoType === 'rotation' ? 'rotationQuaternion' : gizmoType];

  if (!gizmo) return
  const value = [gizmo.x, gizmo.y, gizmo.z]
  if (gizmoType === 'rotation') value.push((gizmo as BABYLON.Quaternion).w);

  setInnerText(htmlElement, arrayToString(value));
}

const bindMeshInfoUI = (gizmoManager: BABYLON.Nullable<BABYLON.GizmoManager>, editorDiv: HTMLDivElement) => {
  if (!gizmoManager) {
    editorDiv.style.display = 'none';
    return;
  }

  const transformCheckBox = document.querySelector('.transform-enabled') as HTMLInputElement;
  const scalingCheckBox = document.querySelector('.scaling-enabled') as HTMLInputElement;
  const rotationCheckBox = document.querySelector('.rotation-enabled') as HTMLInputElement;

  const positionValueDiv = document.querySelector('.transform-value') as HTMLDivElement;
  const rotationValueDiv = document.querySelector('.rotation-value') as HTMLDivElement;
  const scalingValueDiv = document.querySelector('.scaling-value') as HTMLDivElement;

  transformCheckBox.setAttribute('checked', 'true');

  // enable all to assign events
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = true;
  gizmoManager.scaleGizmoEnabled = true;

  gizmoManager.onAttachedToMeshObservable.add(newMesh => {
    updateMeshDetails(gizmoManager, 'position', positionValueDiv);
    updateMeshDetails(gizmoManager, 'rotation', rotationValueDiv);
    updateMeshDetails(gizmoManager, 'scaling', scalingValueDiv);

    if (!newMesh) return;

    updateEditorSelection(newMesh);
  });

  gizmoManager.gizmos.positionGizmo?.onDragEndObservable.add(() => {
    updateMeshDetails(gizmoManager, 'position', positionValueDiv);
  });
  gizmoManager.gizmos.positionGizmo?.onDragObservable.add(() => {
    updateMeshDetails(gizmoManager, 'position', positionValueDiv);
  });

  gizmoManager.gizmos.rotationGizmo?.onDragEndObservable.add(() => {
    updateMeshDetails(gizmoManager, 'rotation', rotationValueDiv);
  });
  gizmoManager.gizmos.rotationGizmo?.onDragObservable.add(() => {
    updateMeshDetails(gizmoManager, 'rotation', rotationValueDiv);
  });

  gizmoManager.gizmos.scaleGizmo?.onDragEndObservable.add(() => {
    updateMeshDetails(gizmoManager, 'scaling', scalingValueDiv);
  });
  gizmoManager.gizmos.scaleGizmo?.onDragObservable.add(() => {
    updateMeshDetails(gizmoManager, 'scaling', scalingValueDiv);
  });

  // leave only transform enabled
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;

  transformCheckBox.addEventListener('click', () => {
    if (!gizmoManager) return;
    gizmoManager.positionGizmoEnabled = !gizmoManager.positionGizmoEnabled;
  });

  scalingCheckBox.addEventListener('click', () => {
    if (!gizmoManager) return;
    gizmoManager.scaleGizmoEnabled = !gizmoManager.scaleGizmoEnabled;
  });

  rotationCheckBox.addEventListener('click', () => {
    if (!gizmoManager) return;
    gizmoManager.rotationGizmoEnabled = !gizmoManager.rotationGizmoEnabled;
  });

  gizmoManager.gizmos.positionGizmo!.snapDistance = 0.1;
  gizmoManager.gizmos.rotationGizmo!.snapDistance = 0.1;
  gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = false;
}


let oldMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
const updateEditorSelection = (newMesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => {
  // restore old mesh alpha
  const oldMaterial = oldMesh?.material;
  if (oldMaterial) {
    (oldMaterial as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
  }

  const material = newMesh?.material;
  if (material) {
    oldMesh = newMesh;
    (material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Blue();
  }
}

const bindCameraInfoUI = (scene: BABYLON.Scene) => {
  const cameraPositionSpan = document.querySelector('.editor .camera-position .value') as HTMLSpanElement
  const cameraAlphaSpan = document.querySelector('.editor .camera-alpha .value') as HTMLSpanElement
  const cameraBetaSpan = document.querySelector('.editor .camera-beta .value') as HTMLSpanElement
  const cameraRadiusSpan = document.querySelector('.editor .camera-radius .value') as HTMLSpanElement
  const lockTargetCheckBox = document.querySelector('.editor .lock-target-enabled') as HTMLInputElement

  const camera = scene.activeCamera as BABYLON.ArcRotateCamera;

  if (!camera) return;

  lockTargetCheckBox.setAttribute('checked', 'true');

  camera.onAfterCheckInputsObservable.add(() => {
    const position = [camera.position.x, camera.position.y, camera.position.z]
    setInnerText(cameraPositionSpan, arrayToString(position));
    setInnerText(cameraAlphaSpan, camera.alpha.toFixed(4));
    setInnerText(cameraBetaSpan, camera.beta.toFixed(4));
    setInnerText(cameraRadiusSpan, camera.radius.toFixed(2));
    if (lockTargetCheckBox.checked) {
      if (!camera.lockedTarget) (camera.lockedTarget = scene.getMeshByName('player'));
    } else {
      if (camera.lockedTarget) (camera.lockedTarget = null);
    }
  });
}

const arrayToString = (arr: number[]) => {
  return `[ ${arr.map(x => x.toFixed(2)).join(', ')} ]`;
}

const setInnerText = (element: HTMLElement, text: string) => {
  if (element.innerText === text) return;
  element.innerText = text;
}