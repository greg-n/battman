export default function landing(socket: import("ws")): void {
    console.log("a user connected");
    socket.send("hello");
}