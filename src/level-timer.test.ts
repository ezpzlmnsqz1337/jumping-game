import { describe, expect, it } from 'vitest';
import { LevelTimer } from './level-timer';

describe('LevelTimer anti-cheat validation', () => {
  it('rejects runs that are too short', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 1050; // Only 50ms

    const result = timer.isValidRun(0);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('too short');
  });

  it('rejects runs that are too long', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 1000 + 3600001; // 1 hour + 1ms

    const result = timer.isValidRun(0);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('too long');
  });

  it('rejects runs with negative checkpoint count', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 5000;

    const result = timer.isValidRun(-1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Negative');
  });

  it('rejects runs that are not in finished state', () => {
    const timer = new LevelTimer();
    timer.state = 'running';
    timer.startedAt = 1000;
    timer.finishedAt = 5000;

    const result = timer.isValidRun(0);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not finished');
  });

  it('accepts valid runs with reasonable time and checkpoints', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 65000; // 64 seconds

    const result = timer.isValidRun(5);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('accepts valid runs at boundary (100ms)', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 1100; // Exactly 100ms

    const result = timer.isValidRun(0);
    expect(result.valid).toBe(true);
  });

  it('accepts valid runs with zero checkpoints', () => {
    const timer = new LevelTimer();
    timer.state = 'finished';
    timer.startedAt = 1000;
    timer.finishedAt = 10000;

    const result = timer.isValidRun(0);
    expect(result.valid).toBe(true);
  });
});

describe('LevelTimer state machine', () => {
  it('armRun transitions from idle to armed', () => {
    const timer = new LevelTimer();
    expect(timer.state).toBe('idle');
    expect(timer.armRun()).toBe(true);
    expect(timer.state).toBe('armed');
  });

  it('armRun returns false when already running', () => {
    const timer = new LevelTimer();
    timer.state = 'running';
    expect(timer.armRun()).toBe(false);
    expect(timer.state).toBe('running');
  });

  it('startRun transitions from armed to running', () => {
    const timer = new LevelTimer();
    timer.armRun();
    const result = timer.startRun();
    expect(result).toBe(true);
    expect(timer.state).toBe('running');
    expect(timer.active).toBe(true);
  });

  it('startRun returns false when not armed', () => {
    const timer = new LevelTimer();
    expect(timer.state).toBe('idle');
    expect(timer.startRun()).toBe(false);
  });

  it('startRun returns false when already running', () => {
    const timer = new LevelTimer();
    timer.state = 'running';
    expect(timer.startRun()).toBe(false);
  });

  it('finishRun transitions from running to finished', () => {
    const timer = new LevelTimer();
    timer.state = 'running';
    timer.startedAt = Date.now();
    expect(timer.finishRun()).toBe(true);
    expect(timer.state).toBe('finished');
    expect(timer.active).toBe(false);
  });

  it('finishRun returns false when not running', () => {
    const timer = new LevelTimer();
    expect(timer.finishRun()).toBe(false);
    expect(timer.state).toBe('idle');
  });

  it('resetRun transitions any state to idle', () => {
    const timer = new LevelTimer();
    timer.state = 'running';
    timer.startedAt = 1000;
    timer.finishedAt = 5000;
    timer.resetRun();
    expect(timer.state).toBe('idle');
    expect(timer.active).toBe(false);
    expect(timer.startedAt).toBe(0);
    expect(timer.finishedAt).toBe(0);
  });

  it('getTime returns 0 when idle or armed', () => {
    const timer = new LevelTimer();
    expect(timer.state).toBe('idle');
    expect(timer.getTime()).toBe(0);
    expect(timer.getTimeAsString()).toBe('00:00.000');
  });
});
