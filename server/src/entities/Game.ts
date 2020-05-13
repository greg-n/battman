import Player, { PlayerSerializable, PlayerState } from "./Player";
import fillInChars from "./utils/fillInChars";
import shuffle from "./utils/shuffle";

// Action that will be reported with data for client to determine the purpose of data
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
    gameState: GameState;
    playerCount: number;
}

export enum GameState {
    waitingRoom,
    running,
    ended
}

export interface GameStateOutput extends GameOutput {
    players: { [key: string]: PlayerSerializable };
}

interface GameUpdate {
    gameAction: GameAction;
    gameState: GameState;
    currentPlayer?: string;
    waitingRoomMarshall?: string;
    remainingPlayers: string[];
    minChars: number;
    maxChars: number;
}

interface GuessOutput extends GameOutput {
    actorUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    subjectUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    streamInfo: string;
}

interface GameOutput {
    gameInfo: GameUpdate;
}

export interface PlayerUpdateOutput extends GameOutput {
    forEffected: PlayerSerializable;
    forOthers: PlayerSerializable;
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
    waitingRoomMarshall: string | undefined;
    createdAt: number;
    lastModifiedAt: number;
    endedAt: number | undefined;

    /**
     * Word constraints should exist upon creation.
     * Creator becomes the waitingRoomMarshall
     */
    constructor(minChars = 1, maxChars = 24) {
        Game.checkWordConstraints(minChars, maxChars);

        this.minChars = minChars;
        this.maxChars = maxChars;
        this.createdAt = Date.now();
        this.lastModifiedAt = Date.now();
    }

    private buildGameUpdateOutput(action: GameAction): GameUpdate {
        return {
            gameAction: action,
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
        if (name.length > 16) {
            throw new Error("Name is over allowed length of 16 chars.");
        }
        if (!/^[a-zA-Z0-9_ .]+$/g.test(name)) {
            throw new Error("Name is not of a-z,A-Z,0-9 chars without multiple spaces one "
                + "after another or spaces beginning or concluding the name.");
        }

        const player: Player = new Player(name);
        this.players.set(name, player);

        if (this.players.size === 1) {
            // if first player they are assigned as marshall (or joining empty lobby)
            this.waitingRoomMarshall = name;
        }

        this.lastModifiedAt = Date.now();
        return {
            forEffected: player.getSafeToSerialize(),
            forOthers: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput(GameAction.join)
        };
    }

    buildGameExternalInfo(): GameExternalInfo {
        return {
            gameState: this.state,
            playerCount: this.players.size
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

        this.lastModifiedAt = Date.now();
        return this.getGameState(GameAction.changeWordConstraints);
    }

    /**
     * Will disconnect a player, setting player state and updating or removing
     * player from the player list depending on game state
     * */
    disconnectPlayer(name: string, reason?: string): GameStateOutput {
        const player = this.players.get(name);
        if (player == null) {
            throw new Error("Could not find player values for actor.");
        }

        if (this.state === GameState.waitingRoom) {
            this.players.delete(name); // Don't track reason or player existence
            if (this.waitingRoomMarshall === name) {
                // try to set new marshall if old marshall is being removed
                this.waitingRoomMarshall = this.players.size > 0 ? [...this.players.keys()][0] : undefined;
            }
        } else {
            player.state = PlayerState.disconnected;
            player.guessedWordPortion = player.word;
            player.disconnectionReason = reason;
            this.players.set(name, player);
        }

        this.lastModifiedAt = Date.now();
        return this.getGameState(GameAction.disconnect);
    }

    getGameState(action?: GameAction): GameStateOutput {
        const players: { [key: string]: PlayerSerializable } = {};
        for (const [name, val] of this.players.entries()) {
            players[name] = val.getSanitizedCopy().getSafeToSerialize();
        }

        return {
            players,
            gameInfo: this.buildGameUpdateOutput(action ?? GameAction.getGameState)
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

        const guessFixed = guess.toLowerCase().trim();
        if (guessFixed.length < 1) {
            throw new Error("Guess must be at least one char.");
        }
        if (!/^[a-z]+$/g.test(guessFixed)) {
            throw new Error("Guess is not a single/list of a-z chars without spaces.");
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

            this.endedAt = Date.now();
        } else {
            this.currentPlayer = this.nextPlayer();
        }

        this.lastModifiedAt = Date.now();
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
            gameInfo: this.buildGameUpdateOutput(GameAction.guess),
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

        this.lastModifiedAt = Date.now();
        return {
            forEffected: player.getSafeToSerialize(),
            forOthers: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput(GameAction.readyToggle)
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

        this.lastModifiedAt = Date.now();
        return {
            forEffected: actorItem.getSafeToSerialize(),
            forOthers: actorItem.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput(GameAction.setWord)
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

        this.lastModifiedAt = Date.now();
        return this.getGameState(GameAction.startGame);
    }

    transferMarshallShip(actor: string, subject: string): GameOutput {
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

        this.lastModifiedAt = Date.now();
        return {
            gameInfo: this.buildGameUpdateOutput(GameAction.transferMarshalship)
        };
    }
}
