import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";

interface ReadyUpProps {
    playerState: PlayerState;
    playerWord: null | string;
    readyUp: () => void;
}

export default function ReadyUp(props: ReadyUpProps): JSX.Element {
    let buttonText: string | undefined;
    if (props.playerState === PlayerState.joined) {
        buttonText = "Ready Up";
    } else if (props.playerState === PlayerState.ready) {
        buttonText = "Unready";
    } else {
        throw new Error("Player state is unexpected.");
    }

    const disabled = props.playerWord == null;

    return (
        <span>
            <Row>
                <Col />
                <Col xs={6} >
                    {!disabled ? (
                        <Button
                            variant="success"
                            onClick={props.readyUp}
                        >
                            {buttonText}
                        </Button>
                    ) : (
                            <SimpleToolTip
                                text="Must set a word before readying."
                            >
                                <span>
                                    <Button
                                        style={{ pointerEvents: "none" }}
                                        variant="secondary"
                                        disabled
                                    >
                                        {buttonText}
                                    </Button>
                                </span>
                            </SimpleToolTip>
                        )}
                </Col>
                <Col />
            </Row>
        </span>
    );
}
