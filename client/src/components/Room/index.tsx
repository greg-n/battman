import React from "react";
import { GameExternalInfo, GameStateOutput, GameState } from "../../types/Game";
import RoomLanding from "./Landing";
import RoomRunning from "./Running";

interface RoomProps {
    roomName: string;
    roomInfo: null | GameExternalInfo;
    gameState: null | GameStateOutput;
    clientWS: null | WebSocket;
    createRoom: (playerName: string) => Promise<void>;
    joinRoom: (playerName: string) => Promise<void>;
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
        else if (gameState?.gameInfo.state !== GameState.ended)
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
