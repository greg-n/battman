export interface Player {
    name: string;
    guessedWordPortion: null | string;
    guessedLetters: string[];
    guessedWords: string[];
    eliminatedPlayers: string[];
    state: PlayerState;
    lastGuessedAgainst: string[];
    lastGuessedBy: string[];
}

export enum PlayerState {
    joined,
    ready,
    playing,
    eliminated,
    disconnected,
    victor
}