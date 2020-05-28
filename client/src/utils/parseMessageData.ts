import { GameAction, GameState, GameStateOutput, GameUpdate, PlayerUpdateOutput } from "../types/Game";
import { Player, PlayerState } from "../types/Player";

export interface ErrorMessage {
    error: string;
}

export interface CurrentGameState {
    clientState: Player;
    playerStates: { [key: string]: Player };
    gameInfo: GameUpdate;
}

interface SomeGameUpdate {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    gameInfo: GameUpdate;
}

export function buildInitCurrentGameState(data: PlayerUpdateOutput): CurrentGameState {
    let newClientState: Player | undefined;

    if (data.forEffected != null) {
        newClientState = data.forEffected;
    } else {
        newClientState = {
            name: "",
            guessedWordPortion: null,
            guessedLetters: [],
            guessedWords: [],
            eliminatedPlayers: [],
            state: PlayerState.joined,
            lastGuessedAgainst: [],
            lastGuessedBy: []
        };
    }

    const newPlayerState: { [key: string]: Player } = {};
    newPlayerState[data.forAll.name] = data.forAll;

    return {
        clientState: newClientState,
        gameInfo: data.gameInfo,
        playerStates: newPlayerState
    };
}

// ensure that the gameInfo field exists and is filled out
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureNecessaryFields(data: any): void {
    if (data.gameInfo == null)
        throw new Error("Game info field is not valid.");
    if (!(data.gameInfo.action in GameAction))
        throw new Error("Game info field action is not valid.");
    if (!(data.gameInfo.state in GameState))
        throw new Error("Game info field state is not valid.");
    if (data.gameInfo.currentPlayer != null && typeof data.gameInfo.currentPlayer !== "string")
        throw new Error("Game info field currentPlayer is not valid.");
    if (data.gameInfo.waitingRoomMarshall != null && typeof data.gameInfo.waitingRoomMarshall !== "string")
        throw new Error("Game info field waitingRoomMarshall is not valid.");
    if (!Array.isArray(data.gameInfo.remainingPlayers))
        throw new Error("Game info field remainingPlayers is not valid.");
    if (typeof data.gameInfo.minChars !== "number")
        throw new Error("Game info field minChars is not valid.");
    if (typeof data.gameInfo.maxChars !== "number")
        throw new Error("Game info field maxChars is not valid.");
}

export default function parseMessageData(
    rawData: string,
    oldState: CurrentGameState
): ErrorMessage | CurrentGameState {
    const data: SomeGameUpdate = JSON.parse(rawData);
    if (typeof data.error === "string") {
        return data as unknown as ErrorMessage;
    }
    ensureNecessaryFields(data);
    // assertion of SomeGameUpdate

    switch (data.gameInfo.action) {
        case GameAction.join:
        case GameAction.disconnect:
        case GameAction.changeWordConstraints:
        case GameAction.startGame:
            return {
                clientState: oldState.clientState,
                gameInfo: data.gameInfo,
                playerStates: (data as GameStateOutput).players
            };
        case GameAction.transferMarshalship:
            return {
                clientState: oldState.clientState,
                gameInfo: data.gameInfo,
                playerStates: oldState.playerStates
            };
        case GameAction.setWord:
        case GameAction.readyToggle:
            return parsePlayerUpdateOutput(data, oldState);
        case GameAction.guess:
            return parseGuess(data, oldState);
        case GameAction.getGameState:
            return {
                clientState: data.clientState || oldState.clientState,
                gameInfo: data.gameInfo,
                playerStates: (data as GameStateOutput).players
            };
        default:
            throw new Error(`Unknown game action '${data.gameInfo.action}'.`);
    }
}

function parseGuess(data: SomeGameUpdate, oldState: CurrentGameState): CurrentGameState {
    const newState = oldState;
    newState.gameInfo = data.gameInfo;

    if (data.actorUpdate.forEffected != null) {
        newState.clientState = data.actorUpdate.forEffected;
    }
    if (data.subjectUpdate.forEffected != null) {
        newState.clientState = data.subjectUpdate.forEffected;
    }
    const newPlayerStates = oldState.playerStates;
    newPlayerStates[data.actorUpdate.forAll.name] = data.actorUpdate.forAll;
    newPlayerStates[data.subjectUpdate.forAll.name] = data.subjectUpdate.forAll;
    newState.playerStates = newPlayerStates;

    return newState;
}

function parsePlayerUpdateOutput(data: SomeGameUpdate, oldState: CurrentGameState): CurrentGameState {
    const newState = oldState;
    newState.gameInfo = data.gameInfo;

    if (data.forEffected != null) {
        newState.clientState = data.forEffected;
    }
    const newPlayerStates = oldState.playerStates;
    newPlayerStates[data.forAll.name] = data.forAll;
    newState.playerStates = newPlayerStates;

    return newState;
}

/*
{
    "players": {
        "greg": {
            "name": "greg",
            "guessedWordPortion": null,
            "guessedLetters": [],
            "guessedWords": [],
            "eliminatedPlayers": [],
            "state": 0,
            "lastGuessedAgainst": [],
            "lastGuessedBy": []
        }
    },
    "gameInfo": {
        "action": 0,
        "state": 0,
        "waitingRoomMarshall": "greg",
        "remainingPlayers": [],
        "minChars": 1,
        "maxChars": 24
    }
}
*/
