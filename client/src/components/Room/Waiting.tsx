import React from "react";
import { Button, Col, Container } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { CurrentGameState } from "../../utils/parseMessageData";
import MarshallControls from "./MarshallControls";
import PlayerList from "./PlayerList";
import SetAndReady from "./SetAndReady";
import StreamInfo from "./StreamInfo";

interface RoomWaitingProps {
    roomName: string;
    gameState: CurrentGameState;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    fetchGameState: () => void;
    readyUp: () => void;
    setWord: (word: string) => void;
    startGame: () => void;
    transferMarshalship: (subject: string) => void;
}

interface RoomWaitingState {
    selectedUser: string | undefined;
}

export default class RoomWaiting extends React.Component<RoomWaitingProps, RoomWaitingState> {
    constructor(props: RoomWaitingProps) {
        super(props);

        this.state = {
            selectedUser: undefined
        };

        this.changeSelectedUser = this.changeSelectedUser.bind(this);
    }

    // unset by passing undefined
    changeSelectedUser(name?: string): void {
        this.setState({ selectedUser: name });
    }

    render(): JSX.Element {
        // marshall ought to exist
        const marshall = this.props.gameState.gameInfo.waitingRoomMarshall as string;
        const streamInfo = this.props.gameState.gameInfo.streamInfo;

        return (
            <span
                style={{
                    marginLeft: "3vw",
                    marginRight: "3vw",
                    height: "100vh",
                    display: "flex",
                    flexFlow: "column"
                }}
            >
                <div >
                    <Col style={{ paddingTop: ".4rem", paddingBottom: ".4rem" }}>
                        <div>
                            <Button
                                variant="light"
                                onClick={this.props.fetchGameState}
                            >
                                <BsArrowClockwise />
                                <span style={{ paddingLeft: ".2em" }}>
                                    - Refresh game without disconnecting
                                </span>
                            </Button>
                        </div>
                    </Col>
                </div>
                <span style={{ flexShrink: 1, flexGrow: 1 }}>
                    <span style={{ display: "flex" }}>
                        <Container
                            fluid="md"
                            style={{ maxWidth: "40%" }}
                        >
                            <PlayerList
                                clientName={this.props.gameState.clientState.name}
                                playerList={this.props.gameState.playerStates}
                                gameState={this.props.gameState.gameInfo.state}
                                marshall={this.props.gameState.gameInfo.waitingRoomMarshall}
                                selected={this.state.selectedUser}
                                changeSelected={this.changeSelectedUser}
                            />
                        </Container>
                        <Container fluid="md">
                            <SetAndReady
                                playerState={this.props.gameState.clientState.state}
                                playerWord={this.props.gameState.clientState.word}
                                minLength={this.props.gameState.gameInfo.minChars}
                                maxLength={this.props.gameState.gameInfo.maxChars}
                                readyUp={this.props.readyUp}
                                setWord={this.props.setWord}
                            />
                            {this.props.gameState.clientState.name === this.props.gameState.gameInfo.waitingRoomMarshall
                                ? (
                                    <MarshallControls
                                        currentMarshall={marshall}
                                        playerList={this.props.gameState.playerStates}
                                        minChars={this.props.gameState.gameInfo.minChars}
                                        maxChars={this.props.gameState.gameInfo.maxChars}
                                        selected={this.state.selectedUser}
                                        changeSelected={this.changeSelectedUser}
                                        changeWordConstraints={this.props.changeWordConstraints}
                                        startGame={this.props.startGame}
                                        transferMarshalship={this.props.transferMarshalship}
                                    />
                                ) : undefined}
                            {streamInfo.length > 0 ? (
                                <StreamInfo
                                    streamItems={streamInfo}
                                />
                            ) : undefined}
                        </Container>
                    </span>
                </span>
            </span>
        );
    }
}
