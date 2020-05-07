import * as http from "http";
import WebSocket from "ws";

import buildWSRouting from "./routes/ws";

export interface ServerItems {
    server: http.Server;
    wss: WebSocket.Server;
}

let server: http.Server | undefined;
let wss: WebSocket.Server | undefined;

export { server, wss };

// TODO design with either pure ws or mix of ws and express for joining rooms/making tokens
export async function setUpServer(): Promise<ServerItems> {
    server = http.createServer((request, response) => {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("healthy as can be");
    });
    wss = new WebSocket.Server({ server });

    buildWSRouting(wss);

    await new Promise((resolve) => {
        server?.listen(3000, () => {
            console.log("listening on *:3000");
            resolve();
        });
    });

    return { server, wss };
}

export async function tearDownServerItems({ server, wss }: ServerItems): Promise<void> {
    await new Promise((resolve) => {
        server.close((err) => {
            if (err != null)
                console.error(err);
            resolve();
        });
    });

    await new Promise((resolve) => {
        wss.close((err) => {
            if (err != null)
                console.error(err);
            resolve();
        });
    });
}
