import React from "react";
import { Col, Row } from "react-bootstrap";
import { AiFillGithub } from "react-icons/ai";
import "../styles/ClickableText.css";
import { requestPermissions } from "../utils/notifications";

export default function InfoFooter(): JSX.Element {
    const colStyle: React.CSSProperties = {
        padding: ".2rem"
    };

    return (
        <div
            style={{
                textAlign: "center",
                paddingBottom: ".2rem"
            }}
        >
            <Row className="justify-content-md-center">
                <Col xs="auto" />
                <Col md={3} style={colStyle}>
                    <div
                        className="clickableText"
                        style={{ paddingTop: ".2em" }}
                        onClick={(): void => { requestPermissions(); }}
                    >
                        Enable notifications
                    </div>
                </Col>
                <Col md={1} style={colStyle}>
                    <a
                        href="https://github.com/greg-n/battman"
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ color: "inherit" }}
                    >
                        <AiFillGithub size="1.6rem" />
                    </a>
                </Col>
                <Col xs="auto" />
            </Row>
        </div>
    );
}
