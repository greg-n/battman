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
    state: GameState;
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
    action: GameAction;
    state: GameState;
    currentPlayer?: string;
    waitingRoomMarshal?: string;
    remainingPlayers: string[];
    minChars: number;
    maxChars: number;
    streamInfo: string[];
}

interface GuessOutput extends GameOutput {
    actorUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    subjectUpdate: Omit<PlayerUpdateOutput, "gameInfo">;
    players: { [key: string]: PlayerSerializable };
}

interface GameOutput {
    gameInfo: GameUpdate;
}

export interface PlayerUpdateOutput extends GameOutput {
    forEffected: PlayerSerializable;
    forAll: PlayerSerializable;
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
    waitingRoomMarshal: string | undefined;
    createdAt: number;
    lastModifiedAt: number;
    endedAt: number | undefined;
    streamInfo: string[]; // list of all game updates

    /**
     * Word constraints should exist upon creation.
     * Creator becomes the waitingRoomMarshal
     */
    constructor(minChars = 1, maxChars = 24) {
        Game.checkWordConstraints(minChars, maxChars);

        this.minChars = minChars;
        this.maxChars = maxChars;
        this.createdAt = Date.now();
        this.lastModifiedAt = Date.now();
        this.streamInfo = [];
    }

    private buildGameUpdateOutput(action: GameAction): GameUpdate {
        return {
            action: action,
            state: this.state,
            currentPlayer: this.currentPlayer,
            waitingRoomMarshal: this.waitingRoomMarshal,
            remainingPlayers: this.getRemainingPlayers(),
            minChars: this.minChars,
            maxChars: this.maxChars,
            streamInfo: this.streamInfo
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
        if (!/^[a-zA-Z0-9_.]+$/g.test(name)) {
            throw new Error("Name is not of a-z,A-Z,0-9 chars without multiple spaces.");
        }

        const player: Player = new Player(name);
        this.players.set(name, player);

        if (this.players.size === 1) {
            // if first player they are assigned as marshal (or joining empty lobby)
            this.waitingRoomMarshal = name;
        }

        this.streamInfo.unshift(`Player ${name} has been added.`);

        this.lastModifiedAt = Date.now();
        return {
            forEffected: player.getSafeToSerialize(),
            forAll: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput(GameAction.join)
        };
    }

    buildGameExternalInfo(): GameExternalInfo {
        return {
            state: this.state,
            playerCount: this.players.size
        };
    }

    changeWordConstraints(actor: string, minChars = 1, maxChars = 24): { [key: string]: PlayerUpdateOutput } {
        if (actor !== this.waitingRoomMarshal) {
            throw new Error("Only the waiting room marshal can modify word constraints.");
        }
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game must be in waiting room to change word constraints.");
        }
        Game.checkWordConstraints(minChars, maxChars);

        this.minChars = minChars;
        this.maxChars = maxChars;

        this.streamInfo.unshift(`Word constraints have been changed to min: ${minChars}, max: ${maxChars}.`);

        const retVal: { [key: string]: PlayerUpdateOutput } = {};
        for (const [name, playerItem] of this.players) {
            const word = playerItem.word || ""; // If not available then spoof is fine to force reset
            if (
                (word.length < minChars || word.length > maxChars)
                && [PlayerState.joined, PlayerState.ready].includes(playerItem.state)
            ) {
                playerItem.word = null;
                playerItem.guessedWordPortion = null;
                playerItem.state = PlayerState.joined;

                retVal[name] = {
                    forEffected: playerItem.getSafeToSerialize(),
                    forAll: playerItem.getSanitizedCopy().getSafeToSerialize(),
                    gameInfo: this.buildGameUpdateOutput(GameAction.changeWordConstraints)
                };

                this.players.set(name, playerItem);
            } else {
                retVal[name] = {
                    forEffected: playerItem.getSafeToSerialize(),
                    forAll: playerItem.getSanitizedCopy().getSafeToSerialize(),
                    gameInfo: this.buildGameUpdateOutput(GameAction.changeWordConstraints)
                };
            }
        }

        this.lastModifiedAt = Date.now();
        return retVal;
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
            if (this.waitingRoomMarshal === name) {
                // try to set new marshal if old marshal is being removed
                this.waitingRoomMarshal = this.players.size > 0 ? [...this.players.keys()][0] : undefined;
            }
        } else if (this.state === GameState.running) {
            player.state = player.state !== PlayerState.eliminated
                ? PlayerState.disconnected
                : PlayerState.eliminatedDisconnected;
            player.guessedWordPortion = player.word;
            player.disconnectionReason = reason;
            this.players.set(name, player);

            const remaining = this.getRemainingPlayers();
            if (remaining.length < 2 && remaining.length) { // Length should never hit one
                this.state = GameState.ended;
                const victorItem = this.players.get(remaining[0]) as Player;
                victorItem.state = PlayerState.victor;
                this.players.set(remaining[0], victorItem);

                this.endedAt = Date.now();
            } else if (this.currentPlayer === name) {
                this.currentPlayer = this.nextPlayer();
            }
        } // If game state is ended all items are exposed by default

        this.streamInfo.unshift(
            reason == null
                ? `Player ${name} has disconnected.`
                : `Player ${name} has disconnected for reason '${reason}'.`
        );

        this.lastModifiedAt = Date.now();
        return this.getGameState(GameAction.disconnect);
    }

    getGameState(action?: GameAction): GameStateOutput {
        const players: { [key: string]: PlayerSerializable } = {};
        for (const [name, val] of this.players.entries()) {
            if (
                this.state !== GameState.ended
                && (
                    val.state === PlayerState.playing
                    || val.state === PlayerState.joined // This should not be possible currently
                    || val.state === PlayerState.ready // This should not be possible currently
                )
            )
                players[name] = val.getSanitizedCopy().getSafeToSerialize();
            else
                players[name] = val.getSafeToSerialize();
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
            throw new Error(`Could not find player values for actor '${actor}' or subject '${subject}'.`);
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

        // Game rule that you can't guess the same person more than 3 times in a row unless <= 3 remaining players
        let sameLastThree = 0;
        for (const elem of actorItem.lastGuessedAgainst) {
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
        actorItem.lastGuessedAgainst = actorItem.lastGuessedAgainst.slice(0, 3);

        subjectItem.lastGuessedBy.unshift(actor);
        subjectItem.lastGuessedBy = subjectItem.lastGuessedBy.slice(0, 3);

        let subjectEliminated = false;
        if (guessFixed.length === 1) {
            // Guess is letter
            subjectItem.guessedLetters.add(guessFixed);
            const [updatedPortion, filled] = fillInChars(
                subjectItem.word as string, // Asserting string since game start should ensure
                subjectItem.guessedWordPortion as string, // Asserting string since game start should ensure
                guessFixed
            );

            if (updatedPortion === subjectItem.word) {
                subjectItem.guessedWordPortion = subjectItem.word;
                subjectItem.state = PlayerState.eliminated;
                actorItem.eliminatedPlayers.add(subject);
                subjectEliminated = true;
                this.streamInfo.unshift(
                    `${actor} eliminated ${subject} with guessed letter '${guessFixed}'. Filling ${filled} blanks.`
                );
            } else {
                subjectItem.guessedWordPortion = updatedPortion;
                this.streamInfo.unshift(
                    `${actor} guessed letter '${guessFixed}' on ${subject}'s word. Filling ${filled} blanks.`
                );
            }
        } else {
            // Guess is word
            subjectItem.guessedWords.add(guessFixed);
            if (guessFixed === subjectItem.word) {
                subjectItem.guessedWordPortion = subjectItem.word;
                subjectItem.state = PlayerState.eliminated;
                actorItem.eliminatedPlayers.add(subject);
                subjectEliminated = true;
                this.streamInfo.unshift(
                    actor + " eliminated " + subject + " with correct word guess '" + guessFixed + "'."
                );
            } else {
                this.streamInfo.unshift(
                    actor + " guessed word '" + guessFixed + "' on " + subject + "'s word."
                );
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
                forAll: gameEnded
                    ? actorItem.getSafeToSerialize() // Reveal on game end
                    : actorItem.getSanitizedCopy().getSafeToSerialize()
            },
            subjectUpdate: {
                forEffected: subjectItem.getSafeToSerialize(),
                forAll: subjectEliminated
                    ? subjectItem.getSafeToSerialize() // Reveal all on elimination
                    : subjectItem.getSanitizedCopy().getSafeToSerialize()
            },
            players: this.getGameState().players,
            gameInfo: this.buildGameUpdateOutput(GameAction.guess)
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

        this.streamInfo.unshift(`${actor} has changed their ready state.`);

        this.lastModifiedAt = Date.now();
        return {
            forEffected: player.getSafeToSerialize(),
            forAll: player.getSanitizedCopy().getSafeToSerialize(),
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

        this.streamInfo.unshift(`${actor} has set their word.`);

        this.lastModifiedAt = Date.now();
        return {
            forEffected: actorItem.getSafeToSerialize(),
            forAll: actorItem.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput(GameAction.setWord)
        };
    }

    start(actor: string): GameStateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for game start. Must be 'waitingRoom'.");
        }
        if (actor !== this.waitingRoomMarshal) {
            throw new Error("Must be waiting room marshal to begin the game.");
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

        this.streamInfo.unshift("Game has started.");

        this.lastModifiedAt = Date.now();
        return this.getGameState(GameAction.startGame);
    }

    transferMarshalShip(actor: string, subject: string): GameOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state prevents the transfer marshalship.");
        }
        if (actor !== this.waitingRoomMarshal) {
            throw new Error("Only the current marshal can transfer the marshalship.");
        }
        if (!this.players.has(subject)) {
            throw new Error("Can only transfer marshalship to current player.");
        }

        this.waitingRoomMarshal = subject;

        this.streamInfo.unshift(`${actor} has transferred marshalship to ${subject}.`);

        this.lastModifiedAt = Date.now();
        return {
            gameInfo: this.buildGameUpdateOutput(GameAction.transferMarshalship)
        };
    }
}
