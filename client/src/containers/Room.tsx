import { AxiosResponse } from "axios";
import React from "react";
import { toast } from "react-toastify";
import { api, baseURL } from "../api";
import { default as RoomComponent } from "../components/Room";
import { GameAction, GameExternalInfo, GameState } from "../types/Game";
import { AddPlayerOutput, RoomCreationOutput, RoomsMessageData } from "../types/Room";
import parseMessageData, { buildInitCurrentGameState, CurrentGameState, ErrorMessage } from "../utils/parseMessageData";
import roomMessageStringify from "../utils/roomMessageStringify";

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

        this.changeWordConstraints = this.changeWordConstraints.bind(this);
        this.createRoom = this.createRoom.bind(this);
        this.fetchRoomInfo = this.fetchRoomInfo.bind(this);
        this.fetchGameState = this.fetchGameState.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.joinBuildWSClient = this.joinBuildWSClient.bind(this);
        this.readyUp = this.readyUp.bind(this);
        this.setWord = this.setWord.bind(this);
        this.transferMarshalship = this.transferMarshalship.bind(this);
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

    fetchGameState(): void {
        const msg: RoomsMessageData = { action: GameAction.getGameState };
        this.state.clientWS?.send(JSON.stringify(msg));
    }

    async fetchRoomInfo(): Promise<null | GameExternalInfo> {
        const resp: AxiosResponse<null | GameExternalInfo> = await api.get(`/rooms/${this.props.roomName}`);
        return resp.data;
    }

    async joinRoom(playerName: string): Promise<void> {
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

        // attempting not to use "this" within the on functions later as they have a "this" param in their d.ts
        const setState = (newItems: Partial<RoomState>): void => {
            this.setState((state) => ({ ...state, ...newItems }));
        };
        const updateCurrentGameState = (event: MessageEvent): void => {
            // in dev and strict mode setState is called twice with the same state
            // this behavior should disappear in prod https://github.com/facebook/react/issues/12856#issuecomment-390206425
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
                setState({ clientWS: ws });
                return;
            } else if (!connected) {
                return;
            }

            // parse message and replay items in state
            updateCurrentGameState(event);
        };
        ws.onclose = (event: CloseEvent): void => {
            setState({
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

    changeWordConstraints(minChars: number, maxChars: number): void {
        this.state.clientWS?.send(roomMessageStringify({
            action: GameAction.changeWordConstraints,
            minChars,
            maxChars
        }));
    }

    readyUp(): void {
        this.state.clientWS?.send(roomMessageStringify({
            action: GameAction.readyToggle
        }));
    }

    setWord(word: string): void {
        this.state.clientWS?.send(roomMessageStringify({
            action: GameAction.setWord,
            word
        }));
    }

    transferMarshalship(subject: string): void {
        this.state.clientWS?.send(roomMessageStringify({
            action: GameAction.transferMarshalship,
            subject
        }));
    }

    render(): JSX.Element {
        return (
            <RoomComponent
                {...this.props}
                roomInfo={this.state.roomInfo}
                gameState={this.state.currentGameState}
                clientWS={this.state.clientWS}
                changeWordConstraints={this.changeWordConstraints}
                createRoom={this.createRoom}
                fetchGameState={this.fetchGameState}
                joinRoom={this.joinRoom}
                readyUp={this.readyUp}
                setWord={this.setWord}
                transferMarshalship={this.transferMarshalship}
            />
        );
    }
}
