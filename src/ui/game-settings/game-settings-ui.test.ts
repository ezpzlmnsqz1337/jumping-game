import { beforeEach, describe, expect, it, vi } from 'vitest';

type SettingsPlayer = {
  collissionEnabled: boolean;
};

type SettingsCamera = {
  automaticCameraEnabled?: boolean;
  storeState: () => void;
  restoreState: () => void;
};

describe('GameSettingsUI', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    document.body.innerHTML = '<canvas id="render-canvas"></canvas>';
  });

  it('toggleAutomaticCamera flips automatic camera state and checkbox', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const activeCamera: SettingsCamera = {
      automaticCameraEnabled: false,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };

    const scene = { activeCamera };
    const player: SettingsPlayer = { collissionEnabled: true };
    const ui = new GameSettingsUI(scene as never, player as never);
    ui.automaticCameraCheckBox = document.createElement('input');

    ui.toggleAutomaticCamera();
    expect(activeCamera.automaticCameraEnabled).toBe(true);
    expect(ui.automaticCameraCheckBox.checked).toBe(true);

    ui.toggleAutomaticCamera();
    expect(activeCamera.automaticCameraEnabled).toBe(false);
    expect(ui.automaticCameraCheckBox.checked).toBe(false);
  });

  it('toggleFollowCamera switches active camera and syncs checkboxes', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const arcRotateCamera: SettingsCamera = {
      automaticCameraEnabled: true,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };
    const followCamera: SettingsCamera = {
      automaticCameraEnabled: false,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };

    const scene = {
      activeCamera: arcRotateCamera,
      getCameraByName: (name: string) =>
        name === 'arcRotateCamera'
          ? arcRotateCamera
          : name === 'followCamera'
            ? followCamera
            : null,
    };

    const ui = new GameSettingsUI(scene as never, { collissionEnabled: true } as never);
    ui.followCameraCheckBox = document.createElement('input');
    ui.automaticCameraCheckBox = document.createElement('input');

    ui.toggleFollowCamera();

    expect(scene.activeCamera).toBe(followCamera);
    expect(ui.followCameraEnabled).toBe(true);
    expect(ui.followCameraCheckBox.checked).toBe(true);
    expect(ui.automaticCameraCheckBox.checked).toBe(false);
    expect(arcRotateCamera.storeState).toHaveBeenCalledTimes(1);
    expect(followCamera.restoreState).toHaveBeenCalledTimes(1);

    ui.toggleFollowCamera();

    expect(scene.activeCamera).toBe(arcRotateCamera);
    expect(ui.followCameraEnabled).toBe(false);
    expect(ui.followCameraCheckBox.checked).toBe(false);
    expect(ui.automaticCameraCheckBox.checked).toBe(true);
    expect(followCamera.storeState).toHaveBeenCalledTimes(1);
    expect(arcRotateCamera.restoreState).toHaveBeenCalledTimes(1);
  });

  it('toggleCameraTriggers updates only trigger mesh visibility', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const triggerMesh = {
      metadata: { debugType: 'camera-trigger' },
      isVisible: false,
    };
    const regularMesh = {
      metadata: { debugType: 'other' },
      isVisible: false,
    };

    const scene = {
      meshes: [triggerMesh, regularMesh],
    };

    const ui = new GameSettingsUI(scene as never, { collissionEnabled: true } as never);
    ui.cameraTriggersCheckBox = document.createElement('input');

    ui.cameraTriggersCheckBox.checked = true;
    ui.toggleCameraTriggers();
    expect(triggerMesh.isVisible).toBe(true);
    expect(regularMesh.isVisible).toBe(false);

    ui.cameraTriggersCheckBox.checked = false;
    ui.toggleCameraTriggers();
    expect(triggerMesh.isVisible).toBe(false);
    expect(regularMesh.isVisible).toBe(false);
  });

  it('togglePlayerInfo delegates visibility to PlayerInfo UI', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const show = vi.fn();
    gameRoot.uiManager = {
      playerInfoUI: { show },
    } as never;

    const ui = new GameSettingsUI({} as never, { collissionEnabled: true } as never);
    ui.playerInfoCheckBox = document.createElement('input');

    ui.playerInfoCheckBox.checked = true;
    ui.togglePlayerInfo();
    expect(show).toHaveBeenCalledWith(true);

    ui.playerInfoCheckBox.checked = false;
    ui.togglePlayerInfo();
    expect(show).toHaveBeenLastCalledWith(false);
  });

  it('toggleCollissions delegates to multiplayer and syncs checkbox', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const toggleCollissions = vi.fn();
    gameRoot.multiplayer = { toggleCollissions } as never;

    const player = { collissionEnabled: false } as SettingsPlayer;
    const ui = new GameSettingsUI({} as never, player as never);
    ui.collissionsCheckBox = document.createElement('input');

    ui.toggleCollissions();

    expect(toggleCollissions).toHaveBeenCalledTimes(1);
    expect(ui.collissionsCheckBox.checked).toBe(false);
  });

  it('toggleEditMode dispatches editor edit mode event', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const ui = new GameSettingsUI({} as never, { collissionEnabled: true } as never);
    ui.editModeCheckBox = document.createElement('input');
    ui.editModeCheckBox.checked = false;

    const listener = vi.fn();
    window.addEventListener('editor-edit-mode-changed', listener);

    ui.toggleEditMode();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('toggleCameraTriggers safely ignores meshes without metadata', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const triggerMesh = {
      metadata: { debugType: 'camera-trigger' },
      isVisible: false,
    };
    const noMetadataMesh = {
      metadata: undefined,
      isVisible: false,
    };

    const scene = {
      meshes: [triggerMesh, noMetadataMesh],
    };

    const ui = new GameSettingsUI(scene as never, { collissionEnabled: true } as never);
    ui.cameraTriggersCheckBox = document.createElement('input');
    ui.cameraTriggersCheckBox.checked = true;

    ui.toggleCameraTriggers();

    expect(triggerMesh.isVisible).toBe(true);
    expect(noMetadataMesh.isVisible).toBe(false);
  });

  it('bindUI initializes checkboxes and wires click handlers', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <input class="camera-triggers-enabled" type="checkbox" />
      <input class="edit-mode-enabled-global" type="checkbox" />
    `;

    const arcRotateCamera = {
      automaticCameraEnabled: true,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };
    const followCamera = {
      automaticCameraEnabled: false,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };

    const scene = {
      activeCamera: arcRotateCamera,
      getCameraByName: (name: string) =>
        name === 'arcRotateCamera'
          ? arcRotateCamera
          : name === 'followCamera'
            ? followCamera
            : null,
      meshes: [],
    };

    const player = { collissionEnabled: true } as SettingsPlayer;
    const ui = new GameSettingsUI(scene as never, player as never);

    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    const toggleAutomaticSpy = vi.spyOn(ui, 'toggleAutomaticCamera');
    const toggleFollowSpy = vi.spyOn(ui, 'toggleFollowCamera');
    const toggleCollissionsSpy = vi.spyOn(ui, 'toggleCollissions');
    const togglePlayerInfoSpy = vi.spyOn(ui, 'togglePlayerInfo');
    const toggleCameraTriggersSpy = vi.spyOn(ui, 'toggleCameraTriggers');
    const toggleEditModeSpy = vi.spyOn(ui, 'toggleEditMode');

    await ui.bindUI();

    expect(ui.automaticCameraCheckBox.checked).toBe(true);
    expect(ui.collissionsCheckBox.checked).toBe(true);
    expect(ui.playerInfoCheckBox.checked).toBe(true);
    expect(ui.rootElement).toBe(ui.gameSettingsDiv);
    expect(toggleCameraTriggersSpy).toHaveBeenCalledTimes(1);
    expect(toggleEditModeSpy).toHaveBeenCalledTimes(1);

    ui.automaticCameraCheckBox.click();
    ui.followCameraCheckBox.click();
    ui.collissionsCheckBox.click();
    ui.playerInfoCheckBox.click();
    ui.cameraTriggersCheckBox.click();
    ui.editModeCheckBox.click();

    expect(toggleAutomaticSpy).toHaveBeenCalled();
    expect(toggleFollowSpy).toHaveBeenCalled();
    expect(toggleCollissionsSpy).toHaveBeenCalled();
    expect(togglePlayerInfoSpy).toHaveBeenCalled();
    expect(toggleCameraTriggersSpy).toHaveBeenCalledTimes(2);
    expect(toggleEditModeSpy).toHaveBeenCalledTimes(2);
  });
});
