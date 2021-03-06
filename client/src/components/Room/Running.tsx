import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import beforeUnload from "../../utils/beforeUnload";
import { CurrentGameState } from "../../utils/parseMessageData";
import Guess from "./Guess";
import PlayerList from "./PlayerList";
import PreviousGuesses from "./PreviousGuesses";
import StreamInfo from "./StreamInfo";

interface Props {
    roomName: string;
    gameState: CurrentGameState;
    fetchGameState: () => void;
    makeGuess: (subject: string, guess: string) => void;
}

interface State {
    outAtBottom?: boolean;
    selectedUser?: string;
}

export default class RoomRunning extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            outAtBottom: true,
            selectedUser: undefined
        };

        this.changeSelectedUser = this.changeSelectedUser.bind(this);
    }

    componentDidMount(): void {
        window.addEventListener("beforeunload", beforeUnload);
    }

    componentWillUnmount(): void {
        window.removeEventListener("beforeunload", beforeUnload);
    }

    // unset by passing undefined
    changeSelectedUser(name?: string): void {
        this.setState({ selectedUser: name });
    }

    render(): JSX.Element {
        const streamInfo = this.props.gameState.gameInfo.streamInfo;
        const isCurrentPlayer =
            this.props.gameState.gameInfo.currentPlayer === this.props.gameState.clientState.name;
        const remainingPlayers = this.props.gameState.gameInfo.remainingPlayers;
        const lastGuessedAgainst = this.props.gameState.clientState.lastGuessedAgainst;
        const lastGuessedBy = this.props.gameState.clientState.lastGuessedBy;

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
                            <Row>
                                <Col />
                                <Col
                                    xs={9}
                                >
                                    <input
                                        type="checkbox"
                                        name="outAtBottom"
                                        checked={this.state.outAtBottom ?? false}
                                        onChange={(v): void => this.setState({ outAtBottom: v.target.checked })}
                                    />
                                    {" "}
                                    <label htmlFor="outAtBottom">Push out players to bottom</label>

                                    <PlayerList
                                        clientName={this.props.gameState.clientState.name}
                                        clientWord={this.props.gameState.clientState.word || undefined}
                                        currentPlayer={this.props.gameState.gameInfo.currentPlayer}
                                        playerList={this.props.gameState.playerStates}
                                        gameState={this.props.gameState.gameInfo.state}
                                        outAtBottom={this.state.outAtBottom}
                                        selected={this.state.selectedUser}
                                        selectOnlyPlaying={true}
                                        changeSelected={this.changeSelectedUser}
                                    />
                                </Col>
                                <Col xs={1} />
                            </Row>
                        </Col>
                        <Col xs={7}>
                            <Row>
                                <Col xs={1} />
                                <Col
                                    xs={9}
                                >
                                    {isCurrentPlayer ? (
                                        <Guess
                                            clientName={this.props.gameState.clientState.name}
                                            remainingPlayers={remainingPlayers}
                                            lastGuessed={lastGuessedAgainst}
                                            selected={this.state.selectedUser}
                                            changeSelected={this.changeSelectedUser}
                                            makeGuess={this.props.makeGuess}
                                        />
                                    ) : undefined}
                                    {lastGuessedAgainst.length > 0 || lastGuessedBy.length > 0 ? (
                                        <PreviousGuesses
                                            remainingPlayers={remainingPlayers}
                                            lastAgainst={lastGuessedAgainst}
                                            lastBy={lastGuessedBy}
                                            selected={this.state.selectedUser}
                                            changeSelected={this.changeSelectedUser}
                                        />
                                    ) : undefined}
                                    {streamInfo.length > 0 ? (
                                        <StreamInfo
                                            streamItems={streamInfo}
                                        />
                                    ) : undefined}
                                </Col>
                                <Col />
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
