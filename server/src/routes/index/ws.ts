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
            this.isAlive = true;
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

        ws.send(JSON.stringify({ result: "Connected." }));
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach((ws) => {
            // @ts-ignore
            if (ws.isAlive === false) {
                // TODO determine a way to kick a player when connection is cut (possibly by state: map<string (clientId), PlayerTokenInfo>)
                // store client ws items in map on room state next to game item
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
