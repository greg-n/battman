import React from "react";
import { Col, Row } from "react-bootstrap";
import { AiFillGithub } from "react-icons/ai";
import "../styles/ClickableText.css";
import { requestPermissions } from "../utils/notifications";

export default function InfoFooter(): JSX.Element {
    const colStyle: React.CSSProperties = {
        padding: 0
    };

    return (
        <div
            style={{
                minWidth: "20vw",
                maxWidth: "80vw",
                position: "fixed",
                bottom: 0,
                right: 0,
                padding: ".6rem"
            }}
        >
            <Row>
                <Col style={colStyle} />
                <Col xs={7} style={colStyle}>
                    <div
                        className="clickableText"
                        style={{ paddingTop: ".2em" }}
                        onClick={(): void => { requestPermissions(); }}
                    >
                        Enable notifications
                    </div>
                </Col>
                <Col xs={2} style={colStyle}>
                    <a
                        href="https://github.com/greg-n/battman"
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ color: "inherit" }}
                    >
                        <AiFillGithub size="1.6rem" />
                    </a>
                </Col>
            </Row>
        </div>
    );
}
