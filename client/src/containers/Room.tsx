import React from "react";
import { GameExternalInfo, GameStateOutput } from "../types/Game";
import { api } from "../api";
import { AxiosResponse } from "axios";
import { default as RoomComponent } from "../components/Room";
import { toast } from "react-toastify";

interface RoomProps {
    roomName: string;
    tryImmediateCreate: boolean;
}

interface RoomState {
    roomInfo: null | GameExternalInfo;
    gameState: null | GameStateOutput;
    clientWS: null | WebSocket;
}

export default class Room extends React.Component<RoomProps, RoomState> {
    constructor(props: RoomProps) {
        super(props);

        this.state = {
            roomInfo: null,
            gameState: null,
            clientWS: null
        };

        this.fetchRoomInfo = this.fetchRoomInfo.bind(this);
    }

    async componentDidMount(): Promise<void> {
        try {
            const roomInfo = await this.fetchRoomInfo();
            this.setState({ roomInfo });
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }

    async fetchRoomInfo(): Promise<null | GameExternalInfo> {
        const resp: AxiosResponse<null | GameExternalInfo> = await api.get(`/rooms/${this.props.roomName}`);
        return resp.data;
    }

    render(): JSX.Element {
        return (
            <RoomComponent
                {...this.props}
                roomInfo={this.state.roomInfo}
                gameState={this.state.gameState}
                clientWS={this.state.clientWS}
            />
        );
    }
}
