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
};

export class MobileControlsUI extends AbstractUI {
  private controlsResizeObserver: ResizeObserver | null = null;

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

    // Release all keys when page visibility changes (e.g., user switches apps)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.releaseAllKeys();
      }
    });
  }

  private releaseAllKeys(): void {
    const controls = gameRoot.controls;
    if (!controls) return;
    for (const key of Object.values(KEY_STATUS_MAP)) {
      controls.setKeyStatus(key, false);
    }
  }
}
