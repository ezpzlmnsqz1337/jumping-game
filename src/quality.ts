import * as BABYLON from '@babylonjs/core';

export type QualityTier = 'low' | 'medium' | 'high';
export type QualitySetting = 'auto' | QualityTier;

export function detectQualityTier(): QualityTier {
  const cores = navigator.hardwareConcurrency;
  const isTouchDevice =
    window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints ?? 0) > 0;

  if ((!cores || cores <= 4) && isTouchDevice) {
    return 'low';
  }

  if (isTouchDevice) {
    return 'medium';
  }

  return 'high';
}

export function resolveQualityTier(setting: QualitySetting): QualityTier {
  if (setting === 'auto') {
    return detectQualityTier();
  }
  return setting;
}

export function applyEngineQuality(engine: BABYLON.Engine, tier: QualityTier): void {
  const scalingLevel: Record<QualityTier, number> = {
    low: 1.5,
    medium: 1.25,
    high: 1,
  };

  engine.setHardwareScalingLevel(scalingLevel[tier]);
}

export function shouldEnableAntialias(tier: QualityTier): boolean {
  return tier !== 'low';
}

export function hardwareScalingCapForTier(tier: QualityTier): number {
  const caps: Record<QualityTier, number> = {
    low: 2,
    medium: 1.5,
    high: 1,
  };

  return caps[tier];
}
