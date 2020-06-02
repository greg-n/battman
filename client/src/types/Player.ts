export interface Player {
    name: string;
    word: null | string; // will only be filled for eliminated players or client state
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
