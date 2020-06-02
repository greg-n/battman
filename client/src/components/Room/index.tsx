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
    createRoom: (playerName: string) => Promise<void>;
    fetchGameState: () => void;
    joinRoom: (playerName: string) => Promise<void>;
    setWord: (word: string) => void;
}

export default class Room extends React.Component<RoomProps, {}> {
    constructor(props: RoomProps) {
        super(props);

        this.renderByClientState = this.renderByClientState.bind(this);
    }

    renderByClientState(): JSX.Element {
        const clientWS = this.props.clientWS;
        const gameState = this.props.gameState;

        if (clientWS == null && gameState == null) // Client is not connected here
            return (
                <RoomLanding
                    roomName={this.props.roomName}
                    roomInfo={this.props.roomInfo}
                    createRoom={this.props.createRoom}
                    joinRoom={this.props.joinRoom}
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
                    roomName={this.props.roomName}
                    gameState={gameState}
                    fetchGameState={this.props.fetchGameState}
                    setWord={this.props.setWord}
                />
            );
        else if (gameState?.gameInfo.state === GameState.running)
            return (
                <RoomRunning />
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

    render(): JSX.Element {
        return this.renderByClientState();
    }
}
