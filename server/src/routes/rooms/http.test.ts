import { ServerItems, setUpServer, tearDownServerItems } from "../../server";
import { GameState } from "../../entities/Game";
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
                        created: true,
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
                        playerCount: 1
                    }
                });
        });
    });
});
