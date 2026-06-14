import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimerUI } from './timer-ui';
import gameRoot from '../../game-root';

type TimerPlayer = {
  checkpoints: unknown[];
  level: {
    timer: {
      getTimeAsString: () => string;
    };
  };
};

describe('TimerUI', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    gameRoot.multiplayer = undefined;
    vi.useRealTimers();
  });

  it('updateTime renders latest timer string', () => {
    const timer = { getTimeAsString: vi.fn(() => '00:10.500') };
    const player: TimerPlayer = {
      checkpoints: [],
      level: { timer },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.uiTimerDiv = document.createElement('div');

    ui.updateTime();

    expect(ui.uiTimerDiv.innerText).toBe('00:10.500');
    expect(timer.getTimeAsString).toHaveBeenCalled();
  });

  it('updateCheckpoints applies singular/plural label', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.uiCheckpointsDiv = document.createElement('div');

    ui.updateCheckpoints(1);
    expect(ui.uiCheckpointsDiv.innerText).toBe('1 checkpoint');

    ui.updateCheckpoints(3);
    expect(ui.uiCheckpointsDiv.innerText).toBe('3 checkpoints');
  });

  it('updateUI updates both timer and checkpoint count', () => {
    const player: TimerPlayer = {
      checkpoints: [{}, {}],
      level: {
        timer: { getTimeAsString: () => '01:23.456' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.uiTimerDiv = document.createElement('div');
    ui.uiCheckpointsDiv = document.createElement('div');

    ui.updateUI();

    expect(ui.uiTimerDiv.innerText).toBe('01:23.456');
    expect(ui.uiCheckpointsDiv.innerText).toBe('2 checkpoints');
  });

  it('show toggles timer root display using flex', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.rootElement = document.createElement('div');

    ui.show(true);
    expect(ui.rootElement.style.display).toBe('flex');

    ui.show(false);
    expect(ui.rootElement.style.display).toBe('none');
  });

  it('showRunStatus renders and auto-hides status message', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.runStatusDiv = document.createElement('div');

    ui.showRunStatus('finished', '00:20.000');

    expect(ui.runStatusDiv.innerText).toContain('Run finished: 00:20.000');
    expect(ui.runStatusDiv.style.display).toBe('block');
    expect(ui.runStatusDiv.className).toContain('state-finished');

    vi.advanceTimersByTime(4000);
    expect(ui.runStatusDiv.style.display).toBe('none');
  });

  it('showConnectionStatus keeps offline message visible', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.connectionStatusDiv = document.createElement('div');

    ui.showConnectionStatus('offline', 'reconnecting');

    expect(ui.connectionStatusDiv.innerText).toContain('Multiplayer disconnected (reconnecting)');
    expect(ui.connectionStatusDiv.style.display).toBe('block');
    expect(ui.connectionStatusDiv.className).toContain('state-offline');

    vi.advanceTimersByTime(10000);
    expect(ui.connectionStatusDiv.style.display).toBe('block');
  });

  it('showRunStatus includes reset detail when provided', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.runStatusDiv = document.createElement('div');

    ui.showRunStatus('reset', 'teleport');

    expect(ui.runStatusDiv.innerText).toBe('Run reset (teleport)');
  });

  it('updateUI hides connection status when multiplayer is disabled', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.uiTimerDiv = document.createElement('div');
    ui.uiCheckpointsDiv = document.createElement('div');
    ui.connectionStatusDiv = document.createElement('div');
    ui.connectionStatusDiv.style.display = 'block';

    gameRoot.multiplayer = undefined;
    ui.updateUI();

    expect(ui.connectionStatusDiv.style.display).toBe('none');
  });

  it('updateUI shows reconnecting state when multiplayer exists but room is unavailable', () => {
    const player: TimerPlayer = {
      checkpoints: [],
      level: {
        timer: { getTimeAsString: () => '00:00.000' },
      },
    };
    const ui = new TimerUI({} as never, player as never);
    ui.uiTimerDiv = document.createElement('div');
    ui.uiCheckpointsDiv = document.createElement('div');
    ui.connectionStatusDiv = document.createElement('div');
    ui.connectionStatusDiv.style.display = 'none';

    gameRoot.multiplayer = {} as never;
    ui.updateUI();

    expect(ui.connectionStatusDiv.innerText).toContain('Multiplayer disconnected (reconnecting)');
    expect(ui.connectionStatusDiv.style.display).toBe('block');
  });
});
