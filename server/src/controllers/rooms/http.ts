import Game, { GameExternalInfo, PlayerUpdateOutput } from "../../entities/Game";
import { NextFunction, Request, Response } from "express";
import broadcastToRoom from "../../state/utils/broadcastToRoom";
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

// FIXME adding or creating should make an interval that will remove a player
// from a game if no client ws connects after a certain amount of time

function addNewPlayer(roomName: string, playerName: string): AddPlayerOutput {
    const room = rooms.get(roomName);
    if (room == null) {
        throw new Error("Requested room does not exist.");
    }

    const playerUpdate = room.game.addPlayer(playerName);
    const playerToken = buildToken({ roomName, playerName });

    rooms.set(roomName, room);
    broadcastToRoom(
        roomName,
        { forOthers: playerUpdate.forOthers, gameInfo: playerUpdate.gameInfo },
        playerName
    );
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
