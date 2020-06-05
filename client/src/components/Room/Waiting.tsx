import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { CurrentGameState } from "../../utils/parseMessageData";
import PlayerList from "./PlayerList";
import SetWord from "./SetWord";
import ReadyUp from "./ReadyUp";
import MarshallControls from "./MarshallControls";

interface RoomWaitingProps {
    roomName: string;
    gameState: CurrentGameState;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    fetchGameState: () => void;
    readyUp: () => void;
    setWord: (word: string) => void;
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
                <span
                    style={{
                        height: "100%"
                    }}
                >
                    <span style={{ flexShrink: 1, flexGrow: 1 }}>
                        <span style={{ display: "flex", height: "100%" }}>
                            <Container
                                fluid="md"
                                style={{ maxHeight: "90vh", overflow: "auto", height: "100%", paddingRight: "1em" }}
                            >
                                <Row >
                                    <Col
                                        xs={12}
                                    >
                                        <PlayerList
                                            clientName={this.props.gameState.clientState.name}
                                            playerList={this.props.gameState.playerStates}
                                            gameState={this.props.gameState.gameInfo.state}
                                            marshall={this.props.gameState.gameInfo.waitingRoomMarshall}
                                            selected={this.state.selectedUser}
                                            changeSelected={this.changeSelectedUser}
                                        />
                                    </Col>
                                </Row>
                            </Container>
                            <Container fluid="md" style={{ height: "50%", paddingLeft: "1em" }}>
                                {this.props.gameState.clientState.name === this.props.gameState.gameInfo.waitingRoomMarshall
                                    ? (
                                        <MarshallControls
                                            currentMarshall={this.props.gameState.gameInfo.waitingRoomMarshall as string} // marshall ought to exist
                                            playerList={this.props.gameState.playerStates}
                                            minChars={this.props.gameState.gameInfo.minChars}
                                            maxChars={this.props.gameState.gameInfo.maxChars}
                                            selected={this.state.selectedUser}
                                            changeSelected={this.changeSelectedUser}
                                            changeWordConstraints={this.props.changeWordConstraints}
                                            transferMarshalship={this.props.transferMarshalship}
                                        />
                                    ) : undefined
                                }
                                <Row>
                                    <Col />
                                    <Col
                                        xs={7}
                                    >
                                        <SetWord
                                            playerState={this.props.gameState.clientState.state}
                                            playerWord={this.props.gameState.clientState.word}
                                            minLength={this.props.gameState.gameInfo.minChars}
                                            maxLength={this.props.gameState.gameInfo.maxChars}
                                            setWord={this.props.setWord}
                                        />
                                        <Row style={{ paddingTop: "1.3em" }} />
                                        <ReadyUp
                                            playerState={this.props.gameState.clientState.state}
                                            playerWord={this.props.gameState.clientState.word}
                                            readyUp={this.props.readyUp}
                                        />
                                    </Col>
                                    <Col />
                                </Row>
                            </Container>
                        </span>
                    </span>
                </span>
            </span>
        );
    }
}
