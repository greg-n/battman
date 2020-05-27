import { GameAction, PlayerUpdateOutput } from "./Game";

export interface AddPlayerOutput {
    playerUpdate?: PlayerUpdateOutput;
    playerToken?: string;
}

export interface RoomCreationOutput extends AddPlayerOutput {
    roomCreated: boolean;
    failureReason?: string;
}

export interface RoomsMessageData {
    action: GameAction;
    subject?: string;
    minChars?: number;
    maxChars?: number;
    word?: string;
    guess?: string;
}
