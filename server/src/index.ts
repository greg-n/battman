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

    app.get("/healthy", (req, res) => {
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
