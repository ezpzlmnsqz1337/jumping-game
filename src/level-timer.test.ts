import { describe, expect, it, vi } from 'vitest';
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
