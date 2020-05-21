import * as http from "http";
import dotenv, { DotenvConfigOptions } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import WebSocket from "ws";
import buildWsRouting from "./routes/index/ws";
import cors from "cors";
import helmet from "helmet";
import { router } from "./routes/index/http";

export interface ServerItems {
    app: express.Express;
    server: http.Server;
    wss: WebSocket.Server;
}

export async function setUpServer(): Promise<ServerItems> {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    const dotenvConfig: DotenvConfigOptions = {};
    switch (process.env.NODE_ENV) {
        case "test":
            dotenvConfig.path = `${__dirname}/../.env.test.local`;
            break;
        default:
            dotenvConfig.path = `${__dirname}/../.env.development.local`;
    }
    dotenv.config(dotenvConfig);

    app.use(cors({ origin: ["http://localhost:3000"] }));
    app.use(helmet());
    app.use(router);
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Http error:", error);
        if (res.headersSent) {
            return next(error);
        }
        res.status(500).json({ error: error.message });
    });

    buildWsRouting(wss);
    wss.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    await new Promise((resolve) => {
        server.listen(8080, () => {
            if (process.env.NODE_ENV !== "test")
                console.log("listening on *:8080");
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
