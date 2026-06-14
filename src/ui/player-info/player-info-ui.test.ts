import { describe, expect, it, vi } from 'vitest';
import { PlayerInfoUI } from './player-info-ui';

type Velocity = { x: number; y: number; z: number };

type PlayerInfoTestPlayer = {
  moving: boolean;
  jumping: boolean;
  physics: {
    body: {
      getLinearVelocity: () => Velocity;
    };
  };
};

function createUiWith(player: PlayerInfoTestPlayer) {
  const ui = new PlayerInfoUI({} as never, player as never);
  ui.hSpeedDiv = document.createElement('span');
  ui.vSpeedDiv = document.createElement('span');
  ui.movingBadge = document.createElement('span');
  ui.jumpingBadge = document.createElement('span');
  ui.fpsValueDiv = document.createElement('span');
  ui.perfMonitor = { enable: vi.fn(), sampleFrame: vi.fn(), instantaneousFPS: 60 } as never;
  return ui;
}

describe('PlayerInfoUI', () => {
  it('updateUI renders horizontal and vertical speed values', () => {
    const player: PlayerInfoTestPlayer = {
      moving: false,
      jumping: false,
      physics: {
        body: {
          getLinearVelocity: () => ({ x: 3, y: 4, z: 4 }),
        },
      },
    };

    const ui = createUiWith(player);
    ui.updateUI();

    expect(ui.hSpeedDiv.innerText).toBe('5.00');
    expect(ui.vSpeedDiv.innerText).toBe('4.00');
  });

  it('updateUI reflects moving and jumping states via active class', () => {
    const player: PlayerInfoTestPlayer = {
      moving: true,
      jumping: false,
      physics: {
        body: {
          getLinearVelocity: () => ({ x: 0, y: 0, z: 0 }),
        },
      },
    };

    const ui = createUiWith(player);
    ui.updateUI();

    expect(ui.movingBadge.classList.contains('active')).toBe(true);
    expect(ui.jumpingBadge.classList.contains('active')).toBe(false);
  });

  it('updateUI reflects changed moving and jumping states', () => {
    const player: PlayerInfoTestPlayer = {
      moving: false,
      jumping: false,
      physics: {
        body: {
          getLinearVelocity: () => ({ x: 0, y: 0, z: 0 }),
        },
      },
    };

    const ui = createUiWith(player);
    ui.updateUI();

    player.moving = true;
    player.jumping = true;
    ui.updateUI();

    expect(ui.movingBadge.classList.contains('active')).toBe(true);
    expect(ui.jumpingBadge.classList.contains('active')).toBe(true);
  });

  it('toggle shows and hides the element', () => {
    const ui = new PlayerInfoUI({} as never, {} as never);
    ui.rootElement = document.createElement('div');

    ui.toggle();
    expect(ui.rootElement.style.display).toBe('flex');

    ui.toggle();
    expect(ui.rootElement.style.display).toBe('none');
  });

  it('updateUI refreshes fps text when interval elapsed', () => {
    const player: PlayerInfoTestPlayer = {
      moving: false,
      jumping: false,
      physics: {
        body: {
          getLinearVelocity: () => ({ x: 0, y: 0, z: 0 }),
        },
      },
    };

    const ui = createUiWith(player);
    ui.fpsValueDiv.innerText = '0';
    ui.fpsUpdateIntervalMs = 1000;
    ui.lastFpsUpdate = 0;

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(500);
    ui.updateUI();
    expect(ui.fpsValueDiv.innerText).toBe('0');

    nowSpy.mockReturnValue(1500);
    ui.updateUI();
    expect(ui.fpsValueDiv.innerText).toBe('60');
    expect(ui.lastFpsUpdate).toBe(1500);
  });
});
