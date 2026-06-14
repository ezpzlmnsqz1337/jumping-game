import * as BABYLON from '@babylonjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GameStorage } from '../../game-storage';
import gameRoot from '../../game-root';
import { EditorUI } from './editor-ui';

type GizmoMesh = {
  position: BABYLON.Vector3;
  scaling: BABYLON.Vector3;
  rotationQuaternion: BABYLON.Quaternion;
};

type GizmoManagerMock = {
  attachableMeshes: unknown[] | null;
  attachToMesh: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void;
  positionGizmoEnabled: boolean;
  rotationGizmoEnabled: boolean;
  scaleGizmoEnabled: boolean;
};

type ObservableMock<T> = {
  add: (cb: T) => void;
};

function createUi() {
  const ui = new EditorUI({} as never, {} as never, undefined);
  ui.editorDiv = document.createElement('div');
  ui.levelSourceSpan = document.createElement('span');
  ui.levelNameValueSpan = document.createElement('span');
  ui.wallsValueSpan = document.createElement('span');
  ui.triggersValueSpan = document.createElement('span');
  ui.transformCheckBox = document.createElement('input');
  ui.rotationCheckBox = document.createElement('input');
  ui.scalingCheckBox = document.createElement('input');
  ui.cameraTriggersCheckBox = document.createElement('input');
  ui.transformCheckBox.checked = true;
  ui.rotationCheckBox.checked = false;
  ui.scalingCheckBox.checked = true;
  ui.triggerTabButton = document.createElement('button');
  ui.positionValueDiv = document.createElement('div');
  ui.rotationValueDiv = document.createElement('div');
  ui.scalingValueDiv = document.createElement('div');
  ui.meshDetailFields = {
    'mesh-type': document.createElement('span'),
    'mesh-name': document.createElement('span'),
    'mesh-id': document.createElement('span'),
    position: document.createElement('span'),
    rotation: document.createElement('span'),
    scaling: document.createElement('span'),
    bounds: document.createElement('span'),
    visible: document.createElement('span'),
    collisions: document.createElement('span'),
    'material-alpha': document.createElement('span'),
    'material-roughness': document.createElement('span'),
    'material-texture': document.createElement('span'),
    'physics-mode': document.createElement('span'),
    'physics-shape': document.createElement('span'),
    'physics-mass': document.createElement('span'),
    'physics-friction': document.createElement('span'),
    'physics-restitution': document.createElement('span'),
    'trigger-type': document.createElement('span'),
    'trigger-debug': document.createElement('span'),
    'trigger-camera': document.createElement('span'),
  };
  return ui;
}

function renderBindDom() {
  document.body.innerHTML = `
    <canvas id="render-canvas"></canvas>
    <div class="editor">
      <span class="level-source"></span>
      <span class="level-name-value"></span>
      <span class="walls-value"></span>
      <span class="triggers-value"></span>
      <button class="export-level"></button>
      <button class="import-level"></button>
      <input class="import-level-input" type="file" />
      <button class="clear-level-import"></button>

      <div class="editor-controls"><div class="mesh-name"></div></div>

      <button class="editor-tab-button" data-tab-section="a"></button>
      <div class="editor-tab-content" data-tab-section="a"></div>
      <button class="tab-button" data-tab="x"></button>
      <button class="tab-button trigger-tab" data-tab="trigger"></button>
      <div class="tab-content" data-tab="x"></div>

      <span class="detail-mesh-type"></span>
      <span class="detail-mesh-name"></span>
      <span class="detail-mesh-id"></span>
      <span class="detail-position"></span>
      <span class="detail-rotation"></span>
      <span class="detail-scaling"></span>
      <span class="detail-bounds"></span>
      <span class="detail-visible"></span>
      <span class="detail-collisions"></span>
      <span class="detail-material-alpha"></span>
      <span class="detail-material-roughness"></span>
      <span class="detail-material-texture"></span>
      <span class="detail-physics-mode"></span>
      <span class="detail-physics-shape"></span>
      <span class="detail-physics-mass"></span>
      <span class="detail-physics-friction"></span>
      <span class="detail-physics-restitution"></span>
      <span class="detail-trigger-type"></span>
      <span class="detail-trigger-debug"></span>
      <span class="detail-trigger-camera"></span>

      <input class="transform-enabled" type="checkbox" />
      <input class="scaling-enabled" type="checkbox" />
      <input class="rotation-enabled" type="checkbox" />
      <input class="camera-triggers-enabled" type="checkbox" />

      <div class="transform-value"></div>
      <div class="rotation-value"></div>
      <div class="scaling-value"></div>

      <div class="camera-position"><span class="value"></span></div>
      <div class="camera-alpha"><span class="value"></span></div>
      <div class="camera-beta"><span class="value"></span></div>
      <div class="camera-radius"><span class="value"></span></div>
      <input class="lock-target-enabled" type="checkbox" />
    </div>
    <div class="game-settings"><input class="edit-mode-enabled-global" type="checkbox" checked /></div>
  `;
}

describe('EditorUI', () => {
  it('bindUI returns early when gizmo manager is missing', async () => {
    const ui = new EditorUI({} as never, {} as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.loadCss).not.toHaveBeenCalled();
    expect(ui.loadHtml).not.toHaveBeenCalled();
    expect(ui.rootElement).toBeUndefined();
  });

  it('setEditModeEnabled toggles gizmo state and editor visibility', () => {
    const ui = createUi();
    const attachToMesh = vi.fn();

    const gizmoManager: GizmoManagerMock = {
      attachableMeshes: null,
      attachToMesh,
      positionGizmoEnabled: false,
      rotationGizmoEnabled: false,
      scaleGizmoEnabled: false,
    };
    ui.gizmoManager = gizmoManager as unknown as BABYLON.GizmoManager;

    (ui as unknown as { setEditModeEnabled: (enabled: boolean) => void }).setEditModeEnabled(true);

    expect(ui.editorDiv.style.display).toBe('flex');
    expect(gizmoManager.attachableMeshes).toBeNull();
    expect(attachToMesh).toHaveBeenCalledWith(null);
    expect(gizmoManager.positionGizmoEnabled).toBe(true);
    expect(gizmoManager.rotationGizmoEnabled).toBe(false);
    expect(gizmoManager.scaleGizmoEnabled).toBe(true);

    (ui as unknown as { setEditModeEnabled: (enabled: boolean) => void }).setEditModeEnabled(false);

    expect(ui.editorDiv.style.display).toBe('none');
    expect(gizmoManager.attachableMeshes).toEqual([]);
    expect(gizmoManager.positionGizmoEnabled).toBe(false);
    expect(gizmoManager.rotationGizmoEnabled).toBe(false);
    expect(gizmoManager.scaleGizmoEnabled).toBe(false);
  });

  it('updateMeshDetails formats attached transform values', () => {
    const ui = createUi();
    const mesh: GizmoMesh = {
      position: new BABYLON.Vector3(1, 2, 3),
      scaling: new BABYLON.Vector3(4, 5, 6),
      rotationQuaternion: new BABYLON.Quaternion(0.1, 0.2, 0.3, 0.4),
    };

    ui.gizmoManager = {
      attachedMesh: mesh,
    } as never;

    const positionDiv = document.createElement('div');
    const rotationDiv = document.createElement('div');

    ui.updateMeshDetails('position', positionDiv);
    ui.updateMeshDetails('rotation', rotationDiv);

    expect(positionDiv.innerText).toBe('[ 1.00, 2.00, 3.00 ]');
    expect(rotationDiv.innerText).toBe('[ 0.10, 0.20, 0.30, 0.40 ]');
  });

  it('updateMeshDetails returns default value when no mesh is attached', () => {
    const ui = createUi();
    ui.gizmoManager = { attachedMesh: null } as never;
    const div = document.createElement('div');

    const rotation = ui.updateMeshDetails('rotation', div);
    const position = ui.updateMeshDetails('position', div);

    expect(rotation).toBe('[0, 0, 0, 0]');
    expect(position).toBe('[0, 0, 0]');
  });

  it('updateEditorSelection restores previous mesh and highlights new one', () => {
    const ui = createUi();

    const oldMaterial = { emissiveColor: BABYLON.Color3.Blue() } as BABYLON.StandardMaterial;
    const newMaterial = { emissiveColor: BABYLON.Color3.Black() } as BABYLON.StandardMaterial;
    const oldMesh = { material: oldMaterial } as unknown as BABYLON.AbstractMesh;
    const newMesh = { material: newMaterial } as unknown as BABYLON.AbstractMesh;

    ui.oldMesh = oldMesh;
    ui.updateEditorSelection(newMesh);

    expect(oldMaterial.emissiveColor.r).toBe(BABYLON.Color3.Black().r);
    expect(oldMaterial.emissiveColor.g).toBe(BABYLON.Color3.Black().g);
    expect(oldMaterial.emissiveColor.b).toBe(BABYLON.Color3.Black().b);
    expect(newMaterial.emissiveColor.r).toBe(BABYLON.Color3.Blue().r);
    expect(newMaterial.emissiveColor.g).toBe(BABYLON.Color3.Blue().g);
    expect(newMaterial.emissiveColor.b).toBe(BABYLON.Color3.Blue().b);
    expect(ui.oldMesh).toBe(newMesh);
  });

  it('updateSelectedMeshInfo resets fields when no mesh is selected', () => {
    const ui = createUi();

    (
      ui as unknown as {
        updateSelectedMeshInfo: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void;
      }
    ).updateSelectedMeshInfo(null);

    expect(ui.meshDetailFields['mesh-type'].innerText).toBe('-');
    expect(ui.meshDetailFields['mesh-name'].innerText).toBe('-');
    expect(ui.meshDetailFields['trigger-type'].innerText).toBe('-');
    expect(ui.triggerTabButton.classList.contains('show')).toBe(false);
  });

  it('updateSelectedMeshInfo renders trigger metadata details', () => {
    const ui = createUi();

    const mesh = {
      name: 'trigger-mesh',
      id: 'mesh-1',
      position: new BABYLON.Vector3(1, 2, 3),
      scaling: new BABYLON.Vector3(2, 2, 2),
      rotationQuaternion: new BABYLON.Quaternion(0, 0, 0, 1),
      rotation: { x: 0, y: 0, z: 0 },
      isVisible: true,
      metadata: {
        triggerType: 'camera',
        debugType: 'camera-trigger',
        cameraTarget: { alpha: 1, beta: 2, radius: 3, speed: 50 },
        physicsSettings: { shape: 'box', mass: 1, friction: 0.5, restitution: 0.1 },
      },
      material: {
        alpha: 0.8,
        roughness: 0.2,
        diffuseTexture: { name: 'tex.png' },
      },
      checkCollisions: true,
      physicsBody: null,
      getBoundingInfo: () => ({
        boundingBox: { extendSize: new BABYLON.Vector3(1, 2, 3) },
      }),
    } as unknown as BABYLON.Mesh;

    (
      ui as unknown as {
        updateSelectedMeshInfo: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void;
      }
    ).updateSelectedMeshInfo(mesh);

    expect(ui.meshDetailFields['mesh-type'].innerText).toBe('trigger');
    expect(ui.meshDetailFields['mesh-name'].innerText).toBe('trigger-mesh');
    expect(ui.meshDetailFields['trigger-type'].innerText).toBe('camera');
    expect(ui.meshDetailFields['physics-mode'].innerText).toBe('metadata');
    expect(ui.triggerTabButton.classList.contains('show')).toBe(true);
  });

  it('updateSelectedMeshInfo renders wall metadata details', () => {
    const ui = createUi();

    const mesh = {
      name: 'wall-mesh',
      id: 'mesh-2',
      position: new BABYLON.Vector3(1, 2, 3),
      scaling: new BABYLON.Vector3(1, 1, 1),
      rotationQuaternion: new BABYLON.Quaternion(0, 0, 0, 1),
      rotation: { x: 0, y: 0, z: 0 },
      isVisible: true,
      metadata: {
        wallType: 'solid',
        textureVariant: 'dark',
        opts: { width: 10, height: 2, depth: 1 },
      },
      material: null,
      checkCollisions: false,
      physicsBody: null,
      getBoundingInfo: () => ({
        boundingBox: { extendSize: new BABYLON.Vector3(1, 1, 1) },
      }),
    } as unknown as BABYLON.Mesh;

    (
      ui as unknown as {
        updateSelectedMeshInfo: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void;
      }
    ).updateSelectedMeshInfo(mesh);

    expect(ui.meshDetailFields['mesh-type'].innerText).toContain('wall (solid | tex=dark)');
    expect(ui.meshDetailFields['bounds'].innerText).toBe('w=10 h=2 d=1');
    expect(ui.triggerTabButton.classList.contains('show')).toBe(false);
  });

  it('setupTabNavigation toggles active section and detail tabs', () => {
    const ui = createUi();

    document.body.innerHTML = `
      <div class="editor">
        <button class="editor-tab-button" data-tab-section="s1"></button>
        <button class="editor-tab-button" data-tab-section="s2"></button>
        <div class="editor-tab-content" data-tab-section="s1"></div>
        <div class="editor-tab-content" data-tab-section="s2"></div>
        <button class="tab-button" data-tab="t1"></button>
        <button class="tab-button" data-tab="t2"></button>
        <div class="tab-content" data-tab="t1"></div>
        <div class="tab-content" data-tab="t2"></div>
      </div>
    `;

    ui.sectionTabButtons = document.querySelectorAll(
      '.editor .editor-tab-button'
    ) as NodeListOf<HTMLButtonElement>;
    ui.sectionTabContents = document.querySelectorAll(
      '.editor .editor-tab-content'
    ) as NodeListOf<HTMLDivElement>;
    ui.detailTabButtons = document.querySelectorAll(
      '.editor .tab-button'
    ) as NodeListOf<HTMLButtonElement>;
    ui.detailTabContents = document.querySelectorAll(
      '.editor .tab-content'
    ) as NodeListOf<HTMLDivElement>;

    (ui as unknown as { setupTabNavigation: () => void }).setupTabNavigation();

    ui.sectionTabButtons[1].click();
    expect(ui.sectionTabButtons[1].classList.contains('active')).toBe(true);
    expect(
      (
        document.querySelector(
          '.editor .editor-tab-content[data-tab-section="s2"]'
        ) as HTMLDivElement
      ).classList.contains('active')
    ).toBe(true);

    ui.detailTabButtons[0].click();
    expect(ui.detailTabButtons[0].classList.contains('active')).toBe(true);
    expect(
      (
        document.querySelector('.editor .tab-content[data-tab="t1"]') as HTMLDivElement
      ).classList.contains('active')
    ).toBe(true);
  });

  it('bindMeshInfoUI wires gizmo toggles and snap settings', () => {
    const ui = createUi();

    const onAttached: { cb?: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void } = {};
    const onPosDrag: { cb?: () => void } = {};
    const onRotDrag: { cb?: () => void } = {};
    const onScaleDrag: { cb?: () => void } = {};

    const gizmoManager = {
      attachedMesh: null,
      positionGizmoEnabled: false,
      rotationGizmoEnabled: false,
      scaleGizmoEnabled: false,
      onAttachedToMeshObservable: {
        add: (cb: (mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void) => {
          onAttached.cb = cb;
        },
      } as ObservableMock<(mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) => void>,
      gizmos: {
        positionGizmo: {
          snapDistance: 0,
          onDragEndObservable: {
            add: (cb: () => void) => {
              onPosDrag.cb = cb;
            },
          },
          onDragObservable: {
            add: (cb: () => void) => {
              onPosDrag.cb = cb;
            },
          },
        },
        rotationGizmo: {
          snapDistance: 0,
          updateGizmoRotationToMatchAttachedMesh: true,
          onDragEndObservable: {
            add: (cb: () => void) => {
              onRotDrag.cb = cb;
            },
          },
          onDragObservable: {
            add: (cb: () => void) => {
              onRotDrag.cb = cb;
            },
          },
        },
        scaleGizmo: {
          onDragEndObservable: {
            add: (cb: () => void) => {
              onScaleDrag.cb = cb;
            },
          },
          onDragObservable: {
            add: (cb: () => void) => {
              onScaleDrag.cb = cb;
            },
          },
        },
      },
    } as unknown as BABYLON.GizmoManager;

    ui.gizmoManager = gizmoManager;
    ui.bindMeshInfoUI();

    expect(ui.transformCheckBox.getAttribute('checked')).toBe('true');
    expect(gizmoManager.positionGizmoEnabled).toBe(true);
    expect(gizmoManager.rotationGizmoEnabled).toBe(false);
    expect(gizmoManager.scaleGizmoEnabled).toBe(false);

    ui.scalingCheckBox.click();
    expect(gizmoManager.scaleGizmoEnabled).toBe(true);
    ui.rotationCheckBox.click();
    expect(gizmoManager.rotationGizmoEnabled).toBe(true);

    expect(gizmoManager.gizmos.positionGizmo?.snapDistance).toBe(0.1);
    expect(gizmoManager.gizmos.rotationGizmo?.snapDistance).toBe(0.1);
    expect(gizmoManager.gizmos.rotationGizmo?.updateGizmoRotationToMatchAttachedMesh).toBe(false);
    expect(Boolean(onAttached.cb)).toBe(true);
    expect(Boolean(onPosDrag.cb)).toBe(true);
    expect(Boolean(onRotDrag.cb)).toBe(true);
    expect(Boolean(onScaleDrag.cb)).toBe(true);
  });

  it('bindMeshInfoUI hides editor when gizmo manager is absent', () => {
    const ui = createUi();
    ui.gizmoManager = undefined;

    ui.bindMeshInfoUI();

    expect(ui.editorDiv.style.display).toBe('none');
  });

  it('bindCameraInfoUI updates camera spans and lock target behavior', () => {
    document.body.innerHTML = `
      <div class="editor">
        <div class="camera-position"><span class="value"></span></div>
        <div class="camera-alpha"><span class="value"></span></div>
        <div class="camera-beta"><span class="value"></span></div>
        <div class="camera-radius"><span class="value"></span></div>
        <input class="lock-target-enabled" type="checkbox" />
      </div>
    `;

    const afterInputs: { cb?: () => void } = {};
    const playerMesh = {} as BABYLON.AbstractMesh;
    const camera = {
      position: new BABYLON.Vector3(1, 2, 3),
      alpha: 0.1234,
      beta: 1.2345,
      radius: 9.876,
      lockedTarget: null as BABYLON.Nullable<BABYLON.AbstractMesh>,
      zoomToMouseLocation: true,
      onAfterCheckInputsObservable: {
        add: (cb: () => void) => {
          afterInputs.cb = cb;
        },
      },
    };

    const ui = new EditorUI({ activeCamera: camera } as never, { mesh: playerMesh } as never);
    ui.bindCameraInfoUI();

    const lockCheckBox = document.querySelector('.editor .lock-target-enabled') as HTMLInputElement;
    lockCheckBox.checked = true;
    afterInputs.cb?.();

    expect(
      (document.querySelector('.editor .camera-position .value') as HTMLSpanElement).innerText
    ).toBe('[ 1.00, 2.00, 3.00 ]');
    expect(camera.lockedTarget).toBe(playerMesh);
    expect(camera.zoomToMouseLocation).toBe(false);

    lockCheckBox.checked = false;
    afterInputs.cb?.();
    expect(camera.lockedTarget).toBeNull();
    expect(camera.zoomToMouseLocation).toBe(true);
  });

  it('bindCameraInfoUI no-ops safely without an active camera', () => {
    document.body.innerHTML = `
      <div class="editor">
        <div class="camera-position"><span class="value"></span></div>
        <div class="camera-alpha"><span class="value"></span></div>
        <div class="camera-beta"><span class="value"></span></div>
        <div class="camera-radius"><span class="value"></span></div>
        <input class="lock-target-enabled" type="checkbox" />
      </div>
    `;

    const ui = new EditorUI({ activeCamera: null } as never, {} as never);

    expect(() => ui.bindCameraInfoUI()).not.toThrow();
  });

  it('bindUI wires editor actions and reacts to edit-mode event', async () => {
    renderBindDom();

    const onAfterCheckInputsObservable = { add: vi.fn() };
    const activeCamera = {
      position: new BABYLON.Vector3(0, 0, 0),
      alpha: 0,
      beta: 0,
      radius: 10,
      lockedTarget: null,
      zoomToMouseLocation: true,
      onAfterCheckInputsObservable,
    };

    const gizmoManager = {
      attachableMeshes: null,
      attachToMesh: vi.fn(),
      positionGizmoEnabled: false,
      rotationGizmoEnabled: false,
      scaleGizmoEnabled: false,
      onAttachedToMeshObservable: { add: vi.fn() },
      gizmos: {
        positionGizmo: {
          snapDistance: 0,
          onDragEndObservable: { add: vi.fn() },
          onDragObservable: { add: vi.fn() },
        },
        rotationGizmo: {
          snapDistance: 0,
          updateGizmoRotationToMatchAttachedMesh: true,
          onDragEndObservable: { add: vi.fn() },
          onDragObservable: { add: vi.fn() },
        },
        scaleGizmo: { onDragEndObservable: { add: vi.fn() }, onDragObservable: { add: vi.fn() } },
      },
    } as never;

    const ui = new EditorUI({ activeCamera } as never, { mesh: null } as never, gizmoManager);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    const downloadSpy = vi.spyOn(GameStorage, 'downloadLevel').mockImplementation(() => {});
    const clearSpy = vi.spyOn(GameStorage, 'clearLevel').mockImplementation(() => {});
    const saveSpy = vi.spyOn(GameStorage, 'saveLevelDocument').mockImplementation(() => {});

    await ui.bindUI();

    expect(ui.rootElement).toBe(ui.editorDiv);
    expect(ui.editorDiv.style.display).toBe('flex');

    ui.importLevelButton.click();
    expect(document.querySelector('.import-level-input')).toBeTruthy();

    gameRoot.level = null;
    ui.exportLevelButton.click();
    expect(downloadSpy).not.toHaveBeenCalled();

    gameRoot.level = { name: 'lvl', serialize: () => ({}) } as never;
    ui.exportLevelButton.click();
    expect(downloadSpy).toHaveBeenCalledTimes(1);

    const input = ui.importLevelInput;
    Object.defineProperty(input, 'files', {
      value: [
        {
          text: async () =>
            '{"version":1,"name":"A","walls":[],"spawnPoints":[],"startTriggers":[],"endTriggers":[],"teleports":[],"triggers":[]}',
        },
      ],
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    await Promise.resolve();
    await Promise.resolve();
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(0);

    window.dispatchEvent(
      new CustomEvent('editor-edit-mode-changed', { detail: { enabled: false } })
    );
    expect(ui.editorDiv.style.display).toBe('none');
  });

  it('updateLevelInfo renders hardcoded and imported summaries', () => {
    const ui = createUi();
    ui.levelSourceSpan = document.createElement('span');

    const getLevelSpy = vi.spyOn(GameStorage, 'getLevel');

    getLevelSpy.mockReturnValueOnce(null);
    (ui as unknown as { updateLevelInfo: () => void }).updateLevelInfo();
    expect(ui.levelSourceSpan.innerText).toBe('hardcoded');
    expect(ui.levelNameValueSpan.innerText).toBe('Level1');
    expect(ui.wallsValueSpan.innerText).toBe('-');
    expect(ui.triggersValueSpan.innerText).toBe('-');

    getLevelSpy.mockReturnValueOnce({
      version: 1,
      name: 'CustomLevel',
      walls: [{}, {}],
      spawnPoints: [],
      startTriggers: [{}],
      endTriggers: [{}],
      teleports: [{}],
      triggers: [{}],
      texts: [],
      environment: {},
    } as never);

    (ui as unknown as { updateLevelInfo: () => void }).updateLevelInfo();
    expect(ui.levelSourceSpan.innerText).toBe('imported JSON');
    expect(ui.levelNameValueSpan.innerText).toBe('CustomLevel');
    expect(ui.wallsValueSpan.innerText).toBe('2');
    expect(ui.triggersValueSpan.innerText).toBe('4');
  });

  it('toggleCameraTriggers updates only trigger mesh visibility', () => {
    document.body.innerHTML = '<canvas id="render-canvas"></canvas>';

    const triggerMesh = {
      metadata: { debugType: 'camera-trigger' },
      isVisible: false,
    };
    const regularMesh = {
      metadata: { debugType: 'other' },
      isVisible: false,
    };

    const ui = new EditorUI({ meshes: [triggerMesh, regularMesh] } as never, {} as never);
    ui.cameraTriggersCheckBox = document.createElement('input');

    ui.cameraTriggersCheckBox.checked = true;
    (ui as unknown as { toggleCameraTriggers: () => void }).toggleCameraTriggers();
    expect(triggerMesh.isVisible).toBe(true);
    expect(regularMesh.isVisible).toBe(false);

    ui.cameraTriggersCheckBox.checked = false;
    (ui as unknown as { toggleCameraTriggers: () => void }).toggleCameraTriggers();
    expect(triggerMesh.isVisible).toBe(false);
    expect(regularMesh.isVisible).toBe(false);
  });
});
