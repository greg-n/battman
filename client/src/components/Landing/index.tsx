import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import RoomFinder from "./RoomFinder";

export default function Landing(): JSX.Element {
    return (
        <Container style={{ paddingTop: "33vh" }}>
            <Row>
                <Col />
                <Col md="6" style={{ textAlign: "center" }}>
                    <h2 style={{ padding: "1.5rem" }}>
                        Battman
                    </h2>
                </Col>
                <Col />
            </Row>
            <Row>
                <Col />
                <Col md="4" style={{ textAlign: "center" }}>
                    <RoomFinder />
                </Col>
                <Col />
            </Row>
        </Container>
    );
}

