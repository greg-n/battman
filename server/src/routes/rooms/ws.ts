import * as controller from "../../controllers/rooms/ws";
import { PlayerTokenInfo, verifyDecodeToken } from "../../utils/playerToken";
import { GameAction } from "../../entities/Game";
import { ParsedQs } from "qs";
import WebSocket from "ws";

// All potential information that could be needed by a controller
export interface RoomMessageData {
    action: GameAction;
    subject?: string;
    guess?: string;
    minChars?: number;
    maxChars?: number;
}

export default function buildRouting(ws: WebSocket, queryParams: ParsedQs): void {
    const accessToken = queryParams.accessToken;
    if (typeof accessToken !== "string") {
        ws.send(JSON.stringify({ error: "Access token query param missing or invalid type." }));
        return;
    }

    let token: PlayerTokenInfo | undefined;
    try {
        token = verifyDecodeToken(accessToken);
        if (token == null)
            throw new Error("Token decoded was null.");
    } catch (error) {
        ws.send(JSON.stringify({ error: error.message }));
        return;
    }

    ws.on("message", (rawData) => {
        if (typeof rawData !== "string") {
            ws.send(JSON.stringify({ error: "Data should be a string type." }));
            return;
        }

        const data = JSON.parse(rawData) as RoomMessageData;
        try {
            checkData(data);
        } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
            return;
        }

        switch (data.action) {
            case GameAction.join:
                controller.ws.joinGame(ws, token as PlayerTokenInfo);
                break;
            case GameAction.disconnect:
                controller.ws.disconnectFromGame(ws, token as PlayerTokenInfo);
                break;
            case GameAction.changeWordConstraints:
                // TODO controller
                break;
            case GameAction.transferMarshalship:
                // TODO controller
                break;
            case GameAction.setWord:
                // TODO controller
                break;
            case GameAction.readyToggle:
                // TODO controller
                break;
            case GameAction.startGame:
                // TODO controller
                break;
            case GameAction.guess:
                // TODO controller
                break;
            case GameAction.getGameState:
                // TODO controller
                break;
            default:
                ws.send(JSON.stringify({ error: "Action could not be matched to a controller." }));
        }
    });
}

function checkData(data: RoomMessageData): void {
    if (data.action == null || !(data.action in GameAction))
        throw new Error("Data action must be defined and within acceptable values.");
    if (data.subject != null && typeof data.subject !== "string")
        throw new Error("Data subject must be defined and a string.");
    if (data.guess != null && typeof data.guess !== "string")
        throw new Error("Data guess must be defined and a string.");
    if (data.minChars != null && typeof data.minChars !== "number")
        throw new Error("Data minChars must be defined and a number.");
    if (data.maxChars != null && typeof data.maxChars !== "number")
        throw new Error("Data maxChars must be defined and a number.");
}
