import { GameAction, GameStateOutput } from "../../entities/Game";
import { PlayerTokenInfo } from "../../utils/playerToken";
import WebSocket from "ws";
import broadcastToRoom from "../../state/utils/broadcastToRoom";
import { rooms } from "../../state/rooms";

export namespace ws {
    export function disconnectFromGame(ws: WebSocket, token: PlayerTokenInfo, closeClient?: boolean): void {
        const room = rooms.get(token.roomName);
        if (room == null) {
            ws.send(JSON.stringify({ error: "Requested room does not exist." }));
            return;
        }

        let gameState: GameStateOutput;
        try {
            gameState = room.game.disconnectPlayer(token.playerName);
        } catch (error) {
            if (ws.readyState !== WebSocket.OPEN)
                ws.send(JSON.stringify({ error: error.message }));
            return;
        }

        if (!room.clients.has(token.playerName)) {
            if (ws.readyState !== WebSocket.OPEN)
                ws.send(JSON.stringify({ error: "Client connection could not be found." }));
            return;
        }

        if (closeClient) {
            const client = room.clients.get(token.playerName);
            client?.close();
        }

        room.clients.delete(token.playerName);
        broadcastToRoom(token.roomName, gameState, token.playerName);
    }

    export function joinGame(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName);
        if (room == null) {
            ws.send(JSON.stringify({ error: "Requested room does not exist." }));
            return;
        }
        if (room.clients.has(token.playerName)) {
            ws.send(JSON.stringify({ error: "Client connection has already been established for this room." }));
            return;
        }

        ws.once("close", () => {
            disconnectFromGame(ws, token, false);
        });

        room.clients.set(token.playerName, ws);
        const gameState = room.game.getGameState(GameAction.join);
        ws.send(JSON.stringify(gameState));
    }
}
