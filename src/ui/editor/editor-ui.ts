import * as BABYLON from '@babylonjs/core';
import { MyCamera } from '../../camera';
import { PlayerEntity } from '../../entities/player';
import { AbstractUI } from "../abstract-ui";

export type GizmoType = 'position' | 'rotation' | 'scaling';

export class EditorUI extends AbstractUI {
  editorDiv!: HTMLDivElement;
  editModeCheckBox!: HTMLInputElement;
  controlsToggle!: NodeListOf<HTMLDivElement>;

  meshNameSpan!: HTMLDivElement;
  transformCheckBox!: HTMLInputElement;
  scalingCheckBox!: HTMLInputElement;
  rotationCheckBox!: HTMLInputElement;

  positionValueDiv!: HTMLDivElement;
  rotationValueDiv!: HTMLDivElement;
  scalingValueDiv!: HTMLDivElement;

  gizmoManager?: BABYLON.GizmoManager;

  oldMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;

  constructor(scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) {
    super(scene, 'editor', player);
    this.gizmoManager = gizmoManager;
  }

  updateMeshDetails(gizmoType: GizmoType, htmlElement: HTMLDivElement) {
    if (!this.gizmoManager?.attachedMesh) return gizmoType === 'rotation' ? '[0, 0, 0, 0]' : '[0, 0, 0]';
    const gizmo = this.gizmoManager.attachedMesh![gizmoType === 'rotation' ? 'rotationQuaternion' : gizmoType];

    if (!gizmo) return
    const value = [gizmo.x, gizmo.y, gizmo.z]
    if (gizmoType === 'rotation') value.push((gizmo as BABYLON.Quaternion).w);

    this.setInnerText(htmlElement, this.arrayToString(value));
  }

  bindMeshInfoUI() {
    if (!this.gizmoManager) {
      this.editorDiv.style.display = 'none';
      return;
    }

    this.transformCheckBox.setAttribute('checked', 'true');

    // enable all to assign events
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = true;
    this.gizmoManager.scaleGizmoEnabled = true;

    this.gizmoManager.onAttachedToMeshObservable.add(newMesh => {
      this.meshNameSpan.innerText = newMesh?.name || 'None';
      this.updateMeshDetails('position', this.positionValueDiv);
      this.updateMeshDetails('rotation', this.rotationValueDiv);
      this.updateMeshDetails('scaling', this.scalingValueDiv);

      if (!newMesh) return;

      this.updateEditorSelection(newMesh);
    });

    this.gizmoManager.gizmos.positionGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('position', this.positionValueDiv);
    });
    this.gizmoManager.gizmos.positionGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('position', this.positionValueDiv);
    });

    this.gizmoManager.gizmos.rotationGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('rotation', this.rotationValueDiv);
    });
    this.gizmoManager.gizmos.rotationGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('rotation', this.rotationValueDiv);
    });

    this.gizmoManager.gizmos.scaleGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('scaling', this.scalingValueDiv);
    });
    this.gizmoManager.gizmos.scaleGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('scaling', this.scalingValueDiv);
    });

    // leave only transform enabled
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;

    this.transformCheckBox.addEventListener('click', () => {
      if (!this.gizmoManager) return;
      this.gizmoManager.positionGizmoEnabled = !this.gizmoManager.positionGizmoEnabled;
    });

    this.scalingCheckBox.addEventListener('click', () => {
      if (!this.gizmoManager) return;
      this.gizmoManager.scaleGizmoEnabled = !this.gizmoManager.scaleGizmoEnabled;
    });

    this.rotationCheckBox.addEventListener('click', () => {
      if (!this.gizmoManager) return;
      this.gizmoManager.rotationGizmoEnabled = !this.gizmoManager.rotationGizmoEnabled;
    });

    this.gizmoManager.gizmos.positionGizmo!.snapDistance = 0.1;
    this.gizmoManager.gizmos.rotationGizmo!.snapDistance = 0.1;
    this.gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = false;
  }


  updateEditorSelection(newMesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
    // restore old mesh alpha
    const oldMaterial = this.oldMesh?.material;
    if (oldMaterial) {
      (oldMaterial as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Black();
    }

    const material = newMesh?.material;
    if (material) {
      this.oldMesh = newMesh;
      (material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Blue();
    }
  }

  bindCameraInfoUI() {
    const cameraPositionSpan = document.querySelector('.editor .camera-position .value') as HTMLSpanElement
    const cameraAlphaSpan = document.querySelector('.editor .camera-alpha .value') as HTMLSpanElement
    const cameraBetaSpan = document.querySelector('.editor .camera-beta .value') as HTMLSpanElement
    const cameraRadiusSpan = document.querySelector('.editor .camera-radius .value') as HTMLSpanElement
    const lockTargetCheckBox = document.querySelector('.editor .lock-target-enabled') as HTMLInputElement

    const camera = this.scene.activeCamera as MyCamera;

    if (!camera) return;

    lockTargetCheckBox.setAttribute('checked', camera.lockedTarget ? 'true' : 'false');

    camera.onAfterCheckInputsObservable.add(() => {
      const position = [camera.position.x, camera.position.y, camera.position.z]
      this.setInnerText(cameraPositionSpan, this.arrayToString(position));
      this.setInnerText(cameraAlphaSpan, camera.alpha.toFixed(4));
      this.setInnerText(cameraBetaSpan, camera.beta.toFixed(4));
      this.setInnerText(cameraRadiusSpan, camera.radius.toFixed(2));
      if (lockTargetCheckBox.checked) {
        if (!camera.lockedTarget) {
          camera.lockedTarget = this.player.mesh;
          camera.zoomToMouseLocation = false;
        }
      } else {
        if (camera.lockedTarget) {
          camera.lockedTarget = null;
          camera.zoomToMouseLocation = true;
        }
      }
    });
  }

  async bindUI() {
    if (!this.gizmoManager) return;
    await super.bindUI();
    this.editorDiv = document.querySelector('.editor') as HTMLDivElement;
    this.editModeCheckBox = document.querySelector('.edit-mode-enabled') as HTMLInputElement;
    this.controlsToggle = document.querySelectorAll('.editor > .editor-controls') as NodeListOf<HTMLDivElement>;

    this.meshNameSpan = document.querySelector('.editor-controls .mesh-name') as HTMLDivElement;
    this.transformCheckBox = document.querySelector('.transform-enabled') as HTMLInputElement;
    this.scalingCheckBox = document.querySelector('.scaling-enabled') as HTMLInputElement;
    this.rotationCheckBox = document.querySelector('.rotation-enabled') as HTMLInputElement;

    this.positionValueDiv = document.querySelector('.transform-value') as HTMLDivElement;
    this.rotationValueDiv = document.querySelector('.rotation-value') as HTMLDivElement;
    this.scalingValueDiv = document.querySelector('.scaling-value') as HTMLDivElement;

    this.editorDiv.style.display = 'block';
    this.editModeCheckBox.checked =  true;

    this.editModeCheckBox.addEventListener('click', () => {
      if (!this.gizmoManager) return;
      this.gizmoManager.attachableMeshes = this.gizmoManager.attachableMeshes === null ? [] : null;
      this.gizmoManager.attachToMesh(null);
      this.controlsToggle.forEach(x => x.style.display = x.style.display === 'none' ? 'flex' : 'none');
      this.updateEditorSelection(null);
    });

    this.bindMeshInfoUI();
    this.bindCameraInfoUI();
    this.rootElement = this.editorDiv;
  }
}