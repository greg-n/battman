import { ServerItems, setUpServer, tearDownServerItems } from "./server";
import WebSocket from "ws";
import request from "supertest";

describe("server", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(async () => {
        if (serverItems != null)
            await tearDownServerItems(serverItems);
    });

    it("Can connect", (done) => {
        const wsClient = new WebSocket("ws://localhost:8080");
        wsClient.on("open", () => {
            wsClient.on("message", (msg: string) => {
                expect(msg).toBe("Connected.");
                wsClient.close();
                done();
            });
        });
    });

    it.skip("Can do the pings and the pongs", (done) => {
        const wsClient = new WebSocket("ws://localhost:8080");
        wsClient.on("open", () => {
            wsClient.on("message", (msg: string) => {
                expect(msg).toBe("Connected.");
            });
            wsClient.on("error", (err) => {
                console.error(err);
            });
            let pings = 0;
            wsClient.on("ping", () => {
                pings++;
                if (pings === 2) {
                    wsClient.close();
                    done();
                }
            });
        });
    });

    it("Can be health checked", (done) => {
        request(serverItems.app)
            .get("/healthCheck")
            .expect(200, done);
    });
});
