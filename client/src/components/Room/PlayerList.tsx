import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { BsCheck, BsCheckAll, BsPersonFill } from "react-icons/bs";
import { GiDeadHead, GiLawStar, GiLostLimb, GiPawn } from "react-icons/gi";
import { GameState } from "../../types/Game";
import { Player, PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";

interface PlayerListProps {
    clientName: string;
    clientWord?: string;
    currentPlayer?: string;
    playerList: { [key: string]: Player };
    gameState: GameState;
    marshall?: string;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    selectOnlyPlaying?: boolean; // will make only playing players selectable
    changeSelected: (name?: string) => void;
}

export default function PlayerList(props: PlayerListProps): JSX.Element {
    const playerList = props.playerList;
    const playerItems: JSX.Element[] = [];
    for (const [name, player] of Object.entries(playerList)) {
        let bgColor: "secondary" | "light" = "light";
        let textColor: "white" | undefined;
        if (
            [PlayerState.eliminated, PlayerState.disconnected]
                .includes(player.state)
        ) {
            bgColor = "secondary";
            textColor = "white";
        }

        const badgeStyle: React.CSSProperties = { paddingLeft: ".3rem" };
        const playerBadges: JSX.Element[] = [];

        // general badges
        if (player.name === props.clientName) {
            playerBadges.push(
                <SimpleToolTip
                    text="This is you."
                >
                    <span style={badgeStyle}>
                        <BsPersonFill />
                    </span>
                </SimpleToolTip>
            );
        }

        if (props.gameState === GameState.waitingRoom) {
            if (player.name === props.marshall)
                playerBadges.push(
                    <SimpleToolTip
                        text="Waiting room marshall."
                    >
                        <span style={badgeStyle}>
                            <GiLawStar />
                        </span>
                    </SimpleToolTip>
                );

            if (typeof player.guessedWordPortion === "string" && player.state === PlayerState.ready) {
                playerBadges.push(
                    <SimpleToolTip
                        text="Word set. Ready to play."
                    >
                        <span style={badgeStyle}>
                            <BsCheckAll />
                        </span>
                    </SimpleToolTip>
                );
            } else if (typeof player.guessedWordPortion === "string") {
                playerBadges.push(
                    <SimpleToolTip
                        text="Word set. Not yet readied up."
                    >
                        <span style={badgeStyle}>
                            <BsCheck />
                        </span>
                    </SimpleToolTip>
                );
            }
        } else {
            if (player.name === props.currentPlayer
                && props.gameState === GameState.running)
                playerBadges.push(
                    <SimpleToolTip
                        text="Current player."
                    >
                        <span style={badgeStyle}>
                            <GiPawn />
                        </span>
                    </SimpleToolTip>
                );
            if (player.state === PlayerState.eliminated)
                playerBadges.push(
                    <SimpleToolTip
                        text="Eliminated."
                    >
                        <span style={badgeStyle}>
                            <GiDeadHead />
                        </span>
                    </SimpleToolTip>
                );
            if (player.state === PlayerState.disconnected)
                playerBadges.push(
                    <SimpleToolTip
                        text="Disconnected."
                    >
                        <span style={badgeStyle}>
                            <GiLostLimb />
                        </span>
                    </SimpleToolTip>
                );
        }

        const displayWordPortion = player.guessedWordPortion != null;
        const displayGuessedLetters = !!player.guessedLetters.length;
        const displayGuessedWords = !!player.guessedWords.length;
        const displayEliminatedBy = player.state === PlayerState.eliminated && player.lastGuessedBy[0] != null;
        const displaySubItems = displayWordPortion
            || displayGuessedLetters
            || displayGuessedWords
            || displayEliminatedBy;

        playerItems.push(
            <ListGroup.Item
                key={name}
                style={{ paddingLeft: 0, paddingRight: 0 }}
            >
                <Card
                    bg={bgColor}
                    text={textColor}
                    className="text-center"
                    style={{ fontSize: "1.1em" }}
                    border={props.selected === name
                        ? "primary"
                        : undefined}
                    onClick={(): void => {
                        if (props.selectOnlyPlaying === true && player.state !== PlayerState.playing)
                            return;

                        props.changeSelected(name !== props.selected ? name : undefined);
                    }}
                >
                    <Card.Header
                        style={{ fontSize: "1.3em" }}
                    >
                        <span>
                            <span>
                                {player.name}
                            </span>
                            {playerBadges.length > 0
                                ? (
                                    <span style={{ marginLeft: ".5rem" }}>
                                        {playerBadges}
                                    </span>
                                ) : undefined}
                        </span>
                    </Card.Header>
                    {displaySubItems ? (
                        <Card.Body style={{ padding: 0 }}>
                            <ListGroup variant="flush">
                                {displayWordPortion
                                    ? (
                                        <ListGroup.Item style={{ letterSpacing: ".3em", backgroundColor: "transparent", color: textColor }}>
                                            {player.guessedWordPortion}{
                                                player.name === props.clientName && props.clientWord != null
                                                    ? `/${props.clientWord}`
                                                    : undefined
                                            }
                                        </ListGroup.Item>
                                    ) : undefined}
                                {displayGuessedLetters
                                    ? (
                                        <ListGroup.Item style={{ letterSpacing: ".3em", backgroundColor: "transparent", color: textColor }}>
                                            {player.guessedLetters}
                                        </ListGroup.Item>
                                    ) : undefined}
                                {displayGuessedWords
                                    ? (
                                        <ListGroup.Item style={{ backgroundColor: "transparent", color: textColor }}>
                                            {player.guessedWords.map((word, i) => (
                                                <span
                                                    key={word}
                                                    style={
                                                        i < player.guessedWords.length - 1
                                                            ? { paddingRight: ".3em" }
                                                            : undefined
                                                    }
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                        </ListGroup.Item>
                                    ) : undefined}
                                {displayEliminatedBy
                                    ? (
                                        <ListGroup.Item style={{ backgroundColor: "transparent", color: textColor }}>
                                            Eliminated by: {player.lastGuessedBy[0]}
                                        </ListGroup.Item>
                                    ) : undefined}
                            </ListGroup>
                        </Card.Body>
                    ) : undefined}
                </Card>
            </ListGroup.Item>
        );
    }

    return (
        <span>
            <Row>
                <Col />
                <Col
                    xs={9}
                >
                    <ListGroup
                        variant="flush"
                        style={{ padding: 0 }}
                    >
                        {playerItems}
                    </ListGroup>
                </Col>
                <Col xs={1} />
            </Row>
            <Row style={{ paddingTop: "1em", paddingBottom: "1.3em" }}>
                <Col />
                <Col
                    xs={9}
                >
                    <hr />
                </ Col>
                <Col xs={1} />
            </Row>
        </span>
    );
}
