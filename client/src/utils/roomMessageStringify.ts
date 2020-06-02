import { RoomsMessageData } from "../types/Room";

export default function roomMessageStringify(message: RoomsMessageData): string {
    return JSON.stringify(message);
}
