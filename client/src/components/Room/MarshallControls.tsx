import React from "react";
import { Col, Row } from "react-bootstrap";
import { Player } from "../../types/Player";
import ChangeWordConstraints from "./ChangeWordConstraints";
import TransferMarshalship from "./TransferMarshalship";

interface MarshallControlsProp {
    currentMarshall: string;
    playerList: { [key: string]: Player };
    minChars: number;
    maxChars: number;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    transferMarshalship: (subject: string) => void;
}

export default function MarshallControls(props: MarshallControlsProp): JSX.Element {
    return (
        <span>
            <h6
                style={{ marginLeft: "6rem" }}
            >
                Marshall Controls
            </h6>
            <Row>
                <Col />
                <Col
                    xs={7}
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
                <Col />
                <Col
                    xs={7}
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
            <Row style={{ paddingTop: "1.3em" }} />
            <Row>
                <Col />
                <Col
                    xs={8}
                >
                    <hr />
                </ Col>
                <Col />
            </Row>
        </span>
    );
}
