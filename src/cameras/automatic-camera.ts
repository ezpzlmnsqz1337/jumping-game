export interface AutomaticCamera {
  automaticCameraEnabled: boolean;
  
  setMoveToTarget(targetAlpha: number, targetBeta: number, targetRadius: number, speed: number): void;
  moveToTarget(): void;
}