export enum PlayerState {
    joined,
    ready,
    playing,
    eliminated,
    disconnected,
    victor
}

export type PlayerSerializable = {
    [key: string]: string | null | string[] | PlayerState;
}
