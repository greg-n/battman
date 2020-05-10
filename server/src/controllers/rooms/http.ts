import Game, { GameExternalInfo, PlayerUpdateOutput } from "../../entities/Game";
import { NextFunction, Request, Response } from "express";
import { buildToken } from "./utils/playerToken";
import { rooms } from "../../state/rooms";

interface RoomCreationOutput {
    created: boolean;
    failureReason?: string;
    playerUpdate?: Omit<PlayerUpdateOutput, "forOthers">;
    playerToken?: string;
}

function createRoom(roomName: string, creatorName: string): RoomCreationOutput {
    if (rooms.has(roomName)) {
        return { created: false, failureReason: "Room already exists." };
    }

    const newGame = new Game();
    const playerUpdate = newGame.addPlayer(creatorName);
    const playerToken = buildToken({ roomName, playerName: creatorName });

    rooms.set(roomName, newGame);
    delete playerUpdate.forOthers;
    return { created: true, playerUpdate, playerToken };
}

function getRoomState(roomName: string): null | GameExternalInfo {
    const room = rooms.get(roomName);

    if (room == null) {
        return null;
    }

    return room.buildGameExternalInfo();
}

export namespace get {
    export function room(req: Request, res: Response): void {
        const result = getRoomState(req.params.roomName);
        res.json({ result });
    }
}

export namespace post {
    export function room(req: Request, res: Response, next: NextFunction): void {
        const creatorName = req.query.creatorName;
        if (typeof creatorName !== "string") {
            return next(new Error("creatorName query item not provided or not type string."));
        }

        const result = createRoom(req.params.roomName, creatorName);
        res.json({ result });
    }
}

// TODO on adding play via rest, there must be a way to broadcast that a player has joined to the the people currently in the game
// maybe have room state also track ws clients and broadcast that way. will have to remove clients from state once they timeout, or a message sending fails
// have a method to broadcast to a room (maybe wrap single sends too to remove client who can't be sent to from state)
// store client ws items in map on room state next to game item
