import * as http from "http";
import express, { NextFunction, Request, Response } from "express";
import WebSocket from "ws";
import buildWsRouting from "./routes/index/ws";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { router } from "./routes/index/http";

export interface ServerItems {
    app: express.Express;
    server: http.Server;
    wss: WebSocket.Server;
}

function checkRequireENV(): void {
    if (process.env.JWT_SECRET == null)
        throw new Error("process.env.JWT_SECRET must be defined.");
}

export async function setUpServer(): Promise<ServerItems> {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    checkRequireENV();

    app.use(cors({ origin: ["http://localhost:3000", "https://greg.noonan.be/battman"] }));
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

    // serve build
    const sep = path.sep;
    const appBuildPath = path.join(__dirname, `..${sep}..${sep}client${sep}build${sep}`);
    app.use(express.static(appBuildPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(appBuildPath), "index.html");
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
