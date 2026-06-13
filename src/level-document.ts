import * as BABYLON from '@babylonjs/core';

export interface SerializableVector3 {
  x: number;
  y: number;
  z: number;
}

export interface SerializableQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface SerializableCameraTarget {
  alpha: number;
  beta: number;
  radius: number;
  speed?: number;
}

export type TextureVariant = 'dark' | 'light' | 'red';

export type SerializedTriggerKind = 'generic' | 'camera' | 'jump' | 'start' | 'end' | 'teleport';

export interface SerializedWall {
  wallType: string;
  opts: Record<string, unknown>;
  textureVariant?: TextureVariant;
  scaling?: SerializableVector3;
  position: SerializableVector3;
  rotation?: SerializableQuaternion;
}

export interface SerializableColor3 {
  r: number;
  g: number;
  b: number;
}

export interface SerializedTextDecoration {
  text: string;
  position: SerializableVector3;
  rotation?: SerializableQuaternion;
  color?: SerializableColor3;
}

export interface SerializedSpawnPoint {
  name: string;
  position: SerializableVector3;
}

export interface SerializedTrigger {
  triggerType: SerializedTriggerKind;
  debugType: 'trigger' | 'camera-trigger';
  position: SerializableVector3;
  scaling: SerializableVector3;
  boxSize?: SerializableVector3;
  rotation?: SerializableQuaternion;
  isVisible: boolean;
  cameraTarget?: SerializableCameraTarget;
}

export interface SerializedTeleportTrigger extends SerializedTrigger {
  destination: SerializableVector3;
}

export interface SerializedGround {
  width: number;
  height: number;
  scaling?: SerializableVector3;
  textureVariant?: TextureVariant;
  uScale?: number;
  vScale?: number;
  roughness?: number;
  color?: SerializableColor3;
}

export interface SerializedEnvironment {
  skyboxEnabled?: boolean;
  ground?: SerializedGround;
}

export interface LevelDocument {
  version: 1;
  name: string;
  walls: SerializedWall[];
  spawnPoints: SerializedSpawnPoint[];
  startTriggers: SerializedTrigger[];
  endTriggers: SerializedTrigger[];
  teleports: SerializedTeleportTrigger[];
  triggers: SerializedTrigger[];
  texts?: SerializedTextDecoration[];
  environment?: SerializedEnvironment;
}

export const serializeVector3 = (vector: BABYLON.Vector3): SerializableVector3 => ({
  x: vector.x,
  y: vector.y,
  z: vector.z,
});

export const serializeQuaternion = (quaternion: BABYLON.Quaternion): SerializableQuaternion => ({
  x: quaternion.x,
  y: quaternion.y,
  z: quaternion.z,
  w: quaternion.w,
});

export const deserializeVector3 = (vector: SerializableVector3): BABYLON.Vector3 =>
  new BABYLON.Vector3(vector.x, vector.y, vector.z);

export const deserializeQuaternion = (quaternion: SerializableQuaternion): BABYLON.Quaternion =>
  new BABYLON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

export const serializeColor3 = (color: BABYLON.Color3): SerializableColor3 => ({
  r: color.r,
  g: color.g,
  b: color.b,
});

export const deserializeColor3 = (color: SerializableColor3): BABYLON.Color3 =>
  new BABYLON.Color3(color.r, color.g, color.b);

export const isLevelDocument = (value: unknown): value is LevelDocument => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<LevelDocument>;
  return (
    candidate.version === 1 &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.walls) &&
    Array.isArray(candidate.spawnPoints) &&
    Array.isArray(candidate.startTriggers) &&
    Array.isArray(candidate.endTriggers) &&
    Array.isArray(candidate.teleports) &&
    Array.isArray(candidate.triggers) &&
    (candidate.texts === undefined || Array.isArray(candidate.texts)) &&
    (candidate.environment === undefined || typeof candidate.environment === 'object')
  );
};
