import { ServerItems, setUpServer, tearDownServerItems } from "./server";
import WebSocket from "ws";
import request from "supertest";

function client(
): WebSocket {
    const url = "ws://localhost:" + 3000;

    return new WebSocket(url);
}

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
        const c = client();
        c.on("open", () => {
            c.on("message", (msg: string) => {
                expect(msg).toBe("hello");
                c.close();
                done();
            });
        });
        expect(1 + 1).toBe(2);
    });

    it("Can be health checked", (done) => {
        request(serverItems.app)
            .get("/healthCheck")
            .expect(200, done);
    });
});
