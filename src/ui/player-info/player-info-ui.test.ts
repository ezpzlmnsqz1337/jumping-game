import { describe, expect, it } from 'vitest';
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
  ui.hSpeedDiv = document.createElement('div');
  ui.vSpeedDiv = document.createElement('div');
  ui.movingDiv = document.createElement('div');
  ui.jumpingDiv = document.createElement('div');
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

  it('updateUI renders moving and jumping states with classes', () => {
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

    expect(ui.movingDiv.innerText).toBe('Yes');
    expect(ui.movingDiv.classList.contains('yes')).toBe(true);
    expect(ui.movingDiv.classList.contains('no')).toBe(false);
    expect(ui.jumpingDiv.innerText).toBe('No');
    expect(ui.jumpingDiv.classList.contains('no')).toBe(true);
    expect(ui.jumpingDiv.classList.contains('yes')).toBe(false);
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

    expect(ui.movingDiv.innerText).toBe('Yes');
    expect(ui.movingDiv.classList.contains('yes')).toBe(true);
    expect(ui.jumpingDiv.innerText).toBe('Yes');
    expect(ui.jumpingDiv.classList.contains('yes')).toBe(true);
  });

  it('show toggles root element display using flex', () => {
    const player: PlayerInfoTestPlayer = {
      moving: false,
      jumping: false,
      physics: {
        body: {
          getLinearVelocity: () => ({ x: 0, y: 0, z: 0 }),
        },
      },
    };

    const ui = new PlayerInfoUI({} as never, player as never);
    ui.rootElement = document.createElement('div');

    ui.show(true);
    expect(ui.rootElement.style.display).toBe('flex');

    ui.show(false);
    expect(ui.rootElement.style.display).toBe('none');
  });
});
