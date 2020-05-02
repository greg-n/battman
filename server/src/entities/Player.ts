import cloneDeep from "lodash.clonedeep";

export enum PlayerState {
    joined,
    ready,
    playing,
    eliminated,
    disconnected,
    victor
}

export type PlayerSerializable = {
    [key: string]: string | null | string[] | PlayerState;
}

export default class Player {
    // Player name stored here too for easier returning
    name: string;
    // Will be set prior to game beginning, readying
    word: string | null;
    // Will be set prior to game beginning, readying
    guessedWordPortion: string | null;
    // Letters that have been guessed on this player's word
    guessedLetters: Set<string>;
    // Words that have been guessed on this player's word
    guessedWords: Set<string>;
    eliminatedPlayers: Set<string>;
    state: PlayerState;
    // Will store last 5 names of those guessed by this player
    lastGuessedAgainst: string[];
    // Will store last 5 names of those who guessed this player
    lastGuessedBy: string[];

    constructor(name: string) {
        this.name = name;
        this.word = null;
        this.guessedWordPortion = null;
        this.guessedLetters = new Set();
        this.guessedWords = new Set();
        this.eliminatedPlayers = new Set();
        this.state = PlayerState.joined;
        this.lastGuessedAgainst = [];
        this.lastGuessedBy = [];
    }

    // Ensure that item can be serialized for transport
    getSafeToSerialize(): PlayerSerializable {
        return {
            name: this.name,
            word: this.word,
            guessedWordPortion: this.guessedWordPortion,
            // These set -> array for valid JSON.stringify
            guessedLetters: [...this.guessedLetters],
            guessedWords: [...this.guessedWords],
            eliminatedPlayers: [...this.eliminatedPlayers],
            state: this.state,
            lastGuessedAgainst: this.lastGuessedAgainst,
            lastGuessedBy: this.lastGuessedBy
        };
    }

    // Remove values that should not be broadcasted
    getSanitizedCopy(): this {
        const copy = cloneDeep(this);

        if (!
            [
                PlayerState.disconnected,
                PlayerState.eliminated,
                PlayerState.victor
            ].includes(this.state)
        ) {
            delete copy.word;
        }

        return copy;
    }
}
