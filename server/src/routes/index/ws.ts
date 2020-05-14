// This file will need ignoring for broken connection detection
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import WebSocket from "ws";
import buildRoomsRouting from "../rooms/ws";
import qs from "qs";

export default function buildWsRouting(wss: WebSocket.Server): void {
    wss.on("connection", (ws, req) => {
        // @ts-ignore for connection detection tracking within the interval
        ws.isAlive = true;
        ws.on("pong", () => {
            // @ts-ignore this is defined in type definition for this cb
            ws.isAlive = true;
        });
        ws.on("error", (error) => {
            console.trace(error);
        });

        const url = req.url;
        if (url == null)
            return;

        const queryIndex = url.indexOf("?");
        const path = url.slice(0, queryIndex);
        const queryParams = qs.parse(url.slice(queryIndex + 1));
        switch (path) {
            case "/rooms":
                buildRoomsRouting(ws, queryParams);
                break;
        }

        ws.send("Connected.");
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach((ws) => {
            // @ts-ignore
            if (ws.isAlive === false) {
                // Will trigger "close" on ws of player and disconnect them from a game
                return ws.terminate();
            }

            // @ts-ignore
            ws.isAlive = false;
            ws.ping();
        });
    }, Number(process.env.PING_INTERVAL) || 30000);

    wss.on("close", () => {
        clearInterval(interval);
    });
}
