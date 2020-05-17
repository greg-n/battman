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
    mockImp: {
        once: jest.Mock<any, any>;
        readyState: number;
        send: jest.Mock<any, any>;
    };
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
    };
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

    it("Can play a game", async (done) => {
        const players = {
            Steve: wsMockGen(),
            Will: wsMockGen()
        };

        await request(serverItems.app)
            .post("/rooms/testRoomName?creatorName=Steve")
            .expect(201);
        ws.joinGame(players.Steve.mockImp as unknown as WebSocket, playerTokens.Steve);
        expect(players.Steve.sendMock).toHaveBeenCalledTimes(1);

        await request(serverItems.app)
            .put("/rooms/testRoomName/players?playerName=Will")
            .expect(200);
        ws.joinGame(players.Will.mockImp as unknown as WebSocket, playerTokens.Will);
        expect(players.Will.sendMock).toHaveBeenCalledTimes(1);
        expect(players.Steve.sendMock).toHaveBeenCalledTimes(2);

        // Expect broadcast of new player to Steve, the existing player
        expect(players.Steve.sendMock.mock.calls[1][0])
            .toStrictEqual(JSON.stringify({
                forOthers: {
                    name: "Will",
                    guessedWordPortion: null,
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: PlayerState.joined,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    gameAction: GameAction.join,
                    gameState: GameState.waitingRoom,
                    waitingRoomMarshall: "Steve",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            }));

        ws.transferMarshalship(
            players.Steve.mockImp as unknown as WebSocket,
            playerTokens.Steve as PlayerTokenInfo,
            {
                action: GameAction.transferMarshalship,
                subject: "Will"
            }
        );

        // Expect broadcasting to both players
        const expected = {
            gameInfo: {
                gameAction: GameAction.transferMarshalship,
                gameState: GameState.waitingRoom,
                waitingRoomMarshall: "Will",
                remainingPlayers: [],
                minChars: 1,
                maxChars: 24
            }
        };
        expect(players.Steve.sendMock.mock.calls[2][0])
            .toStrictEqual(JSON.stringify(expected));
        expect(players.Will.sendMock.mock.calls[1][0])
            .toStrictEqual(JSON.stringify(expected));

        done();
    });
});
