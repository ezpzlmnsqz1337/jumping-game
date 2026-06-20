import { PlayerColor } from './assets/colors';
import { type GameLevel } from './game-level';
import { isLevelDocument, type LevelDocument } from './level-document';
import { type QualitySetting } from './quality';

export interface GameSettings {
  nickname: string;
  color: PlayerColor;
  newlyCreated?: boolean;
  qualityTier?: QualitySetting;
  autoCameraEnabled?: boolean;
  followCameraEnabled?: boolean;
  collisionsEnabled?: boolean;
  playerInfoVisible?: boolean;
  editModeEnabled?: boolean;
}

const LEVEL_INDEX_KEY = 'level-index';

function readBoolSetting(key: string): boolean | undefined {
  const value = localStorage.getItem(key);
  return value === null ? undefined : value === 'true';
}

function saveBoolSetting(key: string, value: boolean | undefined): void {
  if (value !== undefined) {
    localStorage.setItem(key, String(value));
  }
}

export class GameStorage {
  static getGameSettings(): GameSettings {
    const nickname = localStorage.getItem('nickname') || 'player';
    const color = (localStorage.getItem('color') || 'blue') as PlayerColor;
    const newlyCreated = ['nickname', 'color'].every(x => localStorage.getItem(x) === null);
    const qualityTier = (localStorage.getItem('qualityTier') as QualitySetting) || 'auto';

    return {
      nickname,
      color,
      newlyCreated,
      qualityTier,
      autoCameraEnabled: readBoolSetting('autoCameraEnabled'),
      followCameraEnabled: readBoolSetting('followCameraEnabled'),
      collisionsEnabled: readBoolSetting('collisionsEnabled'),
      playerInfoVisible: readBoolSetting('playerInfoVisible'),
      editModeEnabled: readBoolSetting('editModeEnabled'),
    };
  }

  static saveGameSettings(settings: GameSettings): void {
    localStorage.setItem('nickname', settings.nickname);
    localStorage.setItem('color', settings.color);
    if (settings.qualityTier) {
      localStorage.setItem('qualityTier', settings.qualityTier);
    }
    saveBoolSetting('autoCameraEnabled', settings.autoCameraEnabled);
    saveBoolSetting('followCameraEnabled', settings.followCameraEnabled);
    saveBoolSetting('collisionsEnabled', settings.collisionsEnabled);
    saveBoolSetting('playerInfoVisible', settings.playerInfoVisible);
    saveBoolSetting('editModeEnabled', settings.editModeEnabled);
  }

  static saveLevel(level: GameLevel): LevelDocument {
    const serializedLevel = level.serialize();
    this.saveLevelDocument(serializedLevel);
    return serializedLevel;
  }

  static saveLevelDocument(level: LevelDocument): void {
    const name = level.name;
    const index = this.getLevelIndex();
    if (!index.includes(name)) {
      index.push(name);
      this.setLevelIndex(index);
    }
    localStorage.setItem(`level-data-${name}`, JSON.stringify(level));
  }

  static getLevel(name?: string): LevelDocument | null {
    if (name) {
      const stored = localStorage.getItem(`level-data-${name}`);
      if (!stored) return null;
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (!isLevelDocument(parsed)) return null;
        return parsed;
      } catch {
        return null;
      }
    }
    // Fallback to legacy single-level key
    const storedLevel = localStorage.getItem('level-editor-draft');
    if (!storedLevel) return null;
    try {
      const parsed = JSON.parse(storedLevel) as unknown;
      if (!isLevelDocument(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static deleteLevel(name: string): void {
    localStorage.removeItem(`level-data-${name}`);
    const index = this.getLevelIndex().filter(n => n !== name);
    this.setLevelIndex(index);
  }

  static listLevels(): LevelDocument[] {
    const index = this.getLevelIndex();
    const levels: LevelDocument[] = [];
    for (const name of index) {
      const level = this.getLevel(name);
      if (level) levels.push(level);
    }
    // Also include the default level1 if not in index
    if (!index.includes('level1')) {
      const legacy = this.getLevel();
      if (legacy) levels.push(legacy);
    }
    return levels;
  }

  private static getLevelIndex(): string[] {
    try {
      const raw = localStorage.getItem(LEVEL_INDEX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as string[];
    } catch {
      return [];
    }
  }

  private static setLevelIndex(index: string[]): void {
    localStorage.setItem(LEVEL_INDEX_KEY, JSON.stringify(index));
  }

  static clearLevel(): void {
    localStorage.removeItem('level-editor-draft');
  }

  static downloadLevel(level: GameLevel): void {
    const serializedLevel = this.saveLevel(level);
    const payload = JSON.stringify(serializedLevel, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${level.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
