import Game from "../entities/Game";
import WebSocket from "ws";

export interface Room {
    game: Game;
    clients: Map<string, WebSocket>;
}

export const rooms = new Map<string, Room>();
