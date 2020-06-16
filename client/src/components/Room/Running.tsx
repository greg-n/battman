import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { PlayerState } from "../../types/Player";
import { CurrentGameState } from "../../utils/parseMessageData";
import Guess from "./Guess";
import PlayerList from "./PlayerList";
import StreamInfo from "./StreamInfo";

interface Props {
    roomName: string;
    gameState: CurrentGameState;
    fetchGameState: () => void;
    makeGuess: (subject: string, guess: string) => void;
}

interface State {
    selectedUser: string | undefined;
}

export default class RoomRunning extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selectedUser: undefined
        };

        this.changeSelectedUser = this.changeSelectedUser.bind(this);
    }

    // unset by passing undefined
    changeSelectedUser(name?: string): void {
        this.setState({ selectedUser: name });
    }

    render(): JSX.Element {
        const streamInfo = this.props.gameState.gameInfo.streamInfo;
        const isCurrentPlayer =
            this.props.gameState.gameInfo.currentPlayer === this.props.gameState.clientState.name;

        return (
            <Row>
                <Col xs={12}>
                    <Row style={{ paddingLeft: "1em" }}>
                        <div >
                            <Col style={{ paddingTop: ".4rem", paddingBottom: ".4rem" }}>
                                <div>
                                    <Button
                                        variant="light"
                                        onClick={this.props.fetchGameState}
                                    >
                                        <BsArrowClockwise />
                                        <span style={{ paddingLeft: ".2em" }}>
                                            - Refresh game without disconnecting
                                        </span>
                                    </Button>
                                </div>
                            </Col>
                        </div>
                    </Row>
                    <Row>
                        <Col
                            xs={5}
                        >
                            <PlayerList
                                clientName={this.props.gameState.clientState.name}
                                clientWord={this.props.gameState.clientState.word || undefined}
                                currentPlayer={this.props.gameState.gameInfo.currentPlayer}
                                playerList={this.props.gameState.playerStates}
                                gameState={this.props.gameState.gameInfo.state}
                                marshall={this.props.gameState.gameInfo.waitingRoomMarshall}
                                selected={this.state.selectedUser}
                                selectOnlyPlaying={true}
                                changeSelected={this.changeSelectedUser}
                            />
                        </Col>
                        <Col xs={7}>
                            {isCurrentPlayer ? (
                                <Guess
                                    clientName={this.props.gameState.clientState.name}
                                    selected={this.state.selectedUser}
                                    guessablePlayers={
                                        Object.entries(this.props.gameState.playerStates)
                                            .map(([name, item]) => {
                                                return item.state === PlayerState.playing
                                                    ? name
                                                    : undefined;
                                            })
                                            .filter((value) => typeof value === "string") as string[]
                                    }
                                    changeSelected={this.changeSelectedUser}
                                    makeGuess={this.props.makeGuess}
                                />
                            ) : undefined}
                            {streamInfo.length > 0 ? (
                                <StreamInfo
                                    streamItems={streamInfo}
                                />
                            ) : undefined}
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
