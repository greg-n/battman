import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { GiDeadHead, GiLawStar, GiLostLimb } from "react-icons/gi";
import { GameState } from "../../types/Game";
import { Player, PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";

interface PlayerListProps {
    playerList: { [key: string]: Player };
    gameState: GameState;
    playerWordSet?: boolean;
    marshall?: string;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
}

export default function PlayerList(props: PlayerListProps): JSX.Element {
    const playerList = props.playerList;
    const playerItems: JSX.Element[] = [];
    for (const [name, player] of Object.entries(playerList)) {
        let bgColor: "secondary" | undefined;
        let textColor: "white" | undefined;
        if (
            [PlayerState.eliminated, PlayerState.disconnected]
                .includes(player.state)
        ) {
            bgColor = "secondary";
            textColor = "white";
        }

        const badgeStyle: React.CSSProperties = { paddingLeft: ".2rem" };
        const playerBadges: JSX.Element[] = [];
        if (props.gameState === GameState.waitingRoom) {
            if (player.name === props.marshall)
                playerBadges.push(
                    <span style={badgeStyle}>
                        <SimpleToolTip
                            text="Waiting room marshall."
                        >
                            <GiLawStar />
                        </SimpleToolTip>
                    </span>
                );

            if (props.playerWordSet === true && player.state === PlayerState.ready) {
                playerBadges.push(
                    <span style={badgeStyle}>
                        <SimpleToolTip
                            text="Word set. Ready to play."
                        >
                            <BsCheckAll />
                        </SimpleToolTip>
                    </span>
                );
            } else if (props.playerWordSet === true) {
                playerBadges.push(
                    <span style={badgeStyle}>
                        <SimpleToolTip
                            text="Word set. Not yet readied up."
                        >
                            <BsCheck />
                        </SimpleToolTip>
                    </span>
                );
            }
        } else {
            if (player.state === PlayerState.eliminated)
                playerBadges.push(
                    <span style={badgeStyle}>
                        <SimpleToolTip
                            text="Eliminated."
                        >
                            <GiDeadHead />
                        </SimpleToolTip>
                    </span>
                );
            if (player.state === PlayerState.disconnected)
                playerBadges.push(
                    <span style={badgeStyle}>
                        <SimpleToolTip
                            text="Disconnected."
                        >
                            <GiLostLimb />
                        </SimpleToolTip>
                    </span>
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
            <ListGroup.Item key={name}>
                <Card
                    bg={bgColor}
                    text={textColor}
                    className="text-center"
                    style={{ fontSize: "1.1em" }}
                    border={props.selected === name
                        ? "primary"
                        : undefined}
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
                        <ListGroup variant="flush">
                            {displayWordPortion
                                ? (
                                    <ListGroup.Item>
                                        {player.guessedWordPortion}
                                    </ListGroup.Item>
                                ) : undefined}
                            {displayGuessedLetters
                                ? (
                                    <ListGroup.Item>
                                        {player.guessedLetters}
                                    </ListGroup.Item>
                                ) : undefined}
                            {displayGuessedWords
                                ? (
                                    <ListGroup.Item>
                                        {player.guessedWords}
                                    </ListGroup.Item>
                                ) : undefined}
                            {displayEliminatedBy
                                ? (
                                    <ListGroup.Item>
                                        Eliminated by: {player.lastGuessedBy[0]}
                                    </ListGroup.Item>
                                ) : undefined}
                        </ListGroup>
                    ) : undefined}
                </Card>
            </ListGroup.Item>
        );
    }

    return (
        <span>
            <ListGroup variant="flush">
                {playerItems}
            </ListGroup>
        </span>
    );
}
