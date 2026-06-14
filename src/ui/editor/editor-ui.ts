import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { AbstractUI } from '../abstract-ui';
import { MyArcRotateCamera } from '../../cameras/arc-rotate-camera';
import { GameStorage } from '../../game-storage';
import gameRoot from '../../game-root';
import { isLevelDocument } from '../../level-document';
import { renderingCanvas } from '../ui-manager';

export type GizmoType = 'position' | 'rotation' | 'scaling';

export class EditorUI extends AbstractUI {
  editorDiv!: HTMLDivElement;
  levelSourceSpan!: HTMLSpanElement;
  levelNameValueSpan!: HTMLSpanElement;
  wallsValueSpan!: HTMLSpanElement;
  triggersValueSpan!: HTMLSpanElement;
  exportLevelButton!: HTMLButtonElement;
  importLevelButton!: HTMLButtonElement;
  importLevelInput!: HTMLInputElement;
  clearLevelImportButton!: HTMLButtonElement;

  meshNameSpan!: HTMLDivElement;
  meshDetailFields!: Record<string, HTMLSpanElement>;
  sectionTabButtons!: NodeListOf<HTMLButtonElement>;
  sectionTabContents!: NodeListOf<HTMLDivElement>;
  detailTabButtons!: NodeListOf<HTMLButtonElement>;
  detailTabContents!: NodeListOf<HTMLDivElement>;
  triggerTabButton!: HTMLButtonElement;
  transformCheckBox!: HTMLInputElement;
  scalingCheckBox!: HTMLInputElement;
  rotationCheckBox!: HTMLInputElement;
  cameraTriggersCheckBox!: HTMLInputElement;

  positionValueDiv!: HTMLDivElement;
  rotationValueDiv!: HTMLDivElement;
  scalingValueDiv!: HTMLDivElement;

  gizmoManager?: BABYLON.GizmoManager;

  oldMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;

  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  private setEditModeEnabled(enabled: boolean) {
    this.editorDiv.style.display = enabled ? 'flex' : 'none';

    if (enabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }

    if (!this.gizmoManager) return;

    this.gizmoManager.attachableMeshes = enabled ? null : [];
    this.gizmoManager.attachToMesh(null);

    if (enabled) {
      this.gizmoManager.positionGizmoEnabled = this.transformCheckBox.checked;
      this.gizmoManager.rotationGizmoEnabled = this.rotationCheckBox.checked;
      this.gizmoManager.scaleGizmoEnabled = this.scalingCheckBox.checked;
    } else {
      this.gizmoManager.positionGizmoEnabled = false;
      this.gizmoManager.rotationGizmoEnabled = false;
      this.gizmoManager.scaleGizmoEnabled = false;
    }

    this.updateEditorSelection(null);
    this.updateSelectedMeshInfo(null);
  }

  private updateLevelInfo() {
    const level = GameStorage.getLevel();

    if (!level) {
      this.levelSourceSpan.innerText = 'hardcoded';
      this.levelNameValueSpan.innerText = 'Level1';
      this.wallsValueSpan.innerText = '-';
      this.triggersValueSpan.innerText = '-';
      return;
    }

    this.levelSourceSpan.innerText = 'imported JSON';
    this.levelNameValueSpan.innerText = level.name;
    this.wallsValueSpan.innerText = String(level.walls.length);
    this.triggersValueSpan.innerText = String(
      level.startTriggers.length +
        level.endTriggers.length +
        level.teleports.length +
        level.triggers.length
    );
  }

  constructor(scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) {
    super(scene, 'editor', player);
    this.gizmoManager = gizmoManager;
  }

  private formatVector3(v: BABYLON.Vector3) {
    return `[${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}]`;
  }

  private formatQuaternion(q: BABYLON.Quaternion) {
    return `[${q.x.toFixed(3)}, ${q.y.toFixed(3)}, ${q.z.toFixed(3)}, ${q.w.toFixed(3)}]`;
  }

  private updateSelectedMeshInfo(mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
    const set = (key: string, value: string) => {
      const field = this.meshDetailFields[key];
      if (!field) return;
      field.innerText = value;
    };

    if (!mesh) {
      set('mesh-type', '-');
      set('mesh-name', '-');
      set('mesh-id', '-');
      set('position', '-');
      set('rotation', '-');
      set('scaling', '-');
      set('bounds', '-');
      set('visible', '-');
      set('collisions', '-');
      set('material-alpha', '-');
      set('material-roughness', '-');
      set('material-texture', '-');
      set('physics-mode', '-');
      set('physics-shape', '-');
      set('physics-mass', '-');
      set('physics-friction', '-');
      set('physics-restitution', '-');
      set('trigger-type', '-');
      set('trigger-debug', '-');
      set('trigger-camera', '-');
      this.triggerTabButton.classList.remove('show');
      return;
    }

    const metadata = (mesh.metadata || {}) as Record<string, unknown>;
    const concreteMesh = mesh as BABYLON.Mesh;

    const rotationQuaternion =
      mesh.rotationQuaternion ||
      BABYLON.Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z);

    set('mesh-type', metadata.triggerType ? 'trigger' : mesh.name);
    set('mesh-name', mesh.name);
    set('mesh-id', mesh.id);
    set('position', this.formatVector3(mesh.position));
    set('rotation', this.formatQuaternion(rotationQuaternion));
    set('scaling', this.formatVector3(mesh.scaling));
    set('visible', String(mesh.isVisible));
    set('collisions', String(concreteMesh.checkCollisions));

    const boundsSize = concreteMesh.getBoundingInfo().boundingBox.extendSize.scale(2);
    set('bounds', this.formatVector3(boundsSize));

    const material = mesh.material as BABYLON.StandardMaterial | null;
    if (material) {
      set('material-alpha', material.alpha?.toFixed(2) ?? 'n/a');
      set('material-roughness', material.roughness?.toFixed(2) ?? 'n/a');
      if (material.diffuseTexture) {
        set('material-texture', material.diffuseTexture.name || 'assigned');
      } else {
        set('material-texture', '-');
      }
    } else {
      set('material-alpha', '-');
      set('material-roughness', '-');
      set('material-texture', '-');
    }

    const physicsSettings = metadata.physicsSettings as
      | { mass?: number; friction?: number; restitution?: number; shape?: string }
      | undefined;

    if (physicsSettings) {
      set('physics-mode', 'metadata');
      set('physics-shape', String(physicsSettings.shape ?? 'n/a'));
      set('physics-mass', String(physicsSettings.mass ?? 'n/a'));
      set('physics-friction', String(physicsSettings.friction ?? 'n/a'));
      set('physics-restitution', String(physicsSettings.restitution ?? 'n/a'));
    } else {
      set('physics-mode', concreteMesh.physicsBody ? 'physics body attached' : 'none');
      set('physics-shape', '-');
      set('physics-mass', '-');
      set('physics-friction', '-');
      set('physics-restitution', '-');
    }

    if (metadata.triggerType || metadata.debugType) {
      const triggerType = String(metadata.triggerType || 'generic');
      const debugType = String(metadata.debugType || 'trigger');
      const cameraTarget = metadata.cameraTarget as
        | { alpha?: number; beta?: number; radius?: number; speed?: number }
        | undefined;

      this.triggerTabButton.classList.add('show');
      set('trigger-type', triggerType);
      set('trigger-debug', debugType);
      if (cameraTarget) {
        set(
          'trigger-camera',
          `a=${cameraTarget.alpha?.toFixed(3)}, b=${cameraTarget.beta?.toFixed(3)}, r=${cameraTarget.radius?.toFixed(2)}, s=${cameraTarget.speed ?? 'n/a'}`
        );
      } else {
        set('trigger-camera', '-');
      }
    } else if (metadata.wallType) {
      const opts = (metadata.opts || {}) as Record<string, unknown>;

      this.triggerTabButton.classList.remove('show');
      set('trigger-type', '-');
      set('trigger-debug', '-');
      set('trigger-camera', '-');

      const wallSuffix = `${String(metadata.wallType)} | tex=${String(metadata.textureVariant || 'dark')}`;
      set('mesh-type', `wall (${wallSuffix})`);

      const width = typeof opts.width === 'number' ? opts.width : undefined;
      const height = typeof opts.height === 'number' ? opts.height : undefined;
      const depth = typeof opts.depth === 'number' ? opts.depth : undefined;
      if (width !== undefined || height !== undefined || depth !== undefined) {
        set('bounds', `w=${width ?? '-'} h=${height ?? '-'} d=${depth ?? '-'}`);
      }
    } else {
      this.triggerTabButton.classList.remove('show');
      set('trigger-type', '-');
      set('trigger-debug', '-');
      set('trigger-camera', '-');
    }
  }

  private setupTabNavigation() {
    this.sectionTabButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const sectionName = button.getAttribute('data-tab-section');
        if (!sectionName) return;

        this.sectionTabButtons.forEach(btn => btn.classList.remove('active'));
        this.sectionTabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const content = document.querySelector(
          `.editor .editor-tab-content[data-tab-section="${sectionName}"]`
        ) as HTMLDivElement;
        if (content) {
          content.classList.add('active');
        }
      });
    });

    this.detailTabButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const tabName = button.getAttribute('data-tab');
        if (!tabName) return;

        this.detailTabButtons.forEach(btn => btn.classList.remove('active'));
        this.detailTabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const content = document.querySelector(
          `.editor .tab-content[data-tab="${tabName}"]`
        ) as HTMLDivElement;
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }

  updateMeshDetails(gizmoType: GizmoType, htmlElement: HTMLDivElement) {
    if (!this.gizmoManager?.attachedMesh)
      return gizmoType === 'rotation' ? '[0, 0, 0, 0]' : '[0, 0, 0]';
    const gizmo =
      this.gizmoManager.attachedMesh![gizmoType === 'rotation' ? 'rotationQuaternion' : gizmoType];

    if (!gizmo) return;
    const value = [gizmo.x, gizmo.y, gizmo.z];
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
      this.updateMeshDetails('position', this.positionValueDiv);
      this.updateMeshDetails('rotation', this.rotationValueDiv);
      this.updateMeshDetails('scaling', this.scalingValueDiv);
      this.updateSelectedMeshInfo(newMesh);

      if (!newMesh) return;

      this.updateEditorSelection(newMesh);
    });

    this.gizmoManager.gizmos.positionGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('position', this.positionValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
    });
    this.gizmoManager.gizmos.positionGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('position', this.positionValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
    });

    this.gizmoManager.gizmos.rotationGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('rotation', this.rotationValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
    });
    this.gizmoManager.gizmos.rotationGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('rotation', this.rotationValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
    });

    this.gizmoManager.gizmos.scaleGizmo?.onDragEndObservable.add(() => {
      this.updateMeshDetails('scaling', this.scalingValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
    });
    this.gizmoManager.gizmos.scaleGizmo?.onDragObservable.add(() => {
      this.updateMeshDetails('scaling', this.scalingValueDiv);
      this.updateSelectedMeshInfo(this.gizmoManager?.attachedMesh || null);
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
    const cameraPositionSpan = document.querySelector(
      '.editor .camera-position .value'
    ) as HTMLSpanElement;
    const cameraAlphaSpan = document.querySelector(
      '.editor .camera-alpha .value'
    ) as HTMLSpanElement;
    const cameraBetaSpan = document.querySelector('.editor .camera-beta .value') as HTMLSpanElement;
    const cameraRadiusSpan = document.querySelector(
      '.editor .camera-radius .value'
    ) as HTMLSpanElement;
    const lockTargetCheckBox = document.querySelector(
      '.editor .lock-target-enabled'
    ) as HTMLInputElement;

    const camera = this.scene.activeCamera as MyArcRotateCamera;

    if (!camera) return;

    lockTargetCheckBox.setAttribute('checked', camera.lockedTarget ? 'true' : 'false');

    camera.onAfterCheckInputsObservable.add(() => {
      const position = [camera.position.x, camera.position.y, camera.position.z];
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

  private toggleCameraTriggers() {
    const show = this.cameraTriggersCheckBox.checked;
    this.scene.meshes?.forEach(mesh => {
      const debugType = (mesh.metadata as { debugType?: string } | undefined)?.debugType;
      if (debugType === 'camera-trigger') {
        mesh.isVisible = show;
      }
    });
    renderingCanvas?.focus();
  }

  async bindUI() {
    if (!this.gizmoManager) return;
    await super.bindUI();
    this.editorDiv = document.querySelector('.editor') as HTMLDivElement;
    this.levelSourceSpan = document.querySelector('.level-source') as HTMLSpanElement;
    this.levelNameValueSpan = document.querySelector('.level-name-value') as HTMLSpanElement;
    this.wallsValueSpan = document.querySelector('.walls-value') as HTMLSpanElement;
    this.triggersValueSpan = document.querySelector('.triggers-value') as HTMLSpanElement;
    this.exportLevelButton = document.querySelector('.export-level') as HTMLButtonElement;
    this.importLevelButton = document.querySelector('.import-level') as HTMLButtonElement;
    this.importLevelInput = document.querySelector('.import-level-input') as HTMLInputElement;
    this.clearLevelImportButton = document.querySelector(
      '.clear-level-import'
    ) as HTMLButtonElement;

    this.meshNameSpan = document.querySelector('.editor-controls .mesh-name') as HTMLDivElement;
    this.sectionTabButtons = document.querySelectorAll(
      '.editor .editor-tab-button'
    ) as NodeListOf<HTMLButtonElement>;
    this.sectionTabContents = document.querySelectorAll(
      '.editor .editor-tab-content'
    ) as NodeListOf<HTMLDivElement>;
    this.detailTabButtons = document.querySelectorAll(
      '.editor .tab-button'
    ) as NodeListOf<HTMLButtonElement>;
    this.detailTabContents = document.querySelectorAll(
      '.editor .tab-content'
    ) as NodeListOf<HTMLDivElement>;
    this.triggerTabButton = document.querySelector(
      '.editor .tab-button.trigger-tab'
    ) as HTMLButtonElement;
    this.meshDetailFields = {
      'mesh-type': document.querySelector('.detail-mesh-type') as HTMLSpanElement,
      'mesh-name': document.querySelector('.detail-mesh-name') as HTMLSpanElement,
      'mesh-id': document.querySelector('.detail-mesh-id') as HTMLSpanElement,
      position: document.querySelector('.detail-position') as HTMLSpanElement,
      rotation: document.querySelector('.detail-rotation') as HTMLSpanElement,
      scaling: document.querySelector('.detail-scaling') as HTMLSpanElement,
      bounds: document.querySelector('.detail-bounds') as HTMLSpanElement,
      visible: document.querySelector('.detail-visible') as HTMLSpanElement,
      collisions: document.querySelector('.detail-collisions') as HTMLSpanElement,
      'material-alpha': document.querySelector('.detail-material-alpha') as HTMLSpanElement,
      'material-roughness': document.querySelector('.detail-material-roughness') as HTMLSpanElement,
      'material-texture': document.querySelector('.detail-material-texture') as HTMLSpanElement,
      'physics-mode': document.querySelector('.detail-physics-mode') as HTMLSpanElement,
      'physics-shape': document.querySelector('.detail-physics-shape') as HTMLSpanElement,
      'physics-mass': document.querySelector('.detail-physics-mass') as HTMLSpanElement,
      'physics-friction': document.querySelector('.detail-physics-friction') as HTMLSpanElement,
      'physics-restitution': document.querySelector(
        '.detail-physics-restitution'
      ) as HTMLSpanElement,
      'trigger-type': document.querySelector('.detail-trigger-type') as HTMLSpanElement,
      'trigger-debug': document.querySelector('.detail-trigger-debug') as HTMLSpanElement,
      'trigger-camera': document.querySelector('.detail-trigger-camera') as HTMLSpanElement,
    };
    this.transformCheckBox = document.querySelector('.transform-enabled') as HTMLInputElement;
    this.scalingCheckBox = document.querySelector('.scaling-enabled') as HTMLInputElement;
    this.rotationCheckBox = document.querySelector('.rotation-enabled') as HTMLInputElement;

    this.positionValueDiv = document.querySelector('.transform-value') as HTMLDivElement;
    this.rotationValueDiv = document.querySelector('.rotation-value') as HTMLDivElement;
    this.scalingValueDiv = document.querySelector('.scaling-value') as HTMLDivElement;

    this.editorDiv.style.display = 'none';
    this.updateLevelInfo();

    this.exportLevelButton.addEventListener('click', () => {
      if (!gameRoot.level) return;
      GameStorage.downloadLevel(gameRoot.level);
    });

    this.importLevelButton.addEventListener('click', () => {
      this.importLevelInput.click();
    });

    this.importLevelInput.addEventListener('change', async () => {
      const file = this.importLevelInput.files?.[0];
      if (!file) return;

      try {
        const fileContent = await file.text();
        const parsed = JSON.parse(fileContent) as unknown;
        if (!isLevelDocument(parsed)) return;

        GameStorage.saveLevelDocument(parsed);
        window.location.reload();
      } catch {
        return;
      }
    });

    this.clearLevelImportButton.addEventListener('click', () => {
      GameStorage.clearLevel();
      window.location.reload();
    });

    this.setupTabNavigation();
    this.bindMeshInfoUI();
    this.bindCameraInfoUI();

    this.cameraTriggersCheckBox = document.querySelector(
      '.camera-triggers-enabled'
    ) as HTMLInputElement;
    this.cameraTriggersCheckBox.checked = false;
    this.cameraTriggersCheckBox.addEventListener('click', () => {
      this.toggleCameraTriggers();
    });
    this.toggleCameraTriggers();

    const gameSettingsEditMode = document.querySelector(
      '.game-settings .edit-mode-enabled-global'
    ) as HTMLInputElement | null;
    this.setEditModeEnabled(gameSettingsEditMode?.checked ?? true);

    window.addEventListener('editor-edit-mode-changed', event => {
      const customEvent = event as CustomEvent<{ enabled?: boolean }>;
      this.setEditModeEnabled(Boolean(customEvent.detail?.enabled));
    });

    this.rootElement = this.editorDiv;
  }

  private startAutoSave() {
    if (this.autoSaveTimer) return;
    this.autoSaveTimer = setInterval(() => {
      if (!gameRoot.level || !gameRoot.level.scene) return;
      try {
        const doc = gameRoot.level.serialize();
        GameStorage.saveLevelDocument(doc);
      } catch {
        // Silently fail auto-save
      }
    }, 30000);
  }

  private stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
