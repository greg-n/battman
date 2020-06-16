import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { Player, PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";
import ChangeWordConstraints from "./ChangeWordConstraints";
import TransferMarshalship from "./TransferMarshalship";
import "../../styles/Sections.css";

interface MarshallControlsProp {
    currentMarshall: string;
    playerList: { [key: string]: Player };
    minChars: number;
    maxChars: number;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    startGame: () => void;
    transferMarshalship: (subject: string) => void;
}

export default function MarshallControls(props: MarshallControlsProp): JSX.Element {
    let numNotReady = 0;
    for (const player of Object.values(props.playerList)) {
        if (player.state !== PlayerState.ready) {
            numNotReady++;
        }
    }

    const numPlayers = Object.keys(props.playerList).length;
    let disabledStartMessage = "Can't start. Check ready states and player amount.";
    if (numNotReady > 0) {
        disabledStartMessage = `${numNotReady} ${numNotReady === 1 ? "player is" : "players are"} not ready.`;
    } else if (numPlayers <= 1) {
        disabledStartMessage = `Must have more than ${numPlayers} player.`;
    }

    return (
        <span>
            <span className="section-header">
                Marshall Controls
            </span>
            <Row>
                <Col xs={1} />
                <Col
                    xs={9}
                >
                    <ChangeWordConstraints
                        minChars={props.minChars}
                        maxChars={props.maxChars}
                        changeWordConstraints={props.changeWordConstraints}
                    />
                </Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "1.3em" }} />
            <Row>
                <Col xs={1} />
                <Col
                    xs={9}
                >
                    <TransferMarshalship
                        currentMarshall={props.currentMarshall}
                        playerNames={Object.keys(props.playerList)}
                        selected={props.selected}
                        changeSelected={props.changeSelected}
                        transferMarshalship={props.transferMarshalship}
                    />
                </Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "3.4em" }}>
                <Col xs={1} />
                <Col
                    xs={9}
                    style={{ textAlign: "center" }}
                >
                    {numNotReady === 0 && numPlayers > 1
                        ? (
                            <Button
                                variant="success"
                                onClick={props.startGame}
                            >
                                Start Game
                            </Button>
                        ) : (
                            <SimpleToolTip
                                text={disabledStartMessage}
                            >
                                <span>
                                    <Button
                                        style={{ pointerEvents: "none" }}
                                        variant="secondary"
                                        disabled
                                    >
                                        Start Game
                                    </Button>
                                </span>
                            </SimpleToolTip>
                        )}
                </ Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "1.3em", paddingBottom: "1.3em" }}>
                <Col xs={1} />
                <Col
                    xs={9}
                >
                    <hr />
                </ Col>
                <Col />
            </Row>
        </span>
    );
}
