import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  detectQualityTier,
  resolveQualityTier,
  hardwareScalingCapForTier,
  shouldEnableAntialias,
} from './quality';

describe('quality tier detection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockCapabilities(coarse: boolean, cores: number, touchPoints: number) {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: cores,
      configurable: true,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: touchPoints,
      configurable: true,
    });
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)' ? coarse : false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
  }

  it('returns low when cores <= 4 and device has coarse pointer', () => {
    mockCapabilities(true, 4, 1);
    expect(detectQualityTier()).toBe('low');
  });

  it('returns low when cores is falsy and device has touch points', () => {
    mockCapabilities(true, undefined as never, 2);
    expect(detectQualityTier()).toBe('low');
  });

  it('returns low when cores <= 4 and device has maxTouchPoints > 0', () => {
    mockCapabilities(false, 4, 1);
    expect(detectQualityTier()).toBe('low');
  });

  it('returns medium when cores > 4 but device is touch-capable', () => {
    mockCapabilities(true, 8, 1);
    expect(detectQualityTier()).toBe('medium');
  });

  it('returns medium when device has maxTouchPoints but fine pointer', () => {
    mockCapabilities(false, 8, 1);
    expect(detectQualityTier()).toBe('medium');
  });

  it('returns high for desktop-class devices', () => {
    mockCapabilities(false, 8, 0);
    expect(detectQualityTier()).toBe('high');
  });

  it('returns high for powerful desktop with no touch', () => {
    mockCapabilities(false, 16, 0);
    expect(detectQualityTier()).toBe('high');
  });
});

describe('resolveQualityTier', () => {
  it('returns the concrete tier when not auto', () => {
    expect(resolveQualityTier('low')).toBe('low');
    expect(resolveQualityTier('medium')).toBe('medium');
    expect(resolveQualityTier('high')).toBe('high');
  });

  it('resolves auto to a detected tier', () => {
    const result = resolveQualityTier('auto');
    expect(['low', 'medium', 'high']).toContain(result);
  });
});

describe('hardwareScalingCapForTier', () => {
  it('returns 2 for low', () => {
    expect(hardwareScalingCapForTier('low')).toBe(2);
  });

  it('returns 1.5 for medium', () => {
    expect(hardwareScalingCapForTier('medium')).toBe(1.5);
  });

  it('returns 1 for high', () => {
    expect(hardwareScalingCapForTier('high')).toBe(1);
  });
});

describe('shouldEnableAntialias', () => {
  it('returns false for low', () => {
    expect(shouldEnableAntialias('low')).toBe(false);
  });

  it('returns true for medium', () => {
    expect(shouldEnableAntialias('medium')).toBe(true);
  });

  it('returns true for high', () => {
    expect(shouldEnableAntialias('high')).toBe(true);
  });
});
