import React from "react";
import { GameExternalInfo, GameAction, GameState } from "../types/Game";
import { api, baseURL } from "../api";
import { AxiosResponse } from "axios";
import { default as RoomComponent } from "../components/Room";
import { toast } from "react-toastify";
import { RoomCreationOutput, AddPlayerOutput } from "../types/Room";
import parseMessageData, { CurrentGameState, buildInitCurrentGameState, ErrorMessage } from "../utils/parseMessageData";

interface RoomProps {
    roomName: string;
}

interface RoomState {
    roomInfo: null | GameExternalInfo;
    clientWS: null | WebSocket;
    playerName: undefined | string;
    currentGameState: undefined | CurrentGameState;
}

export default class Room extends React.Component<RoomProps, RoomState> {
    constructor(props: RoomProps) {
        super(props);

        this.state = {
            roomInfo: null,
            clientWS: null,
            playerName: undefined,
            currentGameState: undefined
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

        this.setState({
            currentGameState: buildInitCurrentGameState(playerUpdate)
        });
        this.joinBuildWSClient(playerToken);
    }

    async fetchRoomInfo(): Promise<null | GameExternalInfo> {
        const resp: AxiosResponse<null | GameExternalInfo> = await api.get(`/rooms/${this.props.roomName}`);
        return resp.data;
    }

    async joinRoom(playerName: string): Promise<void> {
        toast("Join pressed");
        let resp: AxiosResponse<AddPlayerOutput> | undefined;
        try {
            resp = await api.put(`/rooms/${this.props.roomName}/players?playerName=${playerName}`);
        } catch (error) {
            if (error.response != null) {
                toast.error("Join was blocked by server. Try again");
            } else if (error.request != null) {
                console.error(error.request);
                toast.error("No response from server");
            } else {
                console.error(error.message);
                toast.error("Something failed while trying to join a room");
            }

            return;
        }
        if (resp == null) {
            toast.error("Server returned item was empty");
            return;
        }

        const { playerToken, playerUpdate } = resp.data;
        if (playerToken == null || playerUpdate == null) {
            toast.error("Server returned malformed items");
            return;
        }

        this.setState({
            currentGameState: buildInitCurrentGameState(playerUpdate)
        });
        this.joinBuildWSClient(playerToken);
    }

    joinBuildWSClient(playerToken: string): WebSocket {
        const ws = new WebSocket(`ws://${baseURL}/rooms?accessToken=${playerToken}`);
        let connected = false;

        const updateCurrentGameState = (event: MessageEvent): void => {
            this.setState((state) => {
                try {
                    const newState = parseMessageData(
                        event.data,
                        state.currentGameState as CurrentGameState // connect shows that this should exist
                    );

                    if ((newState as ErrorMessage).error != null) {
                        toast.error((newState as ErrorMessage).error);
                        return state;
                    } else {
                        const gameState = (newState as CurrentGameState).gameInfo.state;

                        return {
                            ...state,
                            gameState: gameState as GameState,
                            currentGameState: newState as CurrentGameState
                        };
                    }
                } catch (error) {
                    toast.error(error.message);
                    return state;
                }
            });
        };

        ws.onopen = (): void => {
            ws.send(JSON.stringify({
                action: GameAction.join
            }));
        };
        ws.onmessage = (event: MessageEvent): void => {
            if (!connected && event.data === "Connected.") {
                connected = true;
                return;
            } else if (!connected) {
                return;
            }

            // parse message and replay items in state
            updateCurrentGameState(event);
        };
        ws.onclose = (event: CloseEvent): void => {
            this.setState({
                roomInfo: null,
                clientWS: null,
                playerName: undefined,
                currentGameState: undefined
            });

            if (event.reason != null)
                toast.warning(`Disconnected. ${event.reason}`);
            else if (event.code === 1006)
                toast.error("Connection to server cut");
            else
                toast.warning("Game closed");
        };
        ws.onerror = (event: Event): void => {
            console.error("ws connection error", event);
        };

        return ws;
    }

    render(): JSX.Element {
        return (
            <RoomComponent
                {...this.props}
                roomInfo={this.state.roomInfo}
                gameState={this.state.currentGameState}
                clientWS={this.state.clientWS}
                createRoom={this.createRoom}
                joinRoom={this.joinRoom}
            />
        );
    }
}
