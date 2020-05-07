import * as http from "http";
import WebSocket from "ws";

import buildWSLogic from "./controllers";

export interface ServerItems {
    server: http.Server;
    wss: WebSocket.Server;
}

let server: http.Server | undefined;
let wss: WebSocket.Server | undefined;

export { server, wss };

export async function setUpServer(): Promise<ServerItems> {
    server = http.createServer((request, response) => {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("healthy as can be");
    });
    wss = new WebSocket.Server({ server });

    buildWSLogic(wss);

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
