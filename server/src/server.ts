import * as http from "http";
import WebSocket from "ws";
import buildWsRouting from "./routes/ws";
import express from "express";
import helmet from "helmet";
import { router } from "./routes/http";

export interface ServerItems {
    app: express.Express;
    server: http.Server;
    wss: WebSocket.Server;
}

// TODO ws for game logic and express for joining rooms/making tokens
export async function setUpServer(): Promise<ServerItems> {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    app.use(helmet());
    app.use(router);
    buildWsRouting(wss);

    await new Promise((resolve) => {
        server.listen(3000, () => {
            console.log("listening on *:3000");
            resolve();
        });
    });

    return { app, server, wss };
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
