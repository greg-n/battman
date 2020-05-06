export default function landing(socket: import("socket.io").Socket): void {
    console.log("a user connected", socket.id);
    socket.emit("hello");
}