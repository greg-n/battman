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