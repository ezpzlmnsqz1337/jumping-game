import { PlayerColor } from "./assets/colors";

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
      newlyCreated
    };
  }
  
  static saveGameSettings(settings: GameSettings): void {
    localStorage.setItem('nickname', settings.nickname);
    localStorage.setItem('color', settings.color);
  }
}