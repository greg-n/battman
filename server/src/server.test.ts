import { ServerItems, setUpServer, tearDownServerItems } from "./server";
import WebSocket from "ws";
import request from "supertest";

describe("index", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
    });

    it("Can connect", (done) => {
        const wsClient = new WebSocket("ws://localhost:3000");
        wsClient.on("open", () => {
            wsClient.on("message", (msg: string) => {
                expect(msg).toBe(JSON.stringify({ result: "Connected." }));
                wsClient.close();
                done();
            });
        });
    });

    it("Can be health checked", (done) => {
        request(serverItems.app)
            .get("/healthCheck")
            .expect(200, done);
    });
});
