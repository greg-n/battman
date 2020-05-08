// This file will need ignoring for broken connection detection
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import WebSocket from "ws";

export default function buildWsRouting(wss: WebSocket.Server): void {
    wss.on("connection", (ws) => {
        // @ts-ignore for connection detection tracking within the interval
        ws.isAlive = true;
        ws.on("pong", () => {
            // @ts-ignore this is defined in type definition for this cb
            this.isAlive = true;
        });

        ws.send("hello");
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach((ws) => {
            // @ts-ignore
            if (ws.isAlive === false) {
                // TODO determine a way to kick a player when connection is cut
                return ws.terminate();
            }

            // @ts-ignore
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => {
        clearInterval(interval);
    });
}