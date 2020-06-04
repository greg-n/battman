import React from "react";
import { Col, Row } from "react-bootstrap";
import { Player } from "../../types/Player";
import ChangeWordConstraints from "./ChangeWordConstraints";

interface MarshallControlsProp {
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
                <Col
                    xs={12}
                >
                    <div>
                        Hi{props.minChars} {props.selected}
                    </div>
                </Col>
            </Row>
            <Row style={{ paddingTop: "1.3em" }} />
        </span>
    );
}
