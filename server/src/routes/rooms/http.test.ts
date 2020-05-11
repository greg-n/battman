import { GameAction, GameState } from "../../entities/Game";
import { ServerItems, setUpServer, tearDownServerItems } from "../../server";
import jwt from "jsonwebtoken";
import request from "supertest";

describe("http rooms portion", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
    });

    describe("get", () => {
        it("Can find room/game by name", (done) => {
            request(serverItems.app)
                .get("/rooms/testRoomName")
                .expect(200, { result: null }, done);
        });
    });

    describe("post", () => {
        it("Can create room/game", async () => {
            let resp = await request(serverItems.app)
                .post("/rooms/testRoomName?creatorName=Steve")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        roomCreated: true,
                        playerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb29tTmFtZSI6InRlc3RSb29tTmFtZSIsInBsYXllck5hbWUiOiJTdGV2ZSJ9.KCMJ6uXNEpGAgv3-AIOUQyZQ_Wp682yB4nGm9udNzaQ",
                        playerUpdate: {
                            forEffected: {
                                eliminatedPlayers: [],
                                guessedLetters: [],
                                guessedWordPortion: null,
                                guessedWords: [],
                                lastGuessedAgainst: [],
                                lastGuessedBy: [],
                                name: "Steve",
                                state: 0,
                                word: null
                            },
                            gameInfo: {
                                gameAction: GameAction.join,
                                gameState: 0,
                                maxChars: 24,
                                minChars: 1,
                                remainingPlayers: [],
                                waitingRoomMarshall: "Steve"
                            }
                        }
                    }
                });

            const decoded = jwt.decode(resp.body.result.playerToken);
            expect(decoded).toStrictEqual({ roomName: "testRoomName", playerName: "Steve" });

            resp = await request(serverItems.app)
                .get("/rooms/testRoomName")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        gameState: GameState.waitingRoom,
                        playerCount: 1
                    }
                });
        });
    });

    describe("put", () => {
        it("Can add a player to a game in waiting", async () => {
            await request(serverItems.app)
                .post("/rooms/testRoomName?creatorName=Steve")
                .expect(200);

            let resp = await request(serverItems.app)
                .put("/rooms/testRoomName/players?playerName=Will")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        playerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb29tTmFtZSI6InRlc3RSb29tTmFtZSIsInBsYXllck5hbWUiOiJXaWxsIn0.fx7jStfvWyNglpn5du5mF5WRC0odKljYnIgU9Ctb5aQ",
                        playerUpdate: {
                            forEffected: {
                                eliminatedPlayers: [],
                                guessedLetters: [],
                                guessedWordPortion: null,
                                guessedWords: [],
                                lastGuessedAgainst: [],
                                lastGuessedBy: [],
                                name: "Will",
                                state: 0,
                                word: null
                            },
                            gameInfo: {
                                gameAction: GameAction.join,
                                gameState: 0,
                                maxChars: 24,
                                minChars: 1,
                                remainingPlayers: [],
                                waitingRoomMarshall: "Steve"
                            }
                        }
                    }
                });

            resp = await request(serverItems.app)
                .get("/rooms/testRoomName")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        gameState: GameState.waitingRoom,
                        playerCount: 2
                    }
                });
        });
    });
});
