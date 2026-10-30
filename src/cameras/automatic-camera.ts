export interface AutomaticCamera {
  automaticCameraEnabled: boolean;

  setMoveToTarget(
    targetAlpha: number,
    targetBeta: number,
    targetRadius: number,
    speed: number
  ): void;
  moveToTarget(): void;
}

/**
 * Runtime guard for the structural `AutomaticCamera` interface. Interfaces cannot be
 * used with `instanceof`, so verify the methods the caller actually relies on.
 */
export function isAutomaticCamera(value: unknown): value is AutomaticCamera {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<AutomaticCamera>;
  return (
    typeof candidate.setMoveToTarget === 'function' && typeof candidate.moveToTarget === 'function'
  );
}
