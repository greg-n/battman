import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { CurrentGameState } from "../../utils/parseMessageData";
import { BsArrowClockwise } from "react-icons/bs";

interface RoomWaitingProps {
    roomName: string;
    gameState: CurrentGameState;
    clientWS: WebSocket;
}

export default class RoomWaiting extends React.Component<RoomWaitingProps, {}> {
    constructor(props: RoomWaitingProps) {
        super(props);

        this.refreshGameState = this.refreshGameState.bind(this);
    }

    refreshGameState(): void {
        //
    }

    render(): JSX.Element {
        return (
            <span style={{ height: "100vh", display: "flex", flexFlow: "column" }}>
                <div style={{ marginLeft: "4vw", marginRight: "4vw" }}>
                    <Col>
                        <div style={{ paddingTop: ".2rem", paddingBottom: ".2rem" }}>
                            <Button
                                variant="light"
                                onClick={this.refreshGameState}
                            >
                                <BsArrowClockwise />
                                <span style={{ paddingLeft: ".2em" }}>
                                    - Refresh game without disconnecting
                                </span>
                            </Button>
                        </div>
                    </Col>
                </div>
                <span style={{ flexGrow: 1, marginLeft: "4vw", marginRight: "4vw" }}>
                    <span style={{ display: "flex", height: "100%" }}>
                        <Container fluid="md">
                            <Row
                                style={{ height: "100%" }}
                            >
                                <Col
                                    xs={12}
                                    style={{ backgroundColor: "yellow" }}
                                >
                                    Hi
                            </Col>
                            </Row>
                        </Container>
                        <Container fluid="md">
                            <Row
                                style={{ height: "50%" }}
                            >
                                <Col
                                    xs={12}
                                    style={{ backgroundColor: "green" }}
                                >
                                    Hi
                            </Col>
                            </Row>
                            <Row
                                style={{ height: "50%" }}
                            >
                                <Col
                                    xs={12}
                                    style={{ backgroundColor: "blue" }}
                                >
                                    Hi
                            </Col>
                            </Row>
                        </Container>
                    </span>
                </span>
            </span>
        );
    }
}
