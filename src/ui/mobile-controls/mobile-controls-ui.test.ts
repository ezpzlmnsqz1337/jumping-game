import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// PointerEvent polyfill for jsdom environments that lack it
// ---------------------------------------------------------------------------
if (typeof PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly twist: number;

    constructor(type: string, options: PointerEventInit = {}) {
      super(type, options);
      this.pointerId = options.pointerId ?? 0;
      this.pointerType = options.pointerType ?? 'mouse';
      this.isPrimary = options.isPrimary ?? false;
      this.width = options.width ?? 1;
      this.height = options.height ?? 1;
      this.pressure = options.pressure ?? 0;
      this.tiltX = options.tiltX ?? 0;
      this.tiltY = options.tiltY ?? 0;
      this.twist = options.twist ?? 0;
    }
  }
  (globalThis as Record<string, unknown>).PointerEvent = PointerEventPolyfill;
}

/** Minimal mock for GameControls methods used by MobileControlsUI */
type MockControls = {
  setKeyStatus: ReturnType<typeof vi.fn>;
  handleRespawn: ReturnType<typeof vi.fn>;
  handleOpenChat: ReturnType<typeof vi.fn>;
};

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function createMockControls(): MockControls {
  return {
    setKeyStatus: vi.fn(),
    handleRespawn: vi.fn(),
    handleOpenChat: vi.fn(),
  };
}

/** Inserts the mobile-controls HTML structure into document.body */
function setupMobileControlsDom(): void {
  document.body.innerHTML = `
    <div class="controls-topbar">
      <button id="btn-respawn" class="controls-btn controls-btn-topbar">R</button>
      <button id="btn-chat" class="controls-btn controls-btn-topbar">Chat</button>
      <button id="btn-toggle-hud" class="controls-btn controls-btn-topbar">HUD</button>
      <button id="btn-fullscreen" class="controls-btn controls-btn-topbar">FS</button>
      <button id="btn-lobby" class="controls-btn controls-btn-topbar">Lobby</button>
    </div>
    <div class="mobile-controls">
      <div class="mobile-controls-bottom">
        <div class="controls-dpad">
          <div class="controls-dpad-row">
            <button id="btn-forward" class="controls-btn controls-btn-dpad">W</button>
          </div>
          <div class="controls-dpad-row">
            <button id="btn-left" class="controls-btn controls-btn-dpad">A</button>
            <button id="btn-back" class="controls-btn controls-btn-dpad">S</button>
            <button id="btn-right" class="controls-btn controls-btn-dpad">D</button>
          </div>
        </div>
        <div class="controls-actions">
          <div class="controls-actions-row">
            <button id="btn-turn-left" class="controls-btn controls-btn-action">Turn L</button>
            <button id="btn-turn-right" class="controls-btn controls-btn-action">Turn R</button>
          </div>
          <div class="controls-actions-row">
            <button id="btn-jump" class="controls-btn controls-btn-action controls-btn-jump">Jump</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates a MobileControlsUI instance with stubbed CSS/HTML loading,
 * binds it, and returns the instance together with the mock controls.
 */
async function createBoundMobileControlsUi(
  controls: MockControls | null,
  playerStatus: string = 'playing'
): Promise<{ ui: import('./mobile-controls-ui').MobileControlsUI; controls: MockControls }> {
  const { MobileControlsUI } = await import('./mobile-controls-ui');
  const { default: gameRoot } = await import('../../game-root');

  setupMobileControlsDom();

  const mockControls = controls ?? createMockControls();
  gameRoot.controls = mockControls as never;
  gameRoot.player = { status: playerStatus } as never;

  const ui = new MobileControlsUI({} as never, { status: playerStatus } as never);
  ui.loadCss = vi.fn();
  ui.loadHtml = vi.fn(async () => {});
  await ui.bindUI();

  return { ui, controls: mockControls };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MobileControlsUI', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    HTMLButtonElement.prototype.setPointerCapture = vi.fn();
  });

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  it('bindUI injects HTML elements into DOM', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    setupMobileControlsDom();

    const ui = new MobileControlsUI({} as never, { status: 'playing' } as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});
    await ui.bindUI();

    expect(ui.rootElement).toBeDefined();
    expect(ui.rootElement.classList.contains('mobile-controls')).toBe(true);
  });

  // -----------------------------------------------------------------------
  // isTouchDevice
  // -----------------------------------------------------------------------

  it('isTouchDevice returns true when pointer is coarse', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    expect(MobileControlsUI.isTouchDevice()).toBe(true);
  });

  it('isTouchDevice returns false when pointer is fine', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(MobileControlsUI.isTouchDevice()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Movement / turning / jumping buttons — keyStatus mapping
  // -----------------------------------------------------------------------

  it('forwardButton_setsKeyW_onPointerDown_resetsOnPointerUp', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    const { default: gameRoot } = await import('../../game-root');
    setupMobileControlsDom();

    const controls = createMockControls();
    gameRoot.controls = controls as never;

    const ui = new MobileControlsUI({} as never, { status: 'playing' } as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});
    await ui.bindUI();

    const btn = document.getElementById('btn-forward') as HTMLButtonElement;

    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('KeyW', true);

    btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('KeyW', false);
  });

  it('backButton_setsKeyS_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-back') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('KeyS', true);
  });

  it('leftButton_setsKeyA_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-left') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('KeyA', true);
  });

  it('rightButton_setsKeyD_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-right') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('KeyD', true);
  });

  it('turnLeftButton_setsComma_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-turn-left') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('Comma', true);
  });

  it('turnRightButton_setsPeriod_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-turn-right') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('Period', true);
  });

  it('jumpButton_setsSpace_onPointerDown', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-jump') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenCalledWith('Space', true);
  });

  it('pointerCancel_releasesKey', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    const btn = document.getElementById('btn-forward') as HTMLButtonElement;

    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenLastCalledWith('KeyW', true);

    btn.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    expect(controls.setKeyStatus).toHaveBeenLastCalledWith('KeyW', false);
  });

  // -----------------------------------------------------------------------
  // setPointerCapture
  // -----------------------------------------------------------------------

  it('pointerDown_callsSetPointerCapture', async () => {
    await createBoundMobileControlsUi(null, 'playing');

    const btn = document.getElementById('btn-forward') as HTMLButtonElement;
    const setPointerCaptureSpy = vi.spyOn(btn, 'setPointerCapture');

    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 42, bubbles: true }));
    expect(setPointerCaptureSpy).toHaveBeenCalledWith(42);
  });

  // -----------------------------------------------------------------------
  // Utility buttons
  // -----------------------------------------------------------------------

  it('respawnButton_callsHandleRespawn_whenPlaying', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { controls } = await createBoundMobileControlsUi(null, 'playing');
    // createBoundMobileControlsUi sets gameRoot.player, so it's available

    const btn = document.getElementById('btn-respawn') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(controls.handleRespawn).toHaveBeenCalledWith('KeyR', gameRoot.player);
  });

  it('respawnButton_doesNothing_whenInLobby', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'in_lobby');

    const btn = document.getElementById('btn-respawn') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(controls.handleRespawn).not.toHaveBeenCalled();
  });

  it('chatButton_callsHandleOpenChat_whenPlaying', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'playing');

    const btn = document.getElementById('btn-chat') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(controls.handleOpenChat).toHaveBeenCalledWith('KeyT');
  });

  it('chatButton_doesNothing_whenInLobby', async () => {
    const { controls } = await createBoundMobileControlsUi(null, 'in_lobby');

    const btn = document.getElementById('btn-chat') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(controls.handleOpenChat).not.toHaveBeenCalled();
  });

  it('lobbyButton_callsOpenLobby', async () => {
    const { default: gameRoot } = await import('../../game-root');
    await createBoundMobileControlsUi(null, 'playing');

    const openLobby = vi.fn();
    gameRoot.uiManager = { lobbyUI: { openLobby } } as never;

    const btn = document.getElementById('btn-lobby') as HTMLButtonElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(openLobby).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Visibility change
  // -----------------------------------------------------------------------

  it('visibilityChange_releasesAllKeys_whenHidden', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    setupMobileControlsDom();

    const controls = createMockControls();
    gameRoot.controls = controls as never;

    const ui = new MobileControlsUI({} as never, { status: 'playing' } as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});
    await ui.bindUI();

    // Simulate the page becoming hidden
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    const expectedKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Comma', 'Period', 'Space'];
    for (const key of expectedKeys) {
      expect(controls.setKeyStatus).toHaveBeenCalledWith(key, false);
    }
    // Exactly 7 calls — one per key
    expect(controls.setKeyStatus).toHaveBeenCalledTimes(expectedKeys.length);
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('gameRootControlsNull_doesNotThrow', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    const { default: gameRoot } = await import('../../game-root');
    setupMobileControlsDom();

    // Explicitly set controls to null (the default after resetModules)
    gameRoot.controls = null;

    const ui = new MobileControlsUI({} as never, { status: 'playing' } as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});
    await ui.bindUI();

    const btn = document.getElementById('btn-forward') as HTMLButtonElement;

    expect(() => {
      btn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));
    }).not.toThrow();
  });

  // -----------------------------------------------------------------------
  // destroy()
  // -----------------------------------------------------------------------

  it('destroy_disconnectsResizeObservers_andRemovesDocumentListeners', async () => {
    const { ui } = await createBoundMobileControlsUi(null, 'playing');

    const disconnectSpy = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    ui.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
  });

  // -----------------------------------------------------------------------
  // toggleHud()
  // -----------------------------------------------------------------------

  it('toggleHud_hidesAndShowsGameSettingsAndTimeTable', async () => {
    const { MobileControlsUI } = await import('./mobile-controls-ui');
    const { default: gameRoot } = await import('../../game-root');
    setupMobileControlsDom();

    const controls = createMockControls();
    gameRoot.controls = controls as never;

    const showGameSettings = vi.fn();
    const showTimeTable = vi.fn();
    const hideGameSettings = vi.fn();
    const hideTimeTable = vi.fn();

    gameRoot.uiManager = {
      gameSettingsUI: { show: showGameSettings },
      timeTableUI: { show: showTimeTable },
    } as never;

    const ui = new MobileControlsUI({} as never, { status: 'playing' } as never);
    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});
    await ui.bindUI();

    // First toggle: hudVisible goes true → false
    const hudBtn = document.getElementById('btn-toggle-hud') as HTMLButtonElement;
    hudBtn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    // show(false) should be called for both
    expect(showGameSettings).toHaveBeenCalledWith(false);
    expect(showTimeTable).toHaveBeenCalledWith(false);

    // Second toggle: hudVisible goes false → true
    gameRoot.uiManager = {
      gameSettingsUI: { show: hideGameSettings },
      timeTableUI: { show: hideTimeTable },
    } as never;

    hudBtn.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }));

    expect(hideGameSettings).toHaveBeenCalledWith(true);
    expect(hideTimeTable).toHaveBeenCalledWith(true);
  });

  // -----------------------------------------------------------------------
  // contextmenu prevention
  // -----------------------------------------------------------------------

  it('contextmenu_preventedOnControlButtons', async () => {
    await createBoundMobileControlsUi(null, 'playing');

    const btn = document.getElementById('btn-forward') as HTMLButtonElement;
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('contextmenu_notPreventedOnNonControlElements', async () => {
    await createBoundMobileControlsUi(null, 'playing');

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  // -----------------------------------------------------------------------
  // updateFullscreenButtonLabel
  // -----------------------------------------------------------------------

  it('updateFullscreenButtonLabel_showsExitFS_whenFullscreen', async () => {
    const { ui } = await createBoundMobileControlsUi(null, 'playing');

    const fsBtn = document.getElementById('btn-fullscreen') as HTMLButtonElement;
    expect(fsBtn).not.toBeNull();

    // Mock document.fullscreenElement to return a truthy value
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    });
    (ui as unknown as { updateFullscreenButtonLabel: () => void }).updateFullscreenButtonLabel();
    expect(fsBtn.textContent).toBe('Exit FS');

    // Restore
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  });

  it('updateFullscreenButtonLabel_showsSailboat_whenNotFullscreen', async () => {
    const { ui } = await createBoundMobileControlsUi(null, 'playing');

    const fsBtn = document.getElementById('btn-fullscreen') as HTMLButtonElement;
    expect(fsBtn).not.toBeNull();

    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    (ui as unknown as { updateFullscreenButtonLabel: () => void }).updateFullscreenButtonLabel();
    // After Fix 7, innerHTML is replaced with textContent using the Unicode char ⛴
    expect(fsBtn.textContent).toBe('⛶');
  });
});
