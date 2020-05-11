import { ServerItems, setUpServer, tearDownServerItems } from "../../server";
import WebSocket from "ws";
import jwt from "jsonwebtoken";
import request from "supertest";

describe("ws rooms portion", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
    });

    it("Can create and join game", async (done) => {
        const expectedResp = [
            JSON.stringify({ result: "Connected." }),
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
                    gameAction: 0,
                    gameState: 0,
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
            .expect(200);

        const token = resp.body.result.playerToken as string;
        const wsClient = new WebSocket(`ws://localhost:3000/rooms?accessToken=${token}`);
        wsClient.on("open", () => {
            let respIndex = 0;
            wsClient.on("message", (msg: string) => {
                expect(msg).toBe(expectedResp[respIndex]);
                respIndex++;
                if (respIndex === expectedMsgs) {
                    wsClient.close();
                    done();
                }
            });
            wsClient.send(JSON.stringify({ action: 0 }));
        });
    }, 10_000);
});
