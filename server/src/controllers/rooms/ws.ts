import { GameAction, GameStateOutput } from "../../entities/Game";
import { Room, rooms } from "../../state/rooms";
import { PlayerTokenInfo } from "../../utils/playerToken";
import { RoomsMessageData } from "../../routes/rooms/ws";
import WebSocket from "ws";
import broadcastToRoom from "../../state/utils/broadcastToRoom";

// Will trust that room in token exists
export namespace ws {
    export function changeWordConstraints(
        ws: WebSocket,
        token: PlayerTokenInfo,
        message: RoomsMessageData
    ): void {
        const room = rooms.get(token.roomName) as Room;
        try {
            const result = room.game.changeWordConstraints(
                token.playerName,
                message.minChars,
                message.maxChars
            );
            rooms.set(token.roomName, room);
            broadcastToRoom(token.roomName, result);
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }

    export function disconnectFromGame(
        ws: WebSocket,
        token: PlayerTokenInfo,
        closeClient?: boolean
    ): void {
        const room = rooms.get(token.roomName) as Room;

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
        if (room.clients.size > 0) {
            rooms.set(token.roomName, room);
            broadcastToRoom(token.roomName, gameState, token.playerName);
        } else
            rooms.delete(token.roomName); // Delete room if no clients remain after one leaves
    }

    export function getGameState(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName) as Room;

        const gameState = room.game.getGameState();
        ws.send(JSON.stringify(gameState));
    }

    export function guess(ws: WebSocket, token: PlayerTokenInfo, message: RoomsMessageData): void {
        const room = rooms.get(token.roomName) as Room;
        // May return null but should be handled by game if problem arises
        const subjectClient = room.clients.get(message.subject || "");
        try {
            const guessOutput = room.game.guess(
                token.playerName,
                message.subject || "",
                message.guess || ""
            );
            rooms.set(token.roomName, room);

            broadcastToRoom(
                token.roomName,
                {
                    actorUpdate: { forOthers: guessOutput.actorUpdate.forOthers },
                    subjectUpdate: { forOthers: guessOutput.subjectUpdate.forOthers },
                    streamInfo: guessOutput.streamInfo,
                    gameInfo: guessOutput.gameInfo
                },
                [token.playerName, message.subject || ""]
            );
            ws.send(JSON.stringify({
                actorUpdate: { forEffected: guessOutput.actorUpdate.forEffected },
                subjectUpdate: { forOthers: guessOutput.subjectUpdate.forOthers },
                streamInfo: guessOutput.streamInfo,
                gameInfo: guessOutput.gameInfo
            }));
            subjectClient?.send(JSON.stringify({
                actorUpdate: { forOthers: guessOutput.actorUpdate.forOthers },
                subjectUpdate: { forEffected: guessOutput.subjectUpdate.forEffected },
                streamInfo: guessOutput.streamInfo,
                gameInfo: guessOutput.gameInfo
            }));
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }

    // Adding a client to match the player added to the game via rest
    export function joinGame(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName) as Room;
        if (room.clients.has(token.playerName)) {
            ws.send(JSON.stringify({
                error: "Client connection has already been established for this room."
            }));
            return;
        }

        ws.once("close", () => {
            disconnectFromGame(ws, token, false);
        });

        room.clients.set(token.playerName, ws);
        rooms.set(token.roomName, room);
        const gameState = room.game.getGameState(GameAction.join);
        ws.send(JSON.stringify(gameState));
    }

    export function readyToggle(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName) as Room;
        try {
            const playerUpdate = room.game.readyUpToggle(
                token.playerName
            );
            rooms.set(token.roomName, room);
            broadcastToRoom(
                token.roomName,
                { forOthers: playerUpdate.forOthers, gameInfo: playerUpdate.gameInfo },
                token.playerName
            );
            delete playerUpdate.forOthers;
            ws.send(JSON.stringify(playerUpdate));
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }

    export function setWord(
        ws: WebSocket,
        token: PlayerTokenInfo,
        message: RoomsMessageData
    ): void {
        const room = rooms.get(token.roomName) as Room;
        try {
            const playerUpdate = room.game.setWord(
                token.playerName,
                message.word || ""
            );
            rooms.set(token.roomName, room);
            broadcastToRoom(
                token.roomName,
                { forOthers: playerUpdate.forOthers, gameInfo: playerUpdate.gameInfo },
                token.playerName
            );
            delete playerUpdate.forOthers;
            ws.send(JSON.stringify(playerUpdate));
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }

    export function startGame(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName) as Room;
        try {
            const result = room.game.start(
                token.playerName,
            );
            rooms.set(token.roomName, room);
            broadcastToRoom(token.roomName, result);
        } catch (error) {
            // Broadcast game start errors to notify those not ready
            broadcastToRoom(token.roomName, { error: error.message });
        }
    }

    export function transferMarshalship(
        ws: WebSocket,
        token: PlayerTokenInfo,
        message: RoomsMessageData
    ): void {
        const room = rooms.get(token.roomName) as Room;
        try {
            const result = room.game.transferMarshallShip(
                token.playerName,
                message.subject || "", // Is string but will fail to get a valid player
            );
            broadcastToRoom(token.roomName, result);
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }
}
