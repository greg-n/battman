import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default class RoomWaiting extends React.Component<{}, {}> {
    render(): JSX.Element {
        return (
            <span style={{ height: "100vh", display: "flex", flexFlow: "column" }}>
                <div style={{ marginLeft: "4vw", marginRight: "4vw" }}>
                    <Col>
                        Hi
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
