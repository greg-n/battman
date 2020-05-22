import React from "react";
import { GameExternalInfo, GameState } from "../types/Game";
import { Button, Container, Col, Row } from "react-bootstrap";
import RoomFinder from "../containers/RoomFinder";

interface RoomLandingProps {
    roomName: string;
    tryImmediateCreate: boolean;
    roomInfo: null | GameExternalInfo;
}

export default class RoomLanding extends React.Component<RoomLandingProps, {}> {
    constructor(props: RoomLandingProps) {
        super(props);

        this.renderByRoomInfo = this.renderByRoomInfo.bind(this);
    }

    // componentDidMount(): void {
    //     // TODO immediate creation attempt if prop calls for it
    // }

    renderByRoomInfo(): JSX.Element {
        if (this.props.roomInfo == null)
            return (
                <div style={{ margin: 0, padding: 0, paddingTop: "33vh" }}>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            <h2>
                                Vacancy!
                            </h2>
                        </Col>
                        <Col />
                    </Row>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            {/* TODO make this a component similar to room finder with action and text items passable */}
                            <Button variant="success">
                                Start a game here.
                            </Button>
                        </Col>
                        <Col />
                    </Row>
                </div>
            );
        else if (this.props.roomInfo.state === GameState.waitingRoom)
            return (
                <div style={{ margin: 0, padding: 0, paddingTop: "33vh" }}>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            <h2>
                                Found a joinable game with {this.props.roomInfo.playerCount} players!
                            </h2>
                        </Col>
                        <Col />
                    </Row>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            {/* TODO make this a component similar to room finder with action and text items passable */}
                            <Button variant="success">
                                Join.
                            </Button>
                        </Col>
                        <Col />
                    </Row>
                </div>
            );
        else
            return (
                <div style={{ margin: 0, padding: 0, paddingTop: "33vh" }}>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            <h2>
                                Found a game with {this.props.roomInfo.playerCount} players.
                                Unfortunately it&apos;s underway and not joinable.
                            </h2>
                            <p>
                                Maybe try finding a different room?
                            </p>
                        </Col>
                        <Col />
                    </Row>
                    <Row>
                        <Col />
                        <Col md="6" style={{ textAlign: "center", padding: "1rem" }}>
                            <RoomFinder />
                        </Col>
                        <Col />
                    </Row>
                </div>
            );
    }

    render(): JSX.Element {
        return (
            <Container>
                {this.renderByRoomInfo()}
            </Container>
        );
    }
}
