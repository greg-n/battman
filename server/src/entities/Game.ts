import fillInChars from "../utils/fillInChars";
import shuffle from "../utils/shuffle";
import Player, { PlayerSerializable, PlayerState } from "./Player";

export enum GameState {
    waitingRoom,
    running,
    ended
}

interface GameUpdateOutput {
    gameState: GameState;
    currentPlayer?: string;
    waitingRoomMarshall: string;
    remainingPlayers: string[];
    minChars: number;
    maxChars: number;
}

interface PlayerUpdateOutput {
    forEffected: PlayerSerializable;
    forOthers: PlayerSerializable;
    gameInfo: GameUpdateOutput;
}

interface GuessOutput {
    actorUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    subjectUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    gameInfo: GameUpdateOutput;
    streamInfo: string;
}

interface GameStateOutput extends GameUpdateOutput {
    players: { [key: string]: PlayerSerializable };
}

export default class Game {
    static checkWordConstraints(minChars: number, maxChars: number): void {
        if (minChars < 1) {
            throw new Error("Min char limit is not a valid bound.");
        }
        if (maxChars > 24) { 
            throw new Error("Max char limit is not a valid bound.");
        }
        if (minChars > maxChars) {
            throw new Error("Min char must be smaller or equal to max char bound.");
        }
    }

    // Simple word bounds, enforced with others in setWord
    minChars: number;
    maxChars: number;
    state = GameState.waitingRoom;
    players: Map<string, Player> = new Map();
    currentPlayer: string | undefined;
    waitingRoomMarshall: string;

    /**
     * Word constraints should exist upon creation.
     * Creator becomes the waitingRoomMarshall
     */
    constructor(creator: string, minChars = 1, maxChars = 24) {
        Game.checkWordConstraints(minChars, maxChars);

        this.addPlayer(creator);
        this.waitingRoomMarshall = creator;
        this.minChars = minChars;
        this.maxChars = maxChars;
    }

    private buildGameUpdateOutput(): GameUpdateOutput {
        return {
            gameState: this.state,
            currentPlayer: this.currentPlayer,
            waitingRoomMarshall: this.waitingRoomMarshall,
            remainingPlayers: this.getRemainingPlayers(),
            minChars: this.minChars,
            maxChars: this.maxChars
        };
    }

    addPlayer(name: string): PlayerUpdateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Players cannot be added given game state.");
        }
        if (this.players.has(name)) {
            throw new Error("Player " + name + " already in game.");
        }

        const player: Player = new Player(name);
        this.players.set(name, player);

        return {
            forEffected: player.getSafeToSerialize(),
            forOthers: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput()
        };
    }

    changeWordConstraints(actor: string, minChars = 1, maxChars = 24): GameStateOutput {
        if (actor !== this.waitingRoomMarshall) {
            throw new Error("Only the waiting room marshall can modify word constraints.");
        }
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game must be in waiting room to change word constraints.");
        }
        Game.checkWordConstraints(minChars, maxChars);

        for (const [name, playerItem] of this.players) {
            const word = playerItem.word || ""; // If not available then spoof is fine to force reset
            if (
                (word.length < minChars || word.length > maxChars) 
                && [PlayerState.joined, PlayerState.ready].includes(playerItem.state)
            ) {
                playerItem.word = null;
                playerItem.guessedWordPortion = null;
                playerItem.state = PlayerState.joined;
                this.players.set(name, playerItem);
            }
        }

        return this.getGameState();
    }

    /**
     * Will disconnect a player, setting player state and updating or removing
     * player from the player list depending on game state
     * */
    disconnectPlayer(name: string): GameStateOutput {
        const player = this.players.get(name);
        if (player == null) {
            throw new Error("Could not find player values for actor.");
        }

        if (this.state === GameState.waitingRoom) {
            this.players.delete(name);
        } else {
            player.state = PlayerState.disconnected;
            player.guessedWordPortion = player.word;
            this.players.set(name, player);
        }

        return this.getGameState();
    }

    getGameState(): GameStateOutput {
        const players: { [key: string]: PlayerSerializable } = {};
        for (const [name, val] of this.players.entries()) {
            players[name] = val.getSanitizedCopy().getSafeToSerialize();
        }

        return {
            players,
            ...this.buildGameUpdateOutput()
        };
    }

    getRemainingPlayers(): string[] {
        const retVal: string[] = [];
        for (const vals of this.players.values()) {
            if (vals.state === PlayerState.playing) {
                retVal.push(vals.name);
            }
        }
        return retVal;
    }

    guess(actor: string, subject: string, guess: string): GuessOutput {
        if (this.state !== GameState.running) {
            throw new Error("Game state doesn't allow for guessing.");
        }
        if (actor !== this.currentPlayer) {
            throw new Error("Must be current player to make a guess.");
        }
        if (!this.players.has(actor) || !this.players.has(subject)) {
            throw new Error("Could not find player values for actor or subject.");
        }
        const remainingPlayers = this.getRemainingPlayers();
        if (!remainingPlayers.includes(actor) || !remainingPlayers.includes(subject)) {
            throw new Error("Either actor or subject is not a remaining player.");
        }

        const actorItem = this.players.get(actor) as Player;
        const subjectItem = this.players.get(subject) as Player;

        // Game rule that you can't guess the same person 3 times in a row unless <= 3 remaining players
        let sameLastThree = 0;
        for (const elem of actorItem.lastGuessedAgainst.slice(0, 3)) {
            if (elem === subject) {
                sameLastThree++;
            }
        }
        if (
            remainingPlayers.length > 3
            && sameLastThree === 3
        ) {
            throw new Error("Can't guess the same person 3 times in a row unless <= 3 remaining players.");
        }

        actorItem.lastGuessedAgainst.unshift(subject);
        actorItem.lastGuessedAgainst = actorItem.lastGuessedAgainst.slice(0, 5);

        subjectItem.lastGuessedBy.unshift(actor);
        subjectItem.lastGuessedBy = subjectItem.lastGuessedBy.slice(0, 5);

        let streamInfo: string | undefined;
        const guessFixed = guess.toLowerCase().trim();
        let subjectEliminated = false;
        if (guessFixed.length === 1) {
            // Guess is letter
            subjectItem.guessedLetters.add(guessFixed);
            const updatedPortion = fillInChars(
                subjectItem.word as string, // Asserting string since game start should ensure
                subjectItem.guessedWordPortion as string, // Asserting string since game start should ensure
                guessFixed
            );

            if (updatedPortion === subjectItem.word) {
                subjectItem.guessedWordPortion = subjectItem.word;
                subjectItem.state = PlayerState.eliminated;
                actorItem.eliminatedPlayers.add(subject);
                subjectEliminated = true;
                streamInfo = actor + " eliminated " + subject + " with guessed letter " + guessFixed + ".";
            } else {
                subjectItem.guessedWordPortion = updatedPortion;
                streamInfo = actor + " guessed letter " + guessFixed + " on " + subject + "'s word.";
            }
        } else {
            // Guess is word
            subjectItem.guessedWords.add(guessFixed);
            if (guessFixed === subjectItem.word) {
                subjectItem.guessedWordPortion = subjectItem.word;
                subjectItem.state = PlayerState.eliminated;
                actorItem.eliminatedPlayers.add(subject);
                subjectEliminated = true;
                streamInfo = actor + " eliminated " + subject + " with correct word guess " + guessFixed + ".";
            } else {
                streamInfo = actor + " guessed word " + guessFixed + " on " + subject + "'s word.";
            }
        }

        this.players.set(actor, actorItem);
        this.players.set(subject, subjectItem);

        const nowRemaining = this.getRemainingPlayers();
        let gameEnded = false;
        if (nowRemaining.length < 2) {
            this.state = GameState.ended;
            gameEnded = true;
            // Explicity allow self elimination by inspecting nowRemaining to find victor
            const victorItem = this.players.get(nowRemaining[0]) as Player;
            victorItem.state = PlayerState.victor;
            this.players.set(nowRemaining[0], victorItem);
        } else {
            this.currentPlayer = this.nextPlayer();
        }

        return {
            actorUpdate: {
                forEffected: actorItem.getSafeToSerialize(),
                forOthers: gameEnded
                    ? actorItem.getSafeToSerialize() // Reveal on game end
                    : actorItem.getSanitizedCopy().getSafeToSerialize()
            },
            subjectUpdate: {
                forEffected: subjectItem.getSafeToSerialize(),
                forOthers: subjectEliminated
                    ? subjectItem.getSafeToSerialize() // Reveal all on elimination
                    : subjectItem.getSanitizedCopy().getSafeToSerialize()
            },
            gameInfo: this.buildGameUpdateOutput(),
            streamInfo
        };
    }

    nextPlayer(): string {
        if (this.currentPlayer == null) {
            throw new Error("No current player.");
        }

        const remaining = this.getRemainingPlayers();
        const indexOfCurrent = remaining.indexOf(this.currentPlayer);
        return remaining[(indexOfCurrent + 1) % remaining.length];
    }

    readyUpToggle(actor: string): PlayerUpdateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for ready toggling.");
        }

        const player = this.players.get(actor);
        if (player == null) {
            throw new Error("Could not find player values for actor.");
        }
        if (player.word == null) {
            throw new Error("Player must have set a word to ready up.");
        }

        const currentState = player.state;
        if (![PlayerState.joined, PlayerState.ready].includes(currentState)) {
            throw new Error("Player state doesn't allow for readying.");
        }

        player.state = player.state === PlayerState.joined
            ? PlayerState.ready
            : PlayerState.joined;
        this.players.set(actor, player);

        return {
            forEffected: player.getSafeToSerialize(),
            forOthers: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput()
        };
    }

    setWord(actor: string, word: string): PlayerUpdateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for word setting.");
        }
        if (!this.players.has(actor)) {
            throw new Error("Could not find player values for actor.");
        }

        const actorItem = this.players.get(actor) as Player;
        if (actorItem.state !== PlayerState.joined) {
            throw new Error("Player state doesn't allow for word setting.");
        }

        const wordFixed = word.toLowerCase().trim();

        if (!/^[a-z]+$/g.test(wordFixed)) {
            throw new Error("Word is not a list of a-z chars without spaces.");
        }
        if (wordFixed.length < this.minChars || wordFixed.length > this.maxChars) {
            throw new Error(
                "Word is outside of min, max length bounds of "
                + this.minChars + ", " + this.maxChars + "."
            );
        }

        actorItem.state = PlayerState.joined; // Unready
        actorItem.word = wordFixed;
        actorItem.guessedWordPortion = "_".repeat(wordFixed.length);
        this.players.set(actor, actorItem);

        return {
            forEffected: actorItem.getSafeToSerialize(),
            forOthers: actorItem.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput()
        };
    }

    start(actor: string): GameStateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for game start. Must be 'waitingRoom'.");
        }
        if (actor !== this.waitingRoomMarshall) {
            throw new Error("Must be waiting room marshall to begin the game.");
        }
        if (this.players.size < 2) {
            throw new Error("Game requires more than one player.");
        }

        const playersNotReadied: string[] = [];
        for (const value of this.players.values()) {
            if (value.state !== PlayerState.ready) {
                playersNotReadied.push(value.name);
            }
        }
        if (playersNotReadied.length) {
            throw new Error("Players " + playersNotReadied + " are not ready to play.");
        }

        this.state = GameState.running;

        // Shuffle player order on beginning
        const shuffledPlayersList = shuffle([...this.players.keys()]);
        const newShuffledPlayers: Map<string, Player> = new Map();
        for (const name of shuffledPlayersList) {
            const playerItem = this.players.get(name) as Player;
            playerItem.state = PlayerState.playing;
            newShuffledPlayers.set(name, playerItem);
        }
        this.players = newShuffledPlayers;
        this.currentPlayer = shuffledPlayersList[0];

        return this.getGameState();
    }

    transferMarshallShip(actor: string, subject: string): GameUpdateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state prevents the transfer marshalship.");
        }
        if (actor !== this.waitingRoomMarshall) {
            throw new Error("Only the current marshall can transfer the marshalship.");
        }
        if (!this.players.has(subject)) {
            throw new Error("Can only transfer marshalship to current player.");
        }

        this.waitingRoomMarshall = subject;

        return this.buildGameUpdateOutput();
    }
}
