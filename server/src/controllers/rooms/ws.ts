import { GameAction, GameStateOutput } from "../../entities/Game";
import { Room, rooms } from "../../state/rooms";
import broadcastToRoom, { playerUpdateToEachKey } from "../../state/utils/broadcastToRoom";
import { PlayerTokenInfo } from "../../utils/playerToken";
import { RoomsMessageData } from "../../routes/rooms/ws";
import WebSocket from "ws";

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
            playerUpdateToEachKey(token.roomName, result);
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

        let state: GameStateOutput;
        try {
            state = room.game.disconnectPlayer(token.playerName);
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
            broadcastToRoom(token.roomName, state); // TODO allow kicking?
        } else
            rooms.delete(token.roomName); // Delete room if no clients remain after one leaves
    }

    export function getGameState(ws: WebSocket, token: PlayerTokenInfo): void {
        const room = rooms.get(token.roomName) as Room;

        const state = room.game.getGameState();
        const clientState = room.game.players.get(token.playerName)?.getSafeToSerialize();
        ws.send(JSON.stringify({ ...state, clientState }));
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
                    actorUpdate: { forAll: guessOutput.actorUpdate.forAll },
                    subjectUpdate: { forAll: guessOutput.subjectUpdate.forAll },
                    players: guessOutput.players,
                    gameInfo: guessOutput.gameInfo
                },
                [token.playerName, message.subject || ""]
            );
            ws.send(JSON.stringify({
                actorUpdate: guessOutput.actorUpdate,
                subjectUpdate: { forAll: guessOutput.subjectUpdate.forAll },
                players: guessOutput.players,
                gameInfo: guessOutput.gameInfo
            }));
            subjectClient?.send(JSON.stringify({
                actorUpdate: { forAll: guessOutput.actorUpdate.forAll },
                subjectUpdate: guessOutput.subjectUpdate,
                players: guessOutput.players,
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
        const state = room.game.getGameState(GameAction.join);
        broadcastToRoom(token.roomName, state);
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
                { forAll: playerUpdate.forAll, gameInfo: playerUpdate.gameInfo },
                token.playerName
            );
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
                { forAll: playerUpdate.forAll, gameInfo: playerUpdate.gameInfo },
                token.playerName
            );
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
            const result = room.game.transferMarshalShip(
                token.playerName,
                message.subject || "", // Is string but will fail to get a valid player
            );
            broadcastToRoom(token.roomName, result);
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
        }
    }
}
