import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import logo from "../logo.svg";

export default function Landing(): JSX.Element {
    return (
        <Container>
            <Row>
                <Col />
                <Col md="auto">
                    <img
                        src={logo}
                        style={{ width: 200, height: 200 }}
                        className="App-logo"
                        alt="logo"
                    />
                    <h2>
                        Battman
                        </h2>
                    <div>
                        Battle hangman.
                    </div>
                </Col>
                <Col />
            </Row>
        </Container>
    );
}

