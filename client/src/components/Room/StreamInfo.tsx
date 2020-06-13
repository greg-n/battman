import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";

interface Props {
    streamItems: string[];
}

export default function StreamInfo(props: Props): JSX.Element {
    const itemStyle: React.CSSProperties = {
        padding: ".1rem .5rem"
    };

    return (
        <span>
            <h6
                style={{ marginLeft: "7rem" }}
            >
                Action Stream
            </h6>
            <Row>
                <Col />
                <Col xs={8} style={{ paddingTop: ".8em" }}>
                    <Card style={{ overflow: "scroll", height: "16em" }}>
                        <ListGroup variant="flush" >
                            {
                                props.streamItems.reverse().map((streamLine, i) => (
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
                <Col />
                <Col xs={8}>
                    <hr />
                </ Col>
                <Col />
            </Row>
        </span >
    );
}
