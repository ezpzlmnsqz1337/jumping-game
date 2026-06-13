import { PlayerColor } from './assets/colors';
import { type GameLevel } from './game-level';
import { isLevelDocument, type LevelDocument } from './level-document';

export interface GameSettings {
  nickname: string;
  color: PlayerColor;
  newlyCreated?: boolean;
}

export class GameStorage {
  static getGameSettings(): GameSettings {
    const nickname = localStorage.getItem('nickname') || 'player';
    const color = (localStorage.getItem('color') || 'blue') as PlayerColor;
    const newlyCreated = ['nickname', 'color'].every(x => localStorage.getItem(x) === null);

    return {
      nickname,
      color,
      newlyCreated,
    };
  }

  static saveGameSettings(settings: GameSettings): void {
    localStorage.setItem('nickname', settings.nickname);
    localStorage.setItem('color', settings.color);
  }

  static saveLevel(level: GameLevel): LevelDocument {
    const serializedLevel = level.serialize();
    this.saveLevelDocument(serializedLevel);
    return serializedLevel;
  }

  static saveLevelDocument(level: LevelDocument): void {
    localStorage.setItem('level-editor-draft', JSON.stringify(level));
  }

  static getLevel(): LevelDocument | null {
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
