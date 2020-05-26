import { GameAction, GameState } from "../../entities/Game";
import { ServerItems, setUpServer, tearDownServerItems } from "../../server";
import { PlayerState } from "../../entities/Player";
import { PlayerTokenInfo } from "../../utils/playerToken";
import WebSocket from "ws";
import request from "supertest";
import { rooms } from "../../state/rooms";
import { ws } from "./ws";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface WebSocketMock {
    onceMock: jest.Mock<any, any>;
    sendMock: jest.Mock<any, any>;
    mockImp: WebSocket;
    clearMocks: () => void;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const wsMockGen = (): WebSocketMock => {
    const onceMock = jest.fn();
    const sendMock = jest.fn();
    const mockImp = {
        once: onceMock,
        readyState: WebSocket.OPEN,
        send: sendMock
    } as unknown as WebSocket;
    const clearMocks = (): void => {
        onceMock.mockClear();
        sendMock.mockClear();
    };

    return {
        onceMock,
        sendMock,
        mockImp,
        clearMocks
    };
};

const playerTokens = {
    Steve: {
        roomName: "testRoomName",
        playerName: "Steve"
    },
    Will: {
        roomName: "testRoomName",
        playerName: "Will"
    }
};

describe("ws rooms controller", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
        rooms.clear();
    });

    it("Can play a game", async () => {
        const players = {
            Steve: wsMockGen(),
            Will: wsMockGen()
        };

        await request(serverItems.app)
            .post("/rooms/testRoomName?creatorName=Steve")
            .expect(201);
        ws.joinGame(players.Steve.mockImp, playerTokens.Steve);
        expect(players.Steve.sendMock).toHaveBeenCalledTimes(1);

        await request(serverItems.app)
            .put("/rooms/testRoomName/players?playerName=Will")
            .expect(200);
        ws.joinGame(players.Will.mockImp, playerTokens.Will);
        expect(players.Will.sendMock).toHaveBeenCalledTimes(1);
        expect(players.Steve.sendMock).toHaveBeenCalledTimes(2);

        // Expect broadcast of new player to Steve, the existing player
        expect(JSON.parse(players.Steve.sendMock.mock.calls[1][0]))
            .toStrictEqual({
                players: {
                    Steve: {
                        name: "Steve",
                        guessedWordPortion: null,
                        guessedLetters: [],
                        guessedWords: [],
                        eliminatedPlayers: [],
                        state: PlayerState.joined,
                        lastGuessedAgainst: [],
                        lastGuessedBy: []
                    },
                    Will: {
                        name: "Will",
                        guessedWordPortion: null,
                        guessedLetters: [],
                        guessedWords: [],
                        eliminatedPlayers: [],
                        state: PlayerState.joined,
                        lastGuessedAgainst: [],
                        lastGuessedBy: []
                    }
                },
                gameInfo: {
                    action: GameAction.join,
                    state: GameState.waitingRoom,
                    waitingRoomMarshall: "Steve",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            });

        ws.transferMarshalship(
            players.Steve.mockImp,
            playerTokens.Steve as PlayerTokenInfo,
            {
                action: GameAction.transferMarshalship,
                subject: "Will"
            }
        );
        // Expect broadcasting to both players
        let expected: unknown = {
            gameInfo: {
                action: GameAction.transferMarshalship,
                state: GameState.waitingRoom,
                waitingRoomMarshall: "Will",
                remainingPlayers: [],
                minChars: 1,
                maxChars: 24
            }
        };
        expect(JSON.parse(players.Steve.sendMock.mock.calls[2][0]))
            .toStrictEqual(expected);
        expect(JSON.parse(players.Will.sendMock.mock.calls[1][0]))
            .toStrictEqual(expected);

        // set one word here and toggle ready to test constraint failure untoggle
        ws.setWord(
            players.Steve.mockImp,
            playerTokens.Steve,
            { action: GameAction.setWord, word: "ownership" }
        );
        expect(JSON.parse(players.Steve.sendMock.mock.calls[3][0]))
            .toStrictEqual({
                forEffected: {
                    name: "Steve",
                    word: "ownership",
                    guessedWordPortion: "_________",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.joined,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    action: GameAction.setWord,
                    state: GameState.waitingRoom,
                    waitingRoomMarshall: "Will",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            });
        expect(JSON.parse(players.Will.sendMock.mock.calls[2][0]))
            .toStrictEqual({
                forOthers: {
                    name: "Steve",
                    guessedWordPortion: "_________",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.joined,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    action: GameAction.setWord,
                    state: GameState.waitingRoom,
                    waitingRoomMarshall: "Will",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            });

        ws.readyToggle(
            players.Steve.mockImp,
            playerTokens.Steve,
        );
        expect(JSON.parse(players.Steve.sendMock.mock.calls[4][0]))
            .toStrictEqual({
                forEffected: {
                    name: "Steve",
                    word: "ownership",
                    guessedWordPortion: "_________",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.ready,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    action: GameAction.readyToggle,
                    state: GameState.waitingRoom,
                    waitingRoomMarshall: "Will",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            });
        expect(JSON.parse(players.Will.sendMock.mock.calls[3][0]))
            .toStrictEqual({
                forOthers: {
                    name: "Steve",
                    guessedWordPortion: "_________",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.ready,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    action: GameAction.readyToggle,
                    state: GameState.waitingRoom,
                    waitingRoomMarshall: "Will",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            });

        ws.changeWordConstraints(
            players.Will.mockImp,
            playerTokens.Will,
            { action: GameAction.changeWordConstraints, minChars: 5, maxChars: 5 }
        );
        expected = {
            players: {
                Steve: {
                    name: "Steve",
                    guessedWordPortion: null,
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.joined,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                Will: {
                    name: "Will",
                    guessedWordPortion: null,
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.joined,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                }
            },
            gameInfo: {
                action: GameAction.changeWordConstraints,
                state: GameState.waitingRoom,
                waitingRoomMarshall: "Will",
                remainingPlayers: [],
                minChars: 5,
                maxChars: 5
            }
        };
        expect(JSON.parse(players.Steve.sendMock.mock.calls[5][0]))
            .toStrictEqual(expected);
        expect(JSON.parse(players.Will.sendMock.mock.calls[4][0]))
            .toStrictEqual(expected);

        // ready up and start game
        // first attempts should fail
        ws.readyToggle(
            players.Steve.mockImp,
            playerTokens.Steve,
        );
        ws.readyToggle(
            players.Will.mockImp,
            playerTokens.Will,
        );
        expected = { error: "Player must have set a word to ready up." };
        expect(JSON.parse(players.Steve.sendMock.mock.calls[6][0]))
            .toStrictEqual(expected);
        expect(JSON.parse(players.Will.sendMock.mock.calls[5][0]))
            .toStrictEqual(expected);

        ws.startGame(
            players.Will.mockImp,
            playerTokens.Will
        );
        expected = { error: "Players Steve,Will are not ready to play." };
        expect(JSON.parse(players.Steve.sendMock.mock.calls[7][0]))
            .toStrictEqual(expected);
        expect(JSON.parse(players.Will.sendMock.mock.calls[6][0]))
            .toStrictEqual(expected);

        ws.setWord(
            players.Steve.mockImp,
            playerTokens.Steve,
            { action: GameAction.setWord, word: "bread" }
        );
        ws.setWord(
            players.Will.mockImp,
            playerTokens.Will,
            { action: GameAction.setWord, word: "total" }
        );
        expect(JSON.parse(players.Steve.sendMock.mock.calls[9][0]).gameInfo)
            .toBeDefined();
        expect(JSON.parse(players.Will.sendMock.mock.calls[8][0]).gameInfo)
            .toBeDefined();

        ws.readyToggle(
            players.Steve.mockImp,
            playerTokens.Steve,
        );
        ws.readyToggle(
            players.Will.mockImp,
            playerTokens.Will,
        );
        expect(players.Steve.sendMock)
            .toHaveBeenCalledTimes(12);
        expect(players.Will.sendMock)
            .toHaveBeenCalledTimes(11);

        ws.startGame(
            players.Will.mockImp,
            playerTokens.Will
        );
        expected = {
            players: {
                Steve: {
                    name: "Steve",
                    guessedWordPortion: "_____",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.playing,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                Will: {
                    name: "Will",
                    guessedWordPortion: "_____",
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.playing,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                }
            },
            gameInfo: {
                action: GameAction.startGame,
                state: GameState.running,
                // omitting current player because it is randomly selected
                waitingRoomMarshall: "Will",
                // omitting current remainingPlayers because it is randomly selected
                minChars: 5,
                maxChars: 5
            }
        };
        expect(JSON.parse(players.Steve.sendMock.mock.calls[12][0]))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .toMatchObject(expected as any);
        expect(JSON.parse(players.Will.sendMock.mock.calls[11][0]))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .toMatchObject(expected as any);

        const gameInfo = JSON.parse(players.Steve.sendMock.mock.calls[12][0]).gameInfo;
        const currIsS = gameInfo.currentPlayer === "Steve";
        ws.guess(
            currIsS ? players.Steve.mockImp : players.Will.mockImp,
            currIsS ? playerTokens.Steve : playerTokens.Will,
            {
                action: GameAction.guess,
                subject: currIsS ? "Will" : "Steve",
                guess: "a"
            }
        );

        ws.disconnectFromGame(players.Steve.mockImp, playerTokens.Steve);
        expect(JSON.parse(players.Will.sendMock.mock.calls[13][0]))
            .toMatchObject({
                gameInfo: {
                    state: GameState.ended
                },
                players: {
                    Will: {
                        state: PlayerState.victor
                    },
                    Steve: {
                        state: PlayerState.disconnected
                    }
                }
            });
    });
});
