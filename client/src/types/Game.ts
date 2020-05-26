import { Player } from "./Player";

export enum GameAction {
    join, // Match token to player in game
    disconnect,
    changeWordConstraints,
    transferMarshalship,
    setWord,
    readyToggle,
    startGame,
    guess,
    getGameState
}

export interface GameExternalInfo {
    state: GameState;
    playerCount: number;
}

export enum GameState {
    waitingRoom,
    running,
    ended
}

export interface GameStateOutput extends GameOutput {
    players: { [key: string]: Player };
}

export interface GameUpdate {
    action: GameAction;
    state: GameState;
    currentPlayer?: string;
    waitingRoomMarshall?: string;
    remainingPlayers: string[];
    minChars: number;
    maxChars: number;
}

export interface GuessOutput extends GameOutput {
    actorUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    subjectUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    streamInfo: string;
}

export interface GameOutput {
    gameInfo: GameUpdate;
}

export interface PlayerUpdateOutput extends GameOutput {
    forEffected: Player;
    forOthers?: Player;
}
