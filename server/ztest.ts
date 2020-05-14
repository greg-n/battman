import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    console.log("is open");
    ws.on("message", (data) => {
        console.log("message", data);
    });
    ws.on("close", (code, reason) => {
        console.log("error", code, reason);
    });
    ws.on("error", (err) => {
        console.log("error", err);
    });
    ws.on("ping", () => {
        console.log("ping");
    });
});
