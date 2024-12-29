import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { getCurrentTimerTimeStr, TimeEntry } from '../entities/timer';

export const bindUI = (scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) => {
  const uiTimer = document.querySelector('.timer > .value') as HTMLDivElement;
  const uiCheckpoints = document.querySelector('.checkpoints > .value') as HTMLDivElement;

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
    updateTime(uiTimer);
    updateCheckpoints(uiCheckpoints, player.checkpoints.length);
  });

  bindEditorUI(gizmoManager);
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

const bindEditorUI = (gizmoManager?: BABYLON.GizmoManager) => {
  // editor
  const editorDiv = document.querySelector('.editor') as HTMLInputElement;

  const editModeCheckBox = document.querySelector('.edit-mode-enabled') as HTMLInputElement;
  const transformCheckBox = document.querySelector('.transform-enabled') as HTMLInputElement;
  const scalingCheckBox = document.querySelector('.scaling-enabled') as HTMLInputElement;
  const rotationCheckBox = document.querySelector('.rotation-enabled') as HTMLInputElement;

  const controlsToggle = document.querySelectorAll('.editor > div:not(:first-child)') as NodeListOf<HTMLDivElement>;

  const positionValueDiv = document.querySelector('.transform-value') as HTMLDivElement;
  const rotationValueDiv = document.querySelector('.rotation-value') as HTMLDivElement;
  const scalingValueDiv = document.querySelector('.scaling-value') as HTMLDivElement;

  editModeCheckBox.setAttribute('checked', 'true');
  transformCheckBox.setAttribute('checked', 'true');

  if (!gizmoManager) {
    editorDiv.style.display = 'none';
    return;
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

  editModeCheckBox.addEventListener('click', () => {
    if (!gizmoManager) return;
    gizmoManager.attachableMeshes = gizmoManager.attachableMeshes === null ? [] : null;
    gizmoManager.attachToMesh(null);
    controlsToggle.forEach(x => x.style.display = x.style.display === 'none' ? 'flex' : 'none');
    updateEditorSelection(null);
  });

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
}

export type GizmoType = 'position' | 'rotation' | 'scaling';

const updateMeshDetails = (gizmoManager: BABYLON.GizmoManager, gizmoType: GizmoType, htmlElement: HTMLDivElement) => {
  if (!gizmoManager.attachedMesh) return '[0, 0, 0]';
  const gizmo = gizmoManager.attachedMesh![gizmoType];
  htmlElement.innerText = `[ ${gizmo.x.toFixed(2)}, ${gizmo.y.toFixed(2)}, ${gizmo.z.toFixed(2)} ]`;
}