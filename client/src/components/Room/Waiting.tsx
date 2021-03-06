import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { CurrentGameState } from "../../utils/parseMessageData";
import MarshalControls from "./MarshalControls";
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
        // marshal ought to exist
        const marshal = this.props.gameState.gameInfo.waitingRoomMarshal as string;
        const streamInfo = this.props.gameState.gameInfo.streamInfo;

        return (
            <Row>
                <Col xs={12}>
                    <Row style={{ paddingLeft: "1em" }}>
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
                    </Row>
                    <Row>
                        <Col
                            xs={5}
                        >
                            <Row>
                                <Col />
                                <Col
                                    xs={9}
                                >
                                    <PlayerList
                                        clientName={this.props.gameState.clientState.name}
                                        playerList={this.props.gameState.playerStates}
                                        gameState={this.props.gameState.gameInfo.state}
                                        marshal={this.props.gameState.gameInfo.waitingRoomMarshal}
                                        selected={this.state.selectedUser}
                                        changeSelected={this.changeSelectedUser}
                                    />
                                </Col>
                                <Col xs={1} />
                            </Row>
                        </Col>
                        <Col xs={7}>
                            <Row>
                                <Col xs={1} />
                                <Col
                                    xs={9}
                                >
                                    <SetAndReady
                                        playerState={this.props.gameState.clientState.state}
                                        playerWord={this.props.gameState.clientState.word}
                                        minLength={this.props.gameState.gameInfo.minChars}
                                        maxLength={this.props.gameState.gameInfo.maxChars}
                                        readyUp={this.props.readyUp}
                                        setWord={this.props.setWord}
                                    />
                                    {this.props.gameState.clientState.name === this.props.gameState.gameInfo.waitingRoomMarshal
                                        ? (
                                            <MarshalControls
                                                currentMarshal={marshal}
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
                                </Col>
                                <Col />
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
