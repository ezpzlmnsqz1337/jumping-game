import * as BABYLON from '@babylonjs/core';
import { GameControls } from '../../controls';
import { PlayerEntity } from '../../entities/player-entity';
import gameRoot from '../../game-root';
import { AbstractUI } from '../abstract-ui';

/** Movement/turning/jumping buttons that map to keyStatus booleans */
const KEY_STATUS_MAP: Record<string, string> = {
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
  private topbarResizeObserver: ResizeObserver | null = null;
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
    const label = document.fullscreenElement ? 'Exit FS' : '&#9974;';
    this.fullscreenButton.innerHTML = label;
  }

  private handleFullscreenChange = (): void => {
    this.updateFullscreenButtonLabel();
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

    // Observe the topbar height so scoreboard and settings can offset accordingly.
    // CSS sets the initial value via calc() — the observer refines it for edge cases.
    const topbar = document.querySelector('.controls-topbar') as HTMLElement;
    if (topbar) {
      this.topbarResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.contentRect.height > 0) {
            document.body.style.setProperty(
              '--mobile-topbar-height',
              `${entry.contentRect.height}px`
            );
          }
        }
      });
      this.topbarResizeObserver.observe(topbar);
    }

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

    // Release all keys when page visibility changes (e.g., user switches apps)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.releaseAllKeys();
      }
    });
  }

  destroy(): void {
    this.controlsResizeObserver?.disconnect();
    this.topbarResizeObserver?.disconnect();
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private releaseAllKeys(): void {
    const controls = gameRoot.controls;
    if (!controls) return;
    for (const key of Object.values(KEY_STATUS_MAP)) {
      controls.setKeyStatus(key, false);
    }
  }
}
