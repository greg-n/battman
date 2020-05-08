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
                .post("/rooms/testRoomName")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        created: true
                    }
                });

            resp = await request(serverItems.app)
                .get("/rooms/testRoomName")
                .expect(200);
            expect(resp.body)
                .toStrictEqual({
                    result: {
                        gameState: GameState.waitingRoom,
                        playerCount: 0
                    }
                });
        });
    });
});
