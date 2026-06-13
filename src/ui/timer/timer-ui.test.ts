import { describe, expect, it, vi } from 'vitest';
import { TimerUI } from './timer-ui';

type TimerPlayer = {
  checkpoints: unknown[];
  level: {
    timer: {
      getTimeAsString: () => string;
    };
  };
};

describe('TimerUI', () => {
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
});
