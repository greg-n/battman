import fillInChars from "../utils/fillInChars";
import shuffle from "../utils/shuffle";
import Player, { PlayerSerializable, PlayerState } from "./Player";

enum GameState {
    waitingRoom,
    running,
    ended
}

interface GameUpdateOutput {
    gameState: GameState;
    currentPlayer?: string;
    remainingPlayers: string[];
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

interface GameStartOutput extends GameUpdateOutput {
    players: { [key: string]: PlayerSerializable };
}

export default class Game {
    id: string;
    // Simple word bounds, enforced with others in setWord
    minChars: number;
    maxChars: number;
    state = GameState.waitingRoom;
    players: Map<string, Player> = new Map();
    currentPlayer: string | undefined;

    constructor(id: string, minChars = 1, maxChars = 24) {
        this.id = id;
        this.minChars = minChars;
        this.maxChars = maxChars;
    }

    private buildGameUpdateOutput(): GameUpdateOutput {
        return {
            gameState: this.state,
            currentPlayer: this.currentPlayer,
            remainingPlayers: this.getRemainingPlayers()
        };
    }

    addPlayer(name: string): PlayerUpdateOutput {
        if (this.state !== GameState.running) {
            throw new Error("Game already in session.");
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

    nextPlayer(): string {
        if (this.currentPlayer == null) {
            throw new Error("No current player.");
        }

        const remaining = this.getRemainingPlayers();
        const indexOfCurrent = remaining.indexOf(this.currentPlayer);
        return remaining[(indexOfCurrent + 1) % remaining.length];
    }

    /**
     * Will disconnect a player, setting player state and updating or removing
     * player from the player list depending on game state
     * */
    disconnectPlayer(name: string): PlayerUpdateOutput {
        if (this.state === GameState.ended) {
            throw new Error("Game has ended.");
        }

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

        return {
            forEffected: player.getSafeToSerialize(),
            forOthers: player.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput()
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

    guess(guess: string, actor: string, subject: string): GuessOutput {
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
        if (
            remainingPlayers.length <= 3
            && actorItem.lastGuessedAgainst.slice(0, 3).includes(subject)
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
                streamInfo = actor + " elminated " + subject + " with guessed letter " + guessFixed + ".";
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
                streamInfo = actor + " elminated " + subject + " with correct word guess " + guessFixed + ".";
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

    readyUpToggle(name: string): PlayerUpdateOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for ready toggling.");
        }

        const player = this.players.get(name);
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
        this.players.set(name, player);

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

        actorItem.word = wordFixed;
        actorItem.guessedWordPortion = "_".repeat(wordFixed.length);
        this.players.set(actor, actorItem);

        return {
            forEffected: actorItem.getSafeToSerialize(),
            forOthers: actorItem.getSanitizedCopy().getSafeToSerialize(),
            gameInfo: this.buildGameUpdateOutput()
        };
    }

    start(): GameStartOutput {
        if (this.state !== GameState.waitingRoom) {
            throw new Error("Game state doesn't allow for game start. Must be 'waitingRoom'.");
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
            newShuffledPlayers.set(name, this.players.get(name) as Player);
        }
        this.players = newShuffledPlayers;
        this.currentPlayer = shuffledPlayersList[0];

        const players: { [key: string]: PlayerSerializable } = {};
        for (const [name, val] of this.players.entries()) {
            players[name] = val.getSafeToSerialize();
        }

        return {
            players,
            ...this.buildGameUpdateOutput()
        };
    }
}
