export interface Room {
  code: string;
  players: Player[];
  admin_id: string;
  settings: RoomSettings;
  state: RoomState;
  activePlayer: string;
  paintersTheme: string;
  scammersTheme: string;
  startDate: number;
  endDate: number;
}

export interface RoomSettings {
  painters: number;
  scammers: number;
}

export enum RoomState {
  WAITING = "waiting",
  STARTED = "started",
  FINISHED = "finished",
}
