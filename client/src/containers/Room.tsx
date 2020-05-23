import React from "react";
import { GameExternalInfo, GameStateOutput } from "../types/Game";
import { api, baseURL } from "../api";
import { AxiosResponse } from "axios";
import { default as RoomComponent } from "../components/Room";
import { toast } from "react-toastify";
import { RoomCreationOutput } from "../types/Room";

interface RoomProps {
    roomName: string;
}

interface RoomState {
    roomInfo: null | GameExternalInfo;
    gameState: null | GameStateOutput;
    clientWS: null | WebSocket;
    playerName: undefined | string;
}

export default class Room extends React.Component<RoomProps, RoomState> {
    constructor(props: RoomProps) {
        super(props);

        this.state = {
            roomInfo: null,
            gameState: null,
            clientWS: null,
            playerName: undefined
        };

        this.createRoom = this.createRoom.bind(this);
        this.fetchRoomInfo = this.fetchRoomInfo.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.joinBuildWSClient = this.joinBuildWSClient.bind(this);
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

    async createRoom(playerName: string): Promise<void> {
        toast("Create pressed");
        let resp: AxiosResponse<RoomCreationOutput> | undefined;
        try {
            resp = await api.post(`/rooms/${this.props.roomName}?creatorName=${playerName}`);
        } catch (error) {
            if (error.response != null) {
                if (error.response.data.failureReason)
                    toast.error(error.response.data.failureReason);
                else
                    toast.error("Creation was blocked by server. Try again.");
            } else if (error.request != null) {
                console.error(error.request);
                toast.error("No response from server.");
            } else {
                console.error(error.message);
                toast.error("Something failed while trying to create a room.");
            }

            return;
        }
        if (resp == null) {
            toast.error("Server returned item was empty.");
            return;
        }

        const { playerToken, playerUpdate } = resp.data;
        if (playerToken == null || playerUpdate == null) {
            toast.error("Server returned malformed items.");
            return;
        }

        // TODO maybe pass everything that should be set in state to the builder
        this.joinBuildWSClient(playerToken);
    }

    async fetchRoomInfo(): Promise<null | GameExternalInfo> {
        const resp: AxiosResponse<null | GameExternalInfo> = await api.get(`/rooms/${this.props.roomName}`);
        return resp.data;
    }

    joinRoom(/* playerName: string */): Promise<void> {
        toast("Join pressed");
        return new Promise((resolve) => { resolve(); });
    }

    joinBuildWSClient(playerToken: string): WebSocket {
        const ws = new WebSocket(`ws://${baseURL}/rooms?accessToken=${playerToken}`);

        ws.onopen = (event): void => {
            console.log(event);
        };
        ws.onmessage = (event: MessageEvent): void => {
            console.log(event);
        };
        ws.onclose = (event: CloseEvent): void => {
            console.log(event);
        };
        ws.onerror = (event: Event): void => {
            console.log(event);
        };

        return ws;
    }

    render(): JSX.Element {
        return (
            <RoomComponent
                {...this.props}
                roomInfo={this.state.roomInfo}
                gameState={this.state.gameState}
                clientWS={this.state.clientWS}
                createRoom={this.createRoom}
                joinRoom={this.joinRoom}
            />
        );
    }
}
