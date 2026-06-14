import { beforeEach, describe, expect, it, vi } from 'vitest';

type LobbyTestPlayer = {
  status: 'in_chat' | 'playing' | 'in_lobby' | 'afk';
  color: string;
  changeNickname: (nickname: string) => void;
  changeColor?: (color: string) => Promise<void>;
};

type TestCamera = {
  name: string;
  alpha: number;
  beta: number;
  radius: number;
  useAutoRotationBehavior: boolean;
  setMoveToTarget: (alpha: number, beta: number, radius: number, frames: number) => void;
};

describe('LobbyUI', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    document.body.innerHTML = '<canvas id="render-canvas"></canvas>';
    localStorage.clear();
  });

  it('play shows validation error when nickname is empty', async () => {
    const { LobbyUI } = await import('./lobby-ui');

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 1,
      beta: 1,
      radius: 6,
      useAutoRotationBehavior: true,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'in_lobby',
      color: 'blue',
      changeNickname: vi.fn(),
    };

    const ui = new LobbyUI({ activeCamera: camera } as never, player as never);
    ui.nicknameInput = document.createElement('input');
    ui.nicknameInput.value = '';
    ui.nicknameErrorText = document.createElement('span');
    ui.nicknameErrorText.style.display = 'none';

    (ui as any).confirmPlay();

    expect(ui.nicknameInput.classList.contains('invalid')).toBe(true);
    expect(ui.nicknameErrorText.style.display).toBe('block');
    expect(player.changeNickname).not.toHaveBeenCalled();
  });

  it('play persists nickname and color and closes lobby when valid', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { LobbyUI } = await import('./lobby-ui');

    // Make gameRoot.level match default selectedLevelName so confirmPlay doesn't reload
    Object.defineProperty(gameRoot, 'level', {
      value: { name: 'level1' },
      writable: true,
      configurable: true,
    });

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 1,
      beta: 1,
      radius: 6,
      useAutoRotationBehavior: true,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'in_lobby',
      color: 'red',
      changeNickname: vi.fn(),
    };

    const ui = new LobbyUI({ activeCamera: camera } as never, player as never);
    ui.nicknameInput = document.createElement('input');
    ui.nicknameInput.value = 'very-long-player-name';
    ui.nicknameErrorText = document.createElement('span');
    ui.nicknameErrorText.style.display = 'block';

    const closeSpy = vi.spyOn(ui, 'closeLobby').mockImplementation(() => {});

    (ui as any).confirmPlay();

    expect(localStorage.getItem('color')).toBe('red');
    expect(localStorage.getItem('nickname')).toBe('very-long-playe');
    expect(player.changeNickname).toHaveBeenCalledWith('very-long-playe');
    expect(closeSpy).toHaveBeenCalled();
    expect(camera.useAutoRotationBehavior).toBe(false);
    expect(ui.nicknameErrorText.style.display).toBe('none');
    expect(ui.nicknameInput.classList.contains('invalid')).toBe(false);
  });

  it('openLobby and closeLobby toggle visibility and player status', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { LobbyUI } = await import('./lobby-ui');

    const openSound = { name: 'open-lobby', play: vi.fn() };
    const closeSound = { name: 'close-lobby', play: vi.fn() };

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 2,
      beta: 1,
      radius: 8,
      useAutoRotationBehavior: false,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'playing',
      color: 'blue',
      changeNickname: vi.fn(),
    };

    gameRoot.uiManager = {
      timerUI: { show: vi.fn() },
      timeTableUI: { show: vi.fn() },
      gameSettingsUI: { show: vi.fn(), toggleFollowCamera: vi.fn() },
      editorUI: { show: vi.fn() },
      performanceUI: { show: vi.fn() },
    } as never;

    const ui = new LobbyUI(
      {
        activeCamera: camera,
        sounds: [openSound, closeSound],
      } as never,
      player as never
    );

    ui.open = false;
    ui.lobbyDiv = document.createElement('div');
    ui.lobbyButtonDiv = document.createElement('div');
    ui.lobbyDiv.style.display = 'none';
    ui.lobbyButtonDiv.style.display = 'block';

    ui.openLobby();

    expect(ui.open).toBe(true);
    expect(ui.lobbyDiv.style.display).toBe('block');
    expect(ui.lobbyButtonDiv.style.display).toBe('none');
    expect(player.status).toBe('in_lobby');
    expect(camera.useAutoRotationBehavior).toBe(true);
    expect(openSound.play).toHaveBeenCalled();

    ui.closeLobby();

    expect(ui.open).toBe(false);
    expect(ui.lobbyDiv.style.display).toBe('none');
    expect(ui.lobbyButtonDiv.style.display).toBe('block');
    expect(player.status).toBe('playing');
    expect(camera.useAutoRotationBehavior).toBe(false);
    expect(closeSound.play).toHaveBeenCalled();
  });

  it('play is a no-op while player is in chat', async () => {
    const { LobbyUI } = await import('./lobby-ui');

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 1,
      beta: 1,
      radius: 6,
      useAutoRotationBehavior: true,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'in_chat',
      color: 'blue',
      changeNickname: vi.fn(),
    };

    const ui = new LobbyUI({ activeCamera: camera } as never, player as never);
    ui.nicknameInput = document.createElement('input');
    ui.nicknameInput.value = 'valid-name';
    ui.nicknameErrorText = document.createElement('span');
    ui.nicknameErrorText.style.display = 'none';

    const closeSpy = vi.spyOn(ui, 'closeLobby').mockImplementation(() => {});

    (ui as any).confirmPlay();

    expect(player.changeNickname).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('nickname')).toBeNull();
  });

  it('closeLobby switches follow camera back when flag is set', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { LobbyUI } = await import('./lobby-ui');

    const toggleFollowCamera = vi.fn();
    gameRoot.uiManager = {
      timerUI: { show: vi.fn() },
      timeTableUI: { show: vi.fn() },
      gameSettingsUI: { show: vi.fn(), toggleFollowCamera },
      editorUI: { show: vi.fn() },
      performanceUI: { show: vi.fn() },
    } as never;

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 1,
      beta: 1,
      radius: 6,
      useAutoRotationBehavior: true,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'in_lobby',
      color: 'blue',
      changeNickname: vi.fn(),
    };

    const ui = new LobbyUI({ activeCamera: camera, sounds: [] } as never, player as never);
    ui.open = true;
    ui.switchCameraOnClose = true;
    ui.lobbyDiv = document.createElement('div');
    ui.lobbyButtonDiv = document.createElement('div');

    ui.closeLobby();

    expect(toggleFollowCamera).toHaveBeenCalledTimes(1);
    expect(ui.switchCameraOnClose).toBe(false);
  });

  it('bindUI wires controls and applies game settings', async () => {
    const { LobbyUI } = await import('./lobby-ui');

    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="lobby-wrapper">
        <div class="lobby">
          <div class="lm-view active" data-view="play">
            <h2>Select Level</h2>
            <div class="level-select"><div class="level-list"></div></div>
            <div class="dev-only">
              <input class="new-level-name" />
              <button class="create-level-btn">Create</button>
              <button class="import-level-btn">Import</button>
              <input class="import-level-input" style="display:none" />
              <div class="stored-level-list"></div>
            </div>
          </div>
          <div class="player-setup">
            <div class="nickname">
              <input class="nickname-input" />
              <span class="error"></span>
            </div>
            <div class="player-color">
              <div class="colors">
                <div class="green"></div>
                <div class="blue"></div>
              </div>
            </div>
            <button class="play-btn">Play</button>
          </div>
        </div>
      </div>
      <div class="ui-buttons"><div class="settings"></div></div>
    `;

    const { GameStorage } = await import('../../game-storage');
    vi.spyOn(GameStorage, 'getGameSettings').mockReturnValue({
      nickname: 'neo',
      color: 'green',
      newlyCreated: true,
    });

    const camera: TestCamera = {
      name: 'arcCamera',
      alpha: 1,
      beta: 1,
      radius: 6,
      useAutoRotationBehavior: true,
      setMoveToTarget: vi.fn(),
    };

    const player: LobbyTestPlayer = {
      status: 'in_lobby',
      color: 'blue',
      changeNickname: vi.fn(),
      changeColor: vi.fn(async () => {}),
    };

    const ui = new LobbyUI({ activeCamera: camera } as never, player as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.nicknameInput.value).toBe('neo');
    expect(
      (document.querySelector('.green') as HTMLDivElement).classList.contains('selected')
    ).toBe(true);

    (document.querySelector('.green') as HTMLDivElement).click();
    expect(player.changeColor).toHaveBeenCalled();
  });
});
