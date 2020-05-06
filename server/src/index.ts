import express from "express";
import * as http from "http";
import socketIO from "socket.io";

import landing from "./controllers";

export interface ServerItems {
    app: Express.Application;
    server: http.Server;
    io: socketIO.Server;
}

let app: express.Application | undefined;
let server: http.Server | undefined;
let io: socketIO.Server | undefined;

export { app, server, io };

export async function setUpServer(): Promise<ServerItems> {
    app = express();
    server = http.createServer(app);
    io = socketIO(server);

    app.get("/healthy", (req, res) => {
        res.sendStatus(200);
    });

    io.on("connection", landing);

    await new Promise((resolve) => {
        server?.listen(3000, () => {
            console.log("listening on *:3000");
            resolve();
        });
    });

    return { app, server, io };
}

export async function tearDownServerItems({ server, io }: ServerItems): Promise<void> {
    await new Promise((resolve) => {
        server.close((err) => {
            if (err != null)
                console.error(err);
            resolve();
        });
    });

    await new Promise((resolve) => {
        io.close(() => {
            resolve();
        });
    });
}
