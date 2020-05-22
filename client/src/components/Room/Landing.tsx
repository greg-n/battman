import React from "react";
import { GameExternalInfo, GameState } from "../../types/Game";
import { Container, Col, Row } from "react-bootstrap";
import RoomFinder from "../../containers/RoomFinder";
import JoinCreate from "./JoinCreate";

interface RoomLandingProps {
    roomName: string;
    roomInfo: null | GameExternalInfo;
    createRoom: () => Promise<void>;
    joinRoom: () => Promise<void>;
}

export default class RoomLanding extends React.Component<RoomLandingProps, {}> {
    constructor(props: RoomLandingProps) {
        super(props);

        this.renderByRoomInfo = this.renderByRoomInfo.bind(this);
    }

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
                        <Col md="4" style={{ textAlign: "center", padding: "1rem" }}>
                            <JoinCreate
                                buttonText="Create"
                                onSubmit={this.props.createRoom}
                            />
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
                        <Col md="4" style={{ textAlign: "center", padding: "1rem" }}>
                            <JoinCreate
                                buttonText="Join"
                                onSubmit={this.props.joinRoom}
                            />
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
                        <Col md="4" style={{ textAlign: "center", padding: "1rem" }}>
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
