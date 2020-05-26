import Game, { GameExternalInfo, PlayerUpdateOutput } from "../../entities/Game";
import { NextFunction, Request, Response } from "express";
import { buildToken } from "../../utils/playerToken";
import { rooms } from "../../state/rooms";

interface AddPlayerOutput {
    playerUpdate?: Omit<PlayerUpdateOutput, "forOthers">;
    playerToken?: string;
}

interface RoomCreationOutput extends AddPlayerOutput {
    roomCreated: boolean;
    failureReason?: string;
}

function addNewPlayer(roomName: string, playerName: string): AddPlayerOutput {
    const room = rooms.get(roomName);
    if (room == null) {
        throw new Error("Requested room does not exist.");
    }

    const playerUpdate = room.game.addPlayer(playerName);
    const playerToken = buildToken({ roomName, playerName });

    // NOTE giving the client 7 seconds to connect after token issuing before force removing
    setTimeout(() => {
        const roomLater = rooms.get(roomName);
        if (roomLater == null)
            return;

        if (
            roomLater.game.players.has(playerName)
            && !roomLater.clients.has(playerName)
        ) {
            // not broadcasting since no one knows this player exists
            roomLater.game.disconnectPlayer(playerName);
            if (roomLater.clients.size > 0) {
                rooms.set(roomName, roomLater);
            } else
                rooms.delete(roomName); // Delete room if no clients remain after one leaves  
        }
    }, Number(process.env.REMOVE_NON_CLIENT_TIMEOUT) || 7000);

    rooms.set(roomName, room);
    delete playerUpdate.forOthers;
    return { playerUpdate, playerToken };
}

function createRoom(roomName: string, creatorName: string): RoomCreationOutput {
    if (rooms.has(roomName)) {
        return { roomCreated: false, failureReason: "Room already exists." };
    }
    if (roomName.length > 24) {
        return { roomCreated: false, failureReason: "Room name is longer 24 chars." };
    }
    if (!/^[a-zA-Z-_]+$/g.test(roomName)) {
        return { roomCreated: false, failureReason: "Room name should contain only [a-z, A-Z, -, _] chars." };
    }

    const newGame = new Game();
    const playerUpdate = newGame.addPlayer(creatorName);
    const playerToken = buildToken({ roomName, playerName: creatorName });

    rooms.set(roomName, { game: newGame, clients: new Map() });
    delete playerUpdate.forOthers;
    return { roomCreated: true, playerUpdate, playerToken };
}

function getRoomInfo(roomName: string): null | GameExternalInfo {
    const room = rooms.get(roomName);
    if (room == null) {
        return null;
    }

    return room.game.buildGameExternalInfo();
}

export namespace get {
    // Retrieve information about room's game if possible
    export function room(req: Request, res: Response): void {
        const result = getRoomInfo(req.params.roomName);
        res.json(result);
    }
}

export namespace post {
    // Create room and associated state if roomName is not taken
    export function room(req: Request, res: Response, next: NextFunction): void {
        const creatorName = req.query.creatorName;
        if (typeof creatorName !== "string") {
            return next(new Error("creatorName query item not provided or not type string."));
        }

        const result = createRoom(req.params.roomName, creatorName);
        if (result.roomCreated)
            res.status(201).json(result);
        else
            res.status(400).json(result);
    }
}

export namespace put {
    // Add new player to game
    export function addPlayer(req: Request, res: Response, next: NextFunction): void {
        const playerName = req.query.playerName;
        if (typeof playerName !== "string") {
            return next(new Error("playerName query item not provided or not type string."));
        }

        const result = addNewPlayer(req.params.roomName, playerName);
        res.json(result);
    }
}
