import React from "react";
import { GameExternalInfo, GameState } from "../../types/Game";
import { CurrentGameState } from "../../utils/parseMessageData";
import RoomLanding from "./Landing";
import RoomRunning from "./Running";
import RoomWaiting from "./Waiting";

interface RoomProps {
    roomName: string;
    roomInfo: null | GameExternalInfo;
    gameState: undefined | CurrentGameState;
    clientWS: null | WebSocket;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    createRoom: (playerName: string) => Promise<void>;
    fetchGameState: () => void;
    joinRoom: (playerName: string) => Promise<void>;
    makeGuess: (subject: string, guess: string) => void;
    readyUp: () => void;
    setWord: (word: string) => void;
    startGame: () => void;
    transferMarshalship: (subject: string) => void;
}

export default function Room(props: RoomProps): JSX.Element {
    const clientWS = props.clientWS;
    const gameState = props.gameState;

    if (clientWS == null && gameState == null) // Client is not connected here
        return (
            <RoomLanding
                roomName={props.roomName}
                roomInfo={props.roomInfo}
                createRoom={props.createRoom}
                joinRoom={props.joinRoom}
            />
        );
    else if (clientWS == null || gameState == null)
        return (
            <div>
                Either ws or game state null.
            </div>
        );
    else if (gameState?.gameInfo.state === GameState.waitingRoom)
        return (
            <RoomWaiting
                roomName={props.roomName}
                gameState={gameState}
                changeWordConstraints={props.changeWordConstraints}
                fetchGameState={props.fetchGameState}
                readyUp={props.readyUp}
                setWord={props.setWord}
                startGame={props.startGame}
                transferMarshalship={props.transferMarshalship}
            />
        );
    else if (gameState?.gameInfo.state === GameState.running)
        return (
            <RoomRunning
                roomName={props.roomName}
                gameState={gameState}
                fetchGameState={props.fetchGameState}
                makeGuess={props.makeGuess}
            />
        );
    else if (gameState?.gameInfo.state === GameState.ended)
        return (
            <div>
                TODO game ended screen
            </div>
        );
    else
        return (
            <div>
                Ummm... this is embarrassing
            </div>
        );
}
