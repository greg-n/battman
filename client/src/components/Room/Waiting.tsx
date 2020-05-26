import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default class RoomWaiting extends React.Component<{}, {}> {
    render(): JSX.Element {
        return (
            <span style={{ display: "flex" }}>
                <Container fluid="md" style={{ marginLeft: "4vw" }}>
                    <Row
                        style={{ height: "100vh" }}
                    >
                        <Col
                            xs={12}
                            style={{ backgroundColor: "yellow" }}
                        >
                            Hi
                        </Col>
                    </Row>
                </Container>
                <Container fluid="md" style={{ marginRight: "4vw" }}>
                    <Row
                        style={{ height: "50vh" }}
                    >
                        <Col
                            xs={12}
                            style={{ backgroundColor: "green" }}
                        >
                            Hi
                        </Col>
                    </Row>
                    <Row
                        style={{ height: "50vh" }}
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
        );
    }
}
