import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import "../../styles/Sections.css";

interface Props {
    guessablePlayers: string[];
    lastAgainst: string[];
    lastBy: string[];
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
}

export default function PreviousGuesses(props: Props): JSX.Element {
    const itemStyle: React.CSSProperties = {
        padding: ".1rem .5rem"
    };

    return (
        <span>
            <span className="section-header">
                Previous Guesses
            </span>
            <Row>
                <Col xs={1} />
                <Col xs={9} style={{ paddingTop: ".8em" }}>
                    <Row>
                        <Col xs={1} />
                        <Col>
                            {/* FIXME redundant code but eslint yells when abstracted out */}
                            <Card style={{ overflow: "scroll", minHeight: "12vh", maxHeight: "24vh" }}>
                                <Card.Header style={{ padding: ".3em" }}>
                                    Against
                                </Card.Header>
                                <ListGroup variant="flush" >
                                    {
                                        props.lastAgainst.map((name, i) => {
                                            const guessable = props.guessablePlayers.includes(name);

                                            return (
                                                <ListGroup.Item
                                                    key={i}
                                                    style={itemStyle}
                                                    variant={((): "secondary" | "primary" | undefined => {
                                                        if (!guessable) {
                                                            return "secondary";
                                                        }
                                                        if (props.selected === name) {
                                                            return "primary";
                                                        }
                                                        return undefined;
                                                    })()}
                                                    onClick={(): void => {
                                                        if (props.selected === name) {
                                                            props.changeSelected(undefined);
                                                            return;
                                                        }
                                                        if (guessable) {
                                                            props.changeSelected(name);
                                                        }
                                                    }}
                                                >
                                                    {name}
                                                </ListGroup.Item>
                                            );
                                        })
                                    }
                                </ListGroup>
                            </Card>
                        </Col>
                        <span style={{ padding: "1em" }} />
                        <Col>
                            <Card style={{ overflow: "scroll", minHeight: "12vh", maxHeight: "24vh" }}>
                                <Card.Header style={{ padding: ".3em" }}>
                                    From
                                </Card.Header>
                                <ListGroup variant="flush" >
                                    {
                                        props.lastBy.map((name, i) => {
                                            const guessable = props.guessablePlayers.includes(name);

                                            return (
                                                <ListGroup.Item
                                                    key={i}
                                                    style={itemStyle}
                                                    variant={((): "secondary" | "primary" | undefined => {
                                                        if (!guessable) {
                                                            return "secondary";
                                                        }
                                                        if (props.selected === name) {
                                                            return "primary";
                                                        }
                                                        return undefined;
                                                    })()}
                                                    onClick={(): void => {
                                                        if (props.selected === name) {
                                                            props.changeSelected(undefined);
                                                            return;
                                                        }
                                                        if (guessable) {
                                                            props.changeSelected(name);
                                                        }
                                                    }}
                                                >
                                                    {name}
                                                </ListGroup.Item>
                                            );
                                        })
                                    }
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col xs={1} />
                    </Row>
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
