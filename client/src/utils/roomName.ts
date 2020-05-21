import randomWords from "random-words";

export function generateRoomName(): string {
    return randomWords(
        // Max room name length is 24, capped by server
        { min: 2, max: 4, maxLength: 5, join: "-" }
    ) as string;
}
