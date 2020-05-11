import Game, { GameExternalInfo, PlayerUpdateOutput } from "../../entities/Game";
import { NextFunction, Request, Response } from "express";
import { buildToken } from "../../utils/playerToken";
import { rooms } from "../../state/rooms";

interface RoomCreationOutput {
    created: boolean;
    failureReason?: string;
    playerUpdate?: Omit<PlayerUpdateOutput, "forOthers">;
    playerToken?: string;
}

function addNewPlayer(roomName: string, playerName: string): unknown {
    const room = rooms.get(roomName);
    if (room == null) {
        throw new Error("Requested room does not exist.");
    }

    const playerUpdate = room.game.addPlayer(playerName);
    const playerToken = buildToken({ roomName, playerName });
    // TODO on adding play via rest, there must be a way to broadcast that a player has joined to the the people currently in the game
    // maybe have room state also track ws clients and broadcast that way. will have to remove clients from state once they timeout, or a message sending fails
    // have a method to broadcast to a room (maybe wrap single sends too to remove client who can't be sent to from state)
    // store client ws items in map on room state next to game item
    rooms.set(roomName, room);
    delete playerUpdate.forOthers;
    return { created: true, playerUpdate, playerToken };
}

function createRoom(roomName: string, creatorName: string): RoomCreationOutput {
    if (rooms.has(roomName)) {
        return { created: false, failureReason: "Room already exists." };
    }

    const newGame = new Game();
    const playerUpdate = newGame.addPlayer(creatorName);
    const playerToken = buildToken({ roomName, playerName: creatorName });

    rooms.set(roomName, { game: newGame, clients: new Map() });
    delete playerUpdate.forOthers;
    return { created: true, playerUpdate, playerToken };
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
        res.json({ result });
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
        res.json({ result });
    }
}

export namespace put {
    // Add new player to game
    export function room(req: Request, res: Response, next: NextFunction): void {
        const playerName = req.query.playerName;
        if (typeof playerName !== "string") {
            return next(new Error("playerName query item not provided or not type string."));
        }

        const result = addNewPlayer(req.params.roomName, playerName);
        res.json({ result });
    }
}
