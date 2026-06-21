import { beforeEach, describe, expect, it } from 'vitest';
import { GameStorage } from './game-storage';

describe('GameStorage boolean settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getGameSettings returns undefined for missing boolean keys', () => {
    const settings = GameStorage.getGameSettings();
    expect(settings.autoCameraEnabled).toBeUndefined();
    expect(settings.followCameraEnabled).toBeUndefined();
    expect(settings.collisionsEnabled).toBeUndefined();
    expect(settings.playerInfoVisible).toBeUndefined();
    expect(settings.editModeEnabled).toBeUndefined();
  });

  it('getGameSettings reads saved boolean values from localStorage', () => {
    localStorage.setItem('autoCameraEnabled', 'true');
    localStorage.setItem('followCameraEnabled', 'false');
    localStorage.setItem('collisionsEnabled', 'true');
    localStorage.setItem('playerInfoVisible', 'false');
    localStorage.setItem('editModeEnabled', 'true');

    const settings = GameStorage.getGameSettings();
    expect(settings.autoCameraEnabled).toBe(true);
    expect(settings.followCameraEnabled).toBe(false);
    expect(settings.collisionsEnabled).toBe(true);
    expect(settings.playerInfoVisible).toBe(false);
    expect(settings.editModeEnabled).toBe(true);
  });

  it('saveGameSettings persists boolean fields to localStorage', () => {
    GameStorage.saveGameSettings({
      nickname: 'player',
      color: 'blue',
      autoCameraEnabled: true,
      followCameraEnabled: false,
      collisionsEnabled: true,
      playerInfoVisible: false,
      editModeEnabled: true,
    });

    expect(localStorage.getItem('autoCameraEnabled')).toBe('true');
    expect(localStorage.getItem('followCameraEnabled')).toBe('false');
    expect(localStorage.getItem('collisionsEnabled')).toBe('true');
    expect(localStorage.getItem('playerInfoVisible')).toBe('false');
    expect(localStorage.getItem('editModeEnabled')).toBe('true');
  });

  it('saveGameSettings skips undefined boolean fields', () => {
    GameStorage.saveGameSettings({
      nickname: 'player',
      color: 'blue',
      autoCameraEnabled: true,
    });

    expect(localStorage.getItem('autoCameraEnabled')).toBe('true');
    expect(localStorage.getItem('followCameraEnabled')).toBeNull();
    expect(localStorage.getItem('collisionsEnabled')).toBeNull();
    expect(localStorage.getItem('playerInfoVisible')).toBeNull();
    expect(localStorage.getItem('editModeEnabled')).toBeNull();
  });

  it('round-trip: save then get returns same values', () => {
    GameStorage.saveGameSettings({
      nickname: 'test',
      color: 'red',
      autoCameraEnabled: true,
      followCameraEnabled: true,
      collisionsEnabled: false,
      playerInfoVisible: true,
      editModeEnabled: false,
    });

    const settings = GameStorage.getGameSettings();
    expect(settings.autoCameraEnabled).toBe(true);
    expect(settings.followCameraEnabled).toBe(true);
    expect(settings.collisionsEnabled).toBe(false);
    expect(settings.playerInfoVisible).toBe(true);
    expect(settings.editModeEnabled).toBe(false);
  });
});

describe('GameStorage quality tier validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns auto when qualityTier is missing', () => {
    expect(GameStorage.getGameSettings().qualityTier).toBe('auto');
  });

  it('accepts each valid quality tier value', () => {
    for (const tier of ['auto', 'low', 'medium', 'high'] as const) {
      localStorage.clear();
      localStorage.setItem('qualityTier', tier);
      expect(GameStorage.getGameSettings().qualityTier).toBe(tier);
    }
  });

  it('falls back to auto when qualityTier is corrupt or unrecognized', () => {
    const corruptValues = ['ULTRA', 'lowish', '123', '', 'auto; extra', 'low\n'];
    for (const corrupt of corruptValues) {
      localStorage.clear();
      localStorage.setItem('qualityTier', corrupt);
      expect(GameStorage.getGameSettings().qualityTier).toBe('auto');
    }
  });
});
