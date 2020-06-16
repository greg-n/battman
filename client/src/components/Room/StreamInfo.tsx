import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import "../../styles/Sections.css";

interface Props {
    streamItems: string[];
}

export default function StreamInfo(props: Props): JSX.Element {
    const itemStyle: React.CSSProperties = {
        padding: ".1rem .5rem"
    };

    return (
        <span>
            <span className="section-header">
                Action Stream
            </span>
            <Row>
                <Col xs={1} />
                <Col xs={9} style={{ paddingTop: ".8em" }}>
                    <Card style={{ overflow: "scroll", height: "16em" }}>
                        <ListGroup variant="flush" >
                            {
                                props.streamItems.map((streamLine, i) => (
                                    <ListGroup.Item
                                        key={i}
                                        style={itemStyle}
                                    >
                                        {streamLine}
                                    </ListGroup.Item>
                                ))
                            }
                        </ListGroup>
                    </Card>
                </Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "1.3em", paddingBottom: "1.3em" }}>
                <Col xs={1} />
                <Col xs={9}>
                    <hr />
                </ Col>
                <Col />
            </Row>
        </span >
    );
}
