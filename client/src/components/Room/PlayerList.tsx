import React from "react";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { BsCheck, BsCheckAll, BsPersonFill } from "react-icons/bs";
import { GiDeadHead, GiLawStar, GiLostLimb, GiPawn, GiPodiumWinner } from "react-icons/gi";
import { GameState } from "../../types/Game";
import { Player, PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";

interface Props {
    clientName: string;
    clientWord?: string;
    currentPlayer?: string;
    playerList: { [key: string]: Player };
    gameState: GameState;
    marshal?: string;
    outAtBottom?: boolean;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    selectOnlyPlaying?: boolean; // will make only playing players selectable
    changeSelected?: (name?: string) => void;
}

export default function PlayerList(props: Props): JSX.Element {
    const playerList = props.playerList;
    let playerItems: JSX.Element[] = [];
    const outPlayerItems: JSX.Element[] = [];
    for (const [name, player] of Object.entries(playerList)) {
        let playerIsOut = false;
        let bgColor: "secondary" | "light" | "warning" = "light";
        let textColor: "white" | undefined;
        if (
            [
                PlayerState.eliminated,
                PlayerState.disconnected,
                PlayerState.eliminatedDisconnected
            ]
                .includes(player.state)
        ) {
            playerIsOut = true;
            bgColor = "secondary";
            textColor = "white";
        }
        if (player.state === PlayerState.victor) {
            bgColor = "warning";
            textColor = "white";
        }

        const badgeStyle: React.CSSProperties = { paddingLeft: ".3rem" };
        const playerBadges: JSX.Element[] = [];

        // general badges
        if (player.name === props.clientName) {
            playerBadges.push(
                <SimpleToolTip
                    key={`${name}-you`}
                    text="This is you."
                >
                    <span style={badgeStyle}>
                        <BsPersonFill />
                    </span>
                </SimpleToolTip>
            );
        }

        if (props.gameState === GameState.waitingRoom) {
            if (player.name === props.marshal)
                playerBadges.push(
                    <SimpleToolTip
                        key={`${name}-marshal`}
                        text="Waiting room marshal."
                    >
                        <span style={badgeStyle}>
                            <GiLawStar />
                        </span>
                    </SimpleToolTip>
                );

            if (typeof player.guessedWordPortion === "string" && player.state === PlayerState.ready) {
                playerBadges.push(
                    <SimpleToolTip
                        key={`${name}-checkall`}
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
                        key={`${name}-check`}
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
                        key={`${name}-current`}
                        text="Current player."
                    >
                        <span style={badgeStyle}>
                            <GiPawn />
                        </span>
                    </SimpleToolTip>
                );
            if (
                player.state === PlayerState.eliminated ||
                player.state === PlayerState.eliminatedDisconnected
            )
                playerBadges.push(
                    <SimpleToolTip
                        key={`${name}-eliminated`}
                        text="Eliminated."
                    >
                        <span style={badgeStyle}>
                            <GiDeadHead />
                        </span>
                    </SimpleToolTip>
                );
            if (
                player.state === PlayerState.disconnected ||
                player.state === PlayerState.eliminatedDisconnected
            )
                playerBadges.push(
                    <SimpleToolTip
                        key={`${name}-disconnected`}
                        text="Disconnected."
                    >
                        <span style={badgeStyle}>
                            <GiLostLimb />
                        </span>
                    </SimpleToolTip>
                );
            if (player.state === PlayerState.victor)
                playerBadges.push(
                    <SimpleToolTip
                        key={`${name}-victor`}
                        text="Victor."
                    >
                        <span style={badgeStyle}>
                            <GiPodiumWinner />
                        </span>
                    </SimpleToolTip>
                );
        }

        const displayWordPortion = player.guessedWordPortion != null;
        const displayGuessedLetters = !!player.guessedLetters.length;
        const displayGuessedWords = !!player.guessedWords.length;
        const displayEliminatedBy = (
            player.state === PlayerState.eliminated ||
            player.state === PlayerState.eliminatedDisconnected
        ) && player.lastGuessedBy[0] != null;
        const displaySubItems = displayWordPortion
            || displayGuessedLetters
            || displayGuessedWords
            || displayEliminatedBy;

        let wordPortion: string | undefined;
        if (displayWordPortion) {
            wordPortion = player.guessedWordPortion as string; // asserted by displayWordPortion
            if (player.name === props.clientName && props.clientWord != null) {
                wordPortion += `/${props.clientWord}`;
            } else if (props.gameState === GameState.ended && player.word != null) {
                wordPortion += `/${player.word}`;
            }
        }

        const playerJSX = (
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

                        if (props.changeSelected != null)
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
                                            {wordPortion}
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

        if (props.outAtBottom && playerIsOut) {
            outPlayerItems.push(playerJSX);
        } else {
            playerItems.push(playerJSX);
        }
    }
    playerItems = playerItems.concat(outPlayerItems);

    return (
        <span>
            <Row>
                <Col />
                <Col xs={10}>
                    <ListGroup
                        variant="flush"
                        style={{ padding: 0 }}
                    >
                        {playerItems}
                    </ListGroup>
                </Col>
                <Col />
            </Row>
            <Row style={{ paddingTop: "1em", paddingBottom: "1.3em" }}>
                <Col>
                    <hr />
                </ Col>
            </Row>
        </span>
    );
}
