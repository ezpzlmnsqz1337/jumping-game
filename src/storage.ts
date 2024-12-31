import { PlayerColor } from "./assets/colors";

export interface GameSettings {
  nickname: string
  color: PlayerColor
}

export const getGameSettings = (): GameSettings => {
  const nickname = localStorage.getItem('nickname') || 'player';
  const color = localStorage.getItem('color') || 'blue';
  return { nickname, color: color as PlayerColor };
}

export const saveGameSettings = (settings: GameSettings) => {
  localStorage.setItem('nickname', settings.nickname);
  localStorage.setItem('color', settings.color);
}