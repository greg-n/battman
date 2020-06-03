import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { CurrentGameState } from "../../utils/parseMessageData";
import PlayerList from "./PlayerList";
import SetWord from "./SetWord";
import ReadyUp from "./ReadyUp";

interface RoomWaitingProps {
    roomName: string;
    gameState: CurrentGameState;
    fetchGameState: () => void;
    readyUp: () => void;
    setWord: (word: string) => void;
}

export default function RoomWaiting(props: RoomWaitingProps): JSX.Element {
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
                                style={{ height: "100%", paddingRight: "1em" }}
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
                                style={{ height: "50%", paddingLeft: "1em" }}
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
                                style={{ height: "50%", paddingLeft: "1em" }}
                            >
                                <Col />
                                <Col
                                    xs={6}
                                >
                                    <SetWord
                                        playerState={props.gameState.clientState.state}
                                        playerWord={props.gameState.clientState.word}
                                        minLength={props.gameState.gameInfo.minChars}
                                        maxLength={props.gameState.gameInfo.maxChars}
                                        setWord={props.setWord}
                                    />
                                    <Row style={{ paddingTop: "1.3em" }} />
                                    <ReadyUp
                                        playerState={props.gameState.clientState.state}
                                        playerWord={props.gameState.clientState.word}
                                        readyUp={props.readyUp}
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
