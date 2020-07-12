import React from "react";
import { CurrentGameState } from "../../utils/parseMessageData";
import beforeUnload from "../../utils/beforeUnload";
import { Row, Col, Button } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import PlayerList from "./PlayerList";
import StreamInfo from "./StreamInfo";
import { PlayerState } from "../../types/Player";

interface Props {
    roomName: string;
    gameState: CurrentGameState;
    fetchGameState: () => void;
}

export default function End(props: Props): JSX.Element {
    window.removeEventListener("beforeunload", beforeUnload);

    const streamInfo = props.gameState.gameInfo.streamInfo;
    const clientIsVictor = props.gameState.clientState.state === PlayerState.victor;
    let victorName: string | undefined;
    if (!clientIsVictor) {
        for (const [name, player] of Object.entries(props.gameState.playerStates)) {
            if (player.state === PlayerState.victor) {
                victorName = name;
                break;
            }
        }
    }

    let victorElement: JSX.Element;
    const victorStyle: React.CSSProperties = { padding: "1.5rem", textAlign: "center" };
    if (clientIsVictor) {
        victorElement = (
            <h1 style={victorStyle}>
                You won!!!
            </h1>
        );
    } else if (victorName != null) {
        victorElement = (
            <h1 style={victorStyle}>
                {victorName} won!!! Get good, kiddo.
            </h1>
        );
    } else {
        victorElement = (
            <h3 style={victorStyle}>
                Not sure who won.... This might be a bug. If there is a winner maybe you can deduce it from the information below?
            </h3>
        );
    }

    return (
        <Row>
            <Col xs={12}>
                <Row style={{ paddingLeft: "1em" }}>
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
                </Row>
                <Row>
                    <Col />
                    <Col>
                        {victorElement}
                    </Col>
                    <Col />
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
                                    clientName={props.gameState.clientState.name}
                                    clientWord={props.gameState.clientState.word || undefined}
                                    currentPlayer={props.gameState.gameInfo.currentPlayer}
                                    playerList={props.gameState.playerStates}
                                    gameState={props.gameState.gameInfo.state}
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
