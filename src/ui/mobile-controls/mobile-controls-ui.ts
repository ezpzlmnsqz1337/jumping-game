import * as BABYLON from '@babylonjs/core';
import { GameControls, KeyStatus } from '../../controls';
import { PlayerEntity } from '../../entities/player-entity';
import gameRoot from '../../game-root';
import { AbstractUI } from '../abstract-ui';

/** Movement/turning/jumping buttons that map to keyStatus booleans */
const KEY_STATUS_MAP: Record<string, keyof KeyStatus> = {
  'btn-forward': 'KeyW',
  'btn-back': 'KeyS',
  'btn-left': 'KeyA',
  'btn-right': 'KeyD',
  'btn-turn-left': 'Comma',
  'btn-turn-right': 'Period',
  'btn-jump': 'Space',
};

/** Utility actions — fire-and-forget, no keyStatus */
type UtilityAction = (controls: GameControls, player: PlayerEntity) => void;

const UTILITY_ACTIONS: Record<string, UtilityAction> = {
  'btn-respawn': (c, p) => {
    if (p.status !== 'playing') return;
    c.handleRespawn('KeyR', p);
  },
  'btn-chat': (c, p) => {
    if (p.status === 'in_lobby') return;
    c.handleOpenChat('KeyT');
  },
  'btn-lobby': (_c: GameControls, _p: PlayerEntity) => {
    // Player status check is done inside openLobby()
    gameRoot.uiManager?.lobbyUI.openLobby();
  },
};

export class MobileControlsUI extends AbstractUI {
  private controlsResizeObserver: ResizeObserver | null = null;
  private hudVisible = true;
  private fullscreenButton: HTMLButtonElement | null = null;

  /** Returns true if the device has a coarse primary pointer (touch). */
  static isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'mobile-controls', player);
  }

  private updateControlsHeight(height: number): void {
    document.body.style.setProperty('--mobile-controls-height', `${height}px`);
  }

  private toggleHud(): void {
    this.hudVisible = !this.hudVisible;
    const show = this.hudVisible;

    gameRoot.uiManager?.gameSettingsUI.show(show);
    gameRoot.uiManager?.timeTableUI.show(show);
  }

  private async toggleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        this.updateFullscreenButtonLabel();
      } catch {
        // Fullscreen may be blocked by browser — silently ignore
      }
    } else {
      try {
        await document.exitFullscreen();
        this.updateFullscreenButtonLabel();
      } catch {
        // ignore
      }
    }
  }

  private updateFullscreenButtonLabel(): void {
    if (!this.fullscreenButton) return;
    const label = document.fullscreenElement ? 'Exit FS' : '⛶';
    this.fullscreenButton.textContent = label;
  }

  private handleFullscreenChange = (): void => {
    this.updateFullscreenButtonLabel();
  };

  private handleContextMenu = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('.controls-btn')) {
      e.preventDefault();
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.releaseAllKeys();
    }
  };

  async bindUI(): Promise<void> {
    await super.bindUI();

    const root = document.querySelector('.mobile-controls') as HTMLElement;
    if (!root) return;
    this.rootElement = root;

    // Observe the controls overlay height so chat and other UI can offset accordingly
    this.controlsResizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.updateControlsHeight(entry.contentRect.height);
      }
    });
    this.controlsResizeObserver.observe(root);
    // Set initial height immediately
    this.updateControlsHeight(root.offsetHeight);

    // Bind movement/turning/jumping buttons → keyStatus
    for (const [id, key] of Object.entries(KEY_STATUS_MAP)) {
      const btn = document.getElementById(id) as HTMLButtonElement | null;
      if (!btn) continue;

      btn.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        gameRoot.controls?.setKeyStatus(key, true);
      });

      btn.addEventListener('pointerup', () => {
        gameRoot.controls?.setKeyStatus(key, false);
      });

      btn.addEventListener('pointercancel', () => {
        gameRoot.controls?.setKeyStatus(key, false);
      });
    }

    // Bind utility buttons (respawn, chat) → direct method calls
    for (const [id, action] of Object.entries(UTILITY_ACTIONS)) {
      const btn = document.getElementById(id) as HTMLButtonElement | null;
      if (!btn) continue;

      btn.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        const controls = gameRoot.controls;
        const player = gameRoot.player;
        if (controls && player) {
          action(controls, player);
        }
      });
    }

    // Bind HUD toggle button
    const hudBtn = document.getElementById('btn-toggle-hud') as HTMLButtonElement | null;
    if (hudBtn) {
      hudBtn.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        hudBtn.setPointerCapture(e.pointerId);
        this.toggleHud();
      });
    }

    // Bind fullscreen button
    this.fullscreenButton = document.getElementById('btn-fullscreen') as HTMLButtonElement | null;
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        this.fullscreenButton!.setPointerCapture(e.pointerId);
        void this.toggleFullscreen();
      });
      // Listen for fullscreen changes from other sources (e.g., browser toolbar)
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    }

    // Prevent long-press context menu on all control buttons (Android Chrome, etc.)
    document.addEventListener('contextmenu', this.handleContextMenu);

    // Release all keys when page visibility changes (e.g., user switches apps)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  destroy(): void {
    this.controlsResizeObserver?.disconnect();
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private releaseAllKeys(): void {
    const controls = gameRoot.controls;
    if (!controls) return;
    for (const key of Object.values(KEY_STATUS_MAP) as (keyof KeyStatus)[]) {
      controls.setKeyStatus(key, false);
    }
  }
}
