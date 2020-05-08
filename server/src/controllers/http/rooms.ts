import Game, { GameExternalInfo } from "../../entities/Game";
import { Request, Response } from "express";
import { rooms } from "../../state/rooms";

interface RoomCreationOutput {
    created: boolean;
    failureReason?: string;
}

function createRoom(roomName: string): RoomCreationOutput {
    if (rooms.has(roomName)) {
        return { created: false, failureReason: "Room already exists." };
    }

    rooms.set(roomName, new Game());
    return { created: true };
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
    export function room(req: Request, res: Response): void {
        const result = createRoom(req.params.roomName);
        res.json({ result });
    }
}