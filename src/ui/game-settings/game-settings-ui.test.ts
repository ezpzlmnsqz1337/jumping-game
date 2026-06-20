import { beforeEach, describe, expect, it, vi } from 'vitest';

type SettingsPlayer = {
  collisionEnabled: boolean;
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
    localStorage.removeItem('autoCameraEnabled');
    localStorage.removeItem('followCameraEnabled');
    localStorage.removeItem('collisionsEnabled');
    localStorage.removeItem('playerInfoVisible');
    localStorage.removeItem('editModeEnabled');
  });

  it('toggleAutomaticCamera flips automatic camera state and checkbox', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const activeCamera: SettingsCamera = {
      automaticCameraEnabled: false,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };

    const scene = { activeCamera };
    const player: SettingsPlayer = { collisionEnabled: true };
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

    const ui = new GameSettingsUI(scene as never, { collisionEnabled: true } as never);
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

  it('togglePlayerInfo delegates visibility to PlayerInfo UI', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const show = vi.fn();
    gameRoot.uiManager = {
      playerInfoUI: { show },
    } as never;

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
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

    const player = { collisionEnabled: false } as SettingsPlayer;
    const ui = new GameSettingsUI({} as never, player as never);
    ui.collissionsCheckBox = document.createElement('input');

    ui.toggleCollissions();

    expect(toggleCollissions).toHaveBeenCalledTimes(1);
    expect(ui.collissionsCheckBox.checked).toBe(false);
  });

  it('toggleEditMode dispatches editor edit mode event', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.editModeCheckBox = document.createElement('input');
    ui.editModeCheckBox.checked = false;

    const listener = vi.fn();
    window.addEventListener('editor-edit-mode-changed', listener);

    ui.toggleEditMode();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('bindUI initializes checkboxes and wires click handlers', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier">
        <option value="auto">Auto</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
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

    const player = { collisionEnabled: true } as SettingsPlayer;
    const ui = new GameSettingsUI(scene as never, player as never);

    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    const toggleAutomaticSpy = vi.spyOn(ui, 'toggleAutomaticCamera');
    const toggleFollowSpy = vi.spyOn(ui, 'toggleFollowCamera');
    const toggleCollissionsSpy = vi.spyOn(ui, 'toggleCollissions');
    const togglePlayerInfoSpy = vi.spyOn(ui, 'togglePlayerInfo');
    const toggleEditModeSpy = vi.spyOn(ui, 'toggleEditMode');

    await ui.bindUI();

    expect(ui.automaticCameraCheckBox.checked).toBe(true);
    expect(ui.collissionsCheckBox.checked).toBe(true);
    expect(ui.playerInfoCheckBox.checked).toBe(false);
    expect(ui.rootElement).toBe(ui.gameSettingsDiv);
    expect(toggleEditModeSpy).toHaveBeenCalledTimes(1);

    ui.automaticCameraCheckBox.click();
    ui.followCameraCheckBox.click();
    ui.collissionsCheckBox.click();
    ui.playerInfoCheckBox.click();
    ui.editModeCheckBox.click();

    expect(toggleAutomaticSpy).toHaveBeenCalled();
    expect(toggleFollowSpy).toHaveBeenCalled();
    expect(toggleCollissionsSpy).toHaveBeenCalled();
    expect(togglePlayerInfoSpy).toHaveBeenCalled();
    expect(toggleEditModeSpy).toHaveBeenCalledTimes(2);
  });

  it('hides edit mode checkbox when gizmoManager is not available', async () => {
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <div class="game-settings"></div>
      <select class="quality-tier">
        <option value="auto">Auto</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const scene = {
      activeCamera: { automaticCameraEnabled: true },
      getCameraByName: vi.fn(),
      meshes: [],
    };

    const player = { collisionEnabled: true };
    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    const editModeDiv = document.querySelector('.edit-mode-visibility') as HTMLElement;
    expect(editModeDiv.style.display).toBe('none');
  });

  it('changeQuality saves settings, updates qualityTier, and applies engine quality for concrete tier', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    const setHardwareScalingLevel = vi.fn();
    const resize = vi.fn();
    gameRoot.engine = { setHardwareScalingLevel, resize } as never;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue', qualityTier: 'auto' };

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.changeQuality('low');

    expect(gameRoot.gameSettings.qualityTier).toBe('low');
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
    expect(gameRoot.qualityTier).toBe('low');
    expect(setHardwareScalingLevel).toHaveBeenCalledWith(1.5);
    expect(resize).toHaveBeenCalled();
  });

  it('changeQuality resolves auto to a concrete tier and applies engine quality', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const qualityModule = await import('../../quality');
    const { GameSettingsUI } = await import('./game-settings-ui');

    vi.spyOn(qualityModule, 'resolveQualityTier').mockReturnValue('medium');
    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    const setHardwareScalingLevel = vi.fn();
    const resize = vi.fn();
    gameRoot.engine = { setHardwareScalingLevel, resize } as never;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue', qualityTier: 'low' };

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.changeQuality('auto');

    expect(gameRoot.gameSettings.qualityTier).toBe('auto');
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
    expect(gameRoot.qualityTier).toBe('medium');
    expect(setHardwareScalingLevel).toHaveBeenCalledWith(1.25);
    expect(resize).toHaveBeenCalled();
  });

  it('loads default qualityTier as auto when localStorage has no qualityTier', async () => {
    localStorage.removeItem('qualityTier');
    const { GameStorage } = await import('../../game-storage');

    const settings = GameStorage.getGameSettings();
    expect(settings.qualityTier).toBe('auto');
  });

  it('toggleAutomaticCamera persists to gameSettings and saves', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    const activeCamera: SettingsCamera = {
      automaticCameraEnabled: false,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };
    const scene = { activeCamera };
    gameRoot.gameSettings = { nickname: 'test', color: 'blue' };
    const ui = new GameSettingsUI(scene as never, { collisionEnabled: true } as never);
    ui.automaticCameraCheckBox = document.createElement('input');

    ui.toggleAutomaticCamera();

    expect(gameRoot.gameSettings.autoCameraEnabled).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
  });

  it('toggleFollowCamera persists to gameSettings and saves', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
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
    gameRoot.gameSettings = { nickname: 'test', color: 'blue' };
    const ui = new GameSettingsUI(scene as never, { collisionEnabled: true } as never);
    ui.followCameraCheckBox = document.createElement('input');
    ui.automaticCameraCheckBox = document.createElement('input');

    ui.toggleFollowCamera();

    expect(gameRoot.gameSettings.followCameraEnabled).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
  });

  it('toggleCollissions persists to gameSettings and saves', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    const player = { collisionEnabled: true } as SettingsPlayer;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue' };
    const ui = new GameSettingsUI({} as never, player as never);
    ui.collissionsCheckBox = document.createElement('input');

    ui.toggleCollissions();

    expect(gameRoot.gameSettings.collisionsEnabled).toBe(false);
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
  });

  it('togglePlayerInfo persists to gameSettings and saves', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    const show = vi.fn();
    gameRoot.uiManager = { playerInfoUI: { show } } as never;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue' };
    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.playerInfoCheckBox = document.createElement('input');
    ui.playerInfoCheckBox.checked = true;

    ui.togglePlayerInfo();

    expect(gameRoot.gameSettings.playerInfoVisible).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);
  });

  it('toggleEditMode persists to gameSettings and saves', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    const saveSpy = vi.spyOn(GameStorage, 'saveGameSettings');
    gameRoot.gameSettings = { nickname: 'test', color: 'blue' };
    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.editModeCheckBox = document.createElement('input');
    ui.editModeCheckBox.checked = true;

    const listener = vi.fn();
    window.addEventListener('editor-edit-mode-changed', listener);

    ui.toggleEditMode();

    expect(gameRoot.gameSettings.editModeEnabled).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(gameRoot.gameSettings);

    window.removeEventListener('editor-edit-mode-changed', listener);
  });

  it('bindUI restores saved autoCameraEnabled when set', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const activeCamera: SettingsCamera = {
      automaticCameraEnabled: true,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };
    const scene = {
      activeCamera: activeCamera,
      getCameraByName: vi.fn(),
      meshes: [],
    };
    const player = { collisionEnabled: true };

    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
      autoCameraEnabled: false,
    };

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.automaticCameraCheckBox.checked).toBe(false);
    expect(activeCamera.automaticCameraEnabled).toBe(false);
  });

  it('bindUI restores saved followCameraEnabled by calling toggleFollowCamera', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

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
      meshes: [],
    };
    const player = { collisionEnabled: true };

    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
      followCameraEnabled: true,
    };

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    const toggleFollowSpy = vi.spyOn(ui, 'toggleFollowCamera');
    await ui.bindUI();

    expect(ui.followCameraEnabled).toBe(true);
    expect(toggleFollowSpy).toHaveBeenCalledTimes(1);
  });

  it('bindUI restores saved collisionsEnabled from gameSettings', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const scene = {
      activeCamera: { automaticCameraEnabled: true },
      getCameraByName: vi.fn(),
      meshes: [],
    };
    const player = { collisionEnabled: true };

    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
      collisionsEnabled: false,
    };

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(player.collisionEnabled).toBe(false);
    expect(ui.collissionsCheckBox.checked).toBe(false);
  });

  it('bindUI restores saved playerInfoVisible and calls playerInfo show', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const scene = {
      activeCamera: { automaticCameraEnabled: true },
      getCameraByName: vi.fn(),
      meshes: [],
    };
    const player = { collisionEnabled: true };
    const show = vi.fn();
    gameRoot.uiManager = { playerInfoUI: { show } } as never;
    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
      playerInfoVisible: true,
    };

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.playerInfoCheckBox.checked).toBe(true);
    expect(show).toHaveBeenCalledWith(true);
  });

  it('bindUI restores saved editModeEnabled as false and dispatches enabled=false', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const scene = {
      activeCamera: { automaticCameraEnabled: true },
      getCameraByName: vi.fn(),
      meshes: [],
    };
    const player = { collisionEnabled: true };

    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
      editModeEnabled: false,
    };

    const listener = vi.fn();
    window.addEventListener('editor-edit-mode-changed', listener);

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.editModeCheckBox.checked).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.enabled).toBe(false);

    window.removeEventListener('editor-edit-mode-changed', listener);
  });

  it('bindUI uses defaults when no settings saved (backwards compat)', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameSettingsUI } = await import('./game-settings-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="game-settings"></div>
      <select class="quality-tier"><option value="auto">Auto</option></select>
      <input class="automatic-camera-enabled" type="checkbox" />
      <input class="follow-camera-enabled" type="checkbox" />
      <input class="collissions-enabled" type="checkbox" />
      <input class="player-info-enabled" type="checkbox" />
      <div class="edit-mode-visibility">
        <input class="edit-mode-enabled-global" type="checkbox" />
      </div>
    `;

    const arcRotateCamera: SettingsCamera = {
      automaticCameraEnabled: true,
      storeState: vi.fn(),
      restoreState: vi.fn(),
    };
    const scene = {
      activeCamera: arcRotateCamera,
      getCameraByName: vi.fn(),
      meshes: [],
    };
    const player = { collisionEnabled: true };

    gameRoot.gameSettings = {
      nickname: 'test',
      color: 'blue',
    };

    const listener = vi.fn();
    window.addEventListener('editor-edit-mode-changed', listener);

    const ui = new GameSettingsUI(scene as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.automaticCameraCheckBox.checked).toBe(true);
    expect(ui.followCameraEnabled).toBe(false);
    expect(ui.followCameraCheckBox.checked).toBe(false);
    expect(ui.collissionsCheckBox.checked).toBe(true);
    expect(ui.playerInfoCheckBox.checked).toBe(false);
    expect(ui.editModeCheckBox.checked).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.enabled).toBe(true);

    window.removeEventListener('editor-edit-mode-changed', listener);
  });

  it('changeQuality calls recreateShadowsForTier on active level', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    vi.spyOn(GameStorage, 'saveGameSettings');
    const setHardwareScalingLevel = vi.fn();
    const resize = vi.fn();
    gameRoot.engine = { setHardwareScalingLevel, resize } as never;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue', qualityTier: 'auto' };
    const recreateSpy = vi.fn();
    gameRoot.level = { recreateShadowsForTier: recreateSpy } as never;

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    ui.changeQuality('low');

    expect(recreateSpy).toHaveBeenCalledWith('low');
  });

  it('changeQuality handles null level without error', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { GameStorage } = await import('../../game-storage');
    const { GameSettingsUI } = await import('./game-settings-ui');

    vi.spyOn(GameStorage, 'saveGameSettings');
    const setHardwareScalingLevel = vi.fn();
    const resize = vi.fn();
    gameRoot.engine = { setHardwareScalingLevel, resize } as never;
    gameRoot.gameSettings = { nickname: 'test', color: 'blue', qualityTier: 'auto' };
    gameRoot.level = null;

    const ui = new GameSettingsUI({} as never, { collisionEnabled: true } as never);
    expect(() => ui.changeQuality('low')).not.toThrow();
  });
});
