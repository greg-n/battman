import React from "react";
import { Col, Row } from "react-bootstrap";
import { PlayerState } from "../../types/Player";
import ReadyUp from "./ReadyUp";
import SetWord from "./SetWord";

interface Props {
    playerState: PlayerState;
    playerWord: string | null;
    minLength: number;
    maxLength: number;
    readyUp: () => void;
    setWord: (word: string) => void;
}

export default function SetAndReady(props: Props): JSX.Element {
    return (
        <span>
            <Row>
                <Col />
                <Col
                    xs={7}
                >
                    <SetWord
                        playerState={props.playerState}
                        playerWord={props.playerWord}
                        minLength={props.minLength}
                        maxLength={props.maxLength}
                        setWord={props.setWord}
                    />
                    <Row style={{ paddingTop: "1.3em" }} />
                    <ReadyUp
                        playerState={props.playerState}
                        playerWord={props.playerWord}
                        readyUp={props.readyUp}
                    />
                </Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "1.3em", paddingBottom: "1.3em" }}>
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
