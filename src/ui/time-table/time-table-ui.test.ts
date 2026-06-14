import { describe, expect, it } from 'vitest';
import { TimeTableUI } from './time-table-ui';

type TimeEntry = {
  nickname: string;
  timeStr: string;
  time: number;
  checkpoints: number;
};

describe('TimeTableUI', () => {
  it('does not render when no times are provided', () => {
    const ui = new TimeTableUI({} as never, {} as never);
    ui.timesListDiv = document.createElement('div');

    ui.updateUI(new Map<string, TimeEntry>());

    expect(ui.timesListDiv.querySelectorAll('li')).toHaveLength(0);
    expect(ui.noOfTimes).toBe(0);
  });

  it('renders ordered list rows from time entries', () => {
    const ui = new TimeTableUI({} as never, {} as never);
    ui.timesListDiv = document.createElement('div');

    const times = new Map<string, TimeEntry>([
      ['1', { nickname: 'alice', timeStr: '01:10.100', time: 70100, checkpoints: 5 }],
      ['2', { nickname: 'bob', timeStr: '01:05.000', time: 65000, checkpoints: 6 }],
    ]);

    ui.updateUI(times);

    const items = ui.timesListDiv.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].innerText).toBe('01:10.100 - alice (CP: 5) ');
    expect(items[1].innerText).toBe('01:05.000 - bob (CP: 6) ');
    expect(ui.noOfTimes).toBe(2);
  });

  it('skips rerender when size has not changed', () => {
    const ui = new TimeTableUI({} as never, {} as never);
    ui.timesListDiv = document.createElement('div');

    const first = new Map<string, TimeEntry>([
      ['1', { nickname: 'alice', timeStr: '01:10.100', time: 70100, checkpoints: 5 }],
    ]);
    const secondSameSize = new Map<string, TimeEntry>([
      ['1', { nickname: 'charlie', timeStr: '00:50.000', time: 50000, checkpoints: 9 }],
    ]);

    ui.updateUI(first);
    const renderedBefore = ui.timesListDiv.innerHTML;

    ui.updateUI(secondSameSize);

    expect(ui.timesListDiv.innerHTML).toBe(renderedBefore);
    expect(ui.timesListDiv.querySelectorAll('li')).toHaveLength(1);
    expect(ui.timesListDiv.querySelector('li')?.innerText).toContain('alice');
    expect(ui.timesListDiv.querySelector('li')?.innerText).not.toContain('charlie');
  });

  it('rerenders when size changes', () => {
    const ui = new TimeTableUI({} as never, {} as never);
    ui.timesListDiv = document.createElement('div');

    ui.updateUI(
      new Map<string, TimeEntry>([
        ['1', { nickname: 'alice', timeStr: '01:10.100', time: 70100, checkpoints: 5 }],
      ])
    );

    ui.updateUI(
      new Map<string, TimeEntry>([
        ['1', { nickname: 'alice', timeStr: '01:10.100', time: 70100, checkpoints: 5 }],
        ['2', { nickname: 'bob', timeStr: '01:05.000', time: 65000, checkpoints: 6 }],
      ])
    );

    const items = ui.timesListDiv.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(ui.noOfTimes).toBe(2);
  });

  it('renders replay metadata details', () => {
    const ui = new TimeTableUI({} as never, {} as never);
    ui.replayMetadataDiv = document.createElement('div');

    ui.updateReplayMetadata({
      playerName: 'runner',
      timeMs: 45234,
      timeStr: '00:45.234',
      completedAt: '2026-01-01T00:00:00.000Z',
      mapName: 'level1',
      replayVersion: 1,
      source: 'local',
    });

    expect(ui.replayMetadataDiv.innerText).toContain('Ghost: runner');
    expect(ui.replayMetadataDiv.innerText).toContain('Time: 00:45.234');
    expect(ui.replayMetadataDiv.innerText).toContain('Map: level1');
    expect(ui.replayMetadataDiv.innerText).toContain('Source: Local record');
    expect(ui.replayMetadataDiv.innerText).toContain('Replay v1');
    expect(ui.replayMetadataDiv.style.display).toBe('block');
  });
});
