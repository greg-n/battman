import { PlayerUpdateOutput } from "../../entities/Game";
import WebSocket from "ws";
import { rooms } from "../rooms";

export function toRoom(room: string, message: object, excludePlayer?: string | string[]): void {
    const roomObj = rooms.get(room);
    if (roomObj == null)
        return;

    const messageStr = JSON.stringify(message);
    for (const [cName, cWs] of roomObj.clients) {
        if (
            cName === excludePlayer
            || (Array.isArray(excludePlayer) && excludePlayer.includes(cName))
        ) {
            continue;
        }

        if (cWs.readyState === WebSocket.OPEN)
            cWs.send(messageStr);
    }
}

export function playerUpdateToEachKey(room: string, messages: { [key: string]: PlayerUpdateOutput }): void {
    const roomObj = rooms.get(room);
    if (roomObj == null)
        return;

    for (const [name, message] of Object.entries(messages)) {
        const cWs = roomObj.clients.get(name);
        if (cWs == null) {
            continue;
        }

        const messageStr = JSON.stringify(message);
        if (cWs.readyState === WebSocket.OPEN) {
            cWs.send(messageStr);
            toRoom(
                room,
                { forAll: message.forAll, gameInfo: message.gameInfo },
                name
            );
        }
    }
}
