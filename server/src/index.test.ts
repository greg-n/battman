import * as ioc from "socket.io-client";
import { ServerItems, setUpServer, tearDownServerItems } from ".";

const defaultOpts = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
};

function client(
    serverItems: ServerItems,
    nsp?: object,
    opts: SocketIOClient.ConnectOpts = defaultOpts
): SocketIOClient.Socket {
    if ("object" == typeof nsp) {
        opts = nsp;
    }
    const url = "ws://localhost:" + 3000;

    return ioc(url, opts);
}

describe("index", () => {
    let serverItems: ServerItems;
    beforeEach(async () => {
        serverItems = await setUpServer();
    });

    afterEach(() => {
        if (serverItems != null)
            tearDownServerItems(serverItems);
    });

    it("can be tested", (done) => {
        const c = client(serverItems);
        c.on("connect", () => {
            done();
        });
        expect(1 + 1).toBe(2);
    });
});
