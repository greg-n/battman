import { ServerItems, setUpServer, tearDownServerItems } from "../../server";
import { GameAction } from "../../entities/Game";
import WebSocket from "ws";
import request from "supertest";
import { rooms } from "../../state/rooms";

describe("ws rooms routing", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
        rooms.clear();
    });

    it.skip("Can create and join game", async (done) => {
        const expectedResp = [
            "Connected.",
            JSON.stringify({
                players: {
                    Steve: {
                        name: "Steve",
                        guessedWordPortion: null,
                        guessedLetters: [],
                        guessedWords: [],
                        eliminatedPlayers: [],
                        state: 0,
                        lastGuessedAgainst: [],
                        lastGuessedBy: []
                    }
                },
                gameInfo: {
                    action: 0,
                    state: 0,
                    waitingRoomMarshall: "Steve",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            }),
            JSON.stringify({
                players: {
                    name: "Will",
                    guessedWordPortion: null,
                    guessedLetters: [],
                    guessedWords: [],
                    eliminatedPlayers: [],
                    state: 0,
                    lastGuessedAgainst: [],
                    lastGuessedBy: []
                },
                gameInfo: {
                    action: 0,
                    state: 0,
                    waitingRoomMarshall: "Steve",
                    remainingPlayers: [],
                    minChars: 1,
                    maxChars: 24
                }
            })
        ];
        const expectedMsgs = expectedResp.length;

        const resp = await request(serverItems.app)
            .post("/rooms/testRoomName?creatorName=Steve")
            .expect(201);

        const token = resp.body.playerToken as string;
        const wsClient = new WebSocket(`ws://localhost:8080/rooms?accessToken=${token}`);
        wsClient.on("open", () => {
            let respIndex = 0;
            wsClient.on("message", async (msg: string) => {
                expect(msg).toBe(expectedResp[respIndex]);
                respIndex++;

                if (respIndex === expectedMsgs) {
                    wsClient.close();
                    done();
                } else if (respIndex === 2) {
                    // Add another player and expect the third message to be a broadcast
                    const sResp = await request(serverItems.app)
                        .put("/rooms/testRoomName/players?playerName=Will")
                        .expect(200);

                    const sToken = sResp.body.playerToken as string;
                    new WebSocket(`ws://localhost:8080/rooms?accessToken=${sToken}`);
                }
            });

            wsClient.send(JSON.stringify({ action: GameAction.join }));
        });
    });
});
