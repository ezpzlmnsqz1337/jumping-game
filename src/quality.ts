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

const QUALITY_CONFIG: Record<QualityTier, { baseScaling: number; optimizerCap: number }> = {
  low: { baseScaling: 1.5, optimizerCap: 2 },
  medium: { baseScaling: 1.25, optimizerCap: 1.5 },
  high: { baseScaling: 1, optimizerCap: 1 },
};

export function applyEngineQuality(engine: BABYLON.Engine, tier: QualityTier): void {
  engine.setHardwareScalingLevel(QUALITY_CONFIG[tier].baseScaling);
}

export function shouldEnableAntialias(tier: QualityTier): boolean {
  return tier !== 'low';
}

export function hardwareScalingCapForTier(tier: QualityTier): number {
  return QUALITY_CONFIG[tier].optimizerCap;
}
