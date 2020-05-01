import * as express from "express";
import * as http from "http";
import * as socketIO from "socket.io";

export interface ServerItems {
    app: Express.Application;
    server: http.Server;
    io: socketIO.Server;
}

export async function setUpServer(): Promise<ServerItems> {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);

    app.get("/", (req, res) => {
        res.sendStatus(200);
    });

    io.on("connection", () => {
        console.log("a user connected");
    });

    await new Promise((resolve) => {
        server.listen(3000, () => {
            console.log("listening on *:3000");
            resolve();
        });
    });

    return { app, server, io };
}

export function tearDownServerItems({ server, io }: ServerItems): void {
    io.close();
    server.close();
}
