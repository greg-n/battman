import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { CurrentGameState } from "../../utils/parseMessageData";
import PlayerList from "./PlayerList";

interface RoomWaitingProps {
    roomName: string;
    gameState: CurrentGameState;
    fetchGameState: () => void;
}

export default function RoomWaiting(props: RoomWaitingProps): JSX.Element {
    return (
        <span
            style={{
                marginLeft: "4vw",
                marginRight: "4vw",
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
                            onClick={props.fetchGameState}
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
                        <Container fluid="md" style={{ maxHeight: "90vh", overflow: "auto" }}>
                            <Row
                                style={{ height: "100%" }}
                            >
                                <Col
                                    xs={12}
                                >
                                    <PlayerList
                                        playerList={props.gameState.playerStates}
                                        gameState={props.gameState.gameInfo.state}
                                        playerWordSet={props.gameState.clientState.word != null}
                                        marshall={props.gameState.gameInfo.waitingRoomMarshall}
                                    />
                                </Col>
                            </Row>
                        </Container>
                        <Container fluid="md">
                            <Row
                                style={{ height: "50%" }}
                            >
                                <Col
                                    xs={12}
                                >
                                    <div>
                                        Hi
                                    </div>
                                </Col>
                            </Row>
                            <Row
                                style={{ height: "50%" }}
                            >
                                <Col
                                    xs={12}
                                >
                                    <div>
                                        Hi
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </span>
                </span>
            </span>
        </span>
    );
}
