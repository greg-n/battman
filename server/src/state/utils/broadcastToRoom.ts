import { rooms } from "../rooms";

export default function broadcastToRoom(room: string, message: object, excludePlayer?: string): void {
    const roomObj = rooms.get(room);
    if (roomObj == null)
        return;

    const messageStr = JSON.stringify(message);
    for (const [cName, cWs] of roomObj.clients) {
        if (cName === excludePlayer)
            continue;

        if (cWs.readyState === WebSocket.OPEN)
            cWs.send(messageStr);
    }
}
