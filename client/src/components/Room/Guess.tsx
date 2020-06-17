import React, { FormEvent } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import SimpleToolTip from "../SimpleToolTip";

interface Props {
    clientName: string;
    remainingPlayers: string[];
    lastGuessed: string[];
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    makeGuess: (subject: string, guess: string) => void;
}

interface State {
    guess: string | undefined;
    guessFeedback: string | undefined;
    selected: string | undefined;
    selectedFeedback: string | undefined;
    validated: boolean | undefined;
}

const lastThreeRuleFeedback = "You've guessed the selected user the past three times "
    + "and the game has more than three remaining players.";

function selectedSameAsLastGuesses(
    selected: string | undefined,
    lastGuessed: string[],
    remainingPlayers: number
): boolean {
    let sameLastThree = 0;
    for (const elem of lastGuessed) {
        if (elem === selected) {
            sameLastThree++;
        }
    }

    return remainingPlayers > 3
        && sameLastThree === 3;
}

export default class Guess extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const lastThreeRuleBreak = selectedSameAsLastGuesses(
            props.selected,
            props.lastGuessed,
            props.remainingPlayers.length
        );

        this.state = {
            guess: undefined,
            guessFeedback: undefined,
            selected: props.selected,
            selectedFeedback: lastThreeRuleBreak
                ? lastThreeRuleFeedback
                : undefined,
            validated: lastThreeRuleBreak
                ? false
                : undefined
        };

        this.checkGuess = this.checkGuess.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.selected !== prevProps.selected) {
            this.setState((prevState) => {
                let validated: boolean | undefined = prevState.validated;
                if (this.props.selected == null) {
                    validated = undefined;
                } else if (!this.props.remainingPlayers.includes(this.props.selected)) {
                    validated = false;
                }

                return {
                    selected: this.props.selected,
                    validated
                };
            });
        }
    }

    checkGuess(event: React.ChangeEvent<HTMLInputElement>): void {
        const guess = event.target.value;

        if (guess === "") {
            this.setState({
                guess,
                guessFeedback: "Guess cannot be empty",
                validated: false
            });
            return;
        }
        if (!/^[a-z]+$/gi.test(guess)) {
            this.setState({
                guess,
                guessFeedback: "Guess must only be chars.",
                validated: false
            });
            return;
        }

        this.setState((prevState) => {
            return {
                guess,
                guessFeedback: undefined,
                // validation depends on select now
                validated: prevState.selected != null
            };
        });
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (this.state.validated !== true || this.state.selected == null || this.state.guess == null) {
            return;
        }

        if (!form.checkValidity()) {
            toast.error("Form reads as invalid on submit.");
            return;
        }

        this.props.makeGuess(this.state.selected, this.state.guess.trim());
        this.props.changeSelected(undefined);
        this.setState({ selected: undefined, guess: undefined, validated: undefined });
    }

    onSelect(event: React.ChangeEvent<HTMLInputElement>): void {
        const selected = event.target.value;
        this.props.changeSelected(selected);
        this.setState((prevState) => {
            const lastThreeRuleBreak = selectedSameAsLastGuesses(
                selected,
                this.props.lastGuessed,
                this.props.remainingPlayers.length
            );

            return ({
                selected,
                selectedFeedback: lastThreeRuleBreak
                    ? lastThreeRuleFeedback
                    : undefined,
                // validation depends on guess now
                validated: lastThreeRuleBreak
                    ? false
                    : prevState.guess != null
            });
        });
    }

    renderSubmitButton(): JSX.Element {
        if (this.state.validated == null || this.state.validated === false) {
            return (
                <SimpleToolTip
                    text="Must select a guessable user and valid guess."
                >
                    <span>
                        <Button
                            style={{ pointerEvents: "none" }}
                            variant="secondary"
                            disabled
                        >
                            Guess
                        </Button>
                    </span>
                </SimpleToolTip>
            );
        }

        let sameLastThree = 0;
        for (const elem of this.props.lastGuessed) {
            if (elem === this.state.selected) {
                sameLastThree++;
            }
        }
        if (this.props.remainingPlayers.length > 3
            && sameLastThree === 3) {
            return (
                <SimpleToolTip
                    text={"You've guessed the selected user the past three times "
                        + "and the game has more than three remaining players."}
                >
                    <span>
                        <Button
                            style={{ pointerEvents: "none" }}
                            variant="secondary"
                            disabled
                        >
                            Guess
                        </Button>
                    </span>
                </SimpleToolTip>
            );
        }

        return (
            <Button
                type="submit"
                variant="success"
            >
                Guess
            </Button>
        );
    }

    render(): JSX.Element {
        const selfGuess = this.props.clientName === this.state.selected;

        return (
            <span>
                <Row>
                    <Col xs={1} />
                    <Col
                        xs={9}
                    >
                        <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                            <Row>
                                <Col
                                    xs={5}
                                    style={{ paddingLeft: "0.1em", paddingRight: "0.3em", textAlign: "center" }}
                                >
                                    <Form.Control
                                        as="select"
                                        value={this.state.selected != null ? this.state.selected : ""}
                                        required
                                        isInvalid={this.state.validated === false && this.state.selectedFeedback != null}
                                        onChange={this.onSelect}
                                    >
                                        <option key={"hidden value"} hidden />
                                        {
                                            this.props.remainingPlayers
                                                .map((name) => (
                                                    <option key={name}>{name}</option>
                                                ))
                                        }
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.selectedFeedback || "Selected player is not guessable."}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col
                                    xs={7}
                                    style={{ paddingLeft: "0.3em", paddingRight: "0.1em", textAlign: "center" }}
                                >
                                    <Form.Control
                                        placeholder="Your guess"
                                        onChange={this.checkGuess}
                                        value={this.state.guess || ""}
                                        isInvalid={this.state.validated === false && this.state.guessFeedback != null}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.guessFeedback || "Guess value isn't valid."}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            {selfGuess ? (
                                <Row style={{ paddingTop: ".4em", paddingBottom: ".4em" }}>
                                    <Col />
                                    <Col xs={9}>
                                        <Alert variant="warning" style={{ margin: 0 }}>
                                            You&apos;re guessing yourself!
                                        </Alert>
                                    </Col>
                                    <Col />
                                </Row>
                            ) : undefined}
                            <Row style={{ paddingTop: ".5em" }}>
                                <Col />
                                <Col
                                    xs={4}
                                    style={{ paddingLeft: "0.1em", paddingRight: "0.1em", textAlign: "center" }}
                                >
                                    {this.renderSubmitButton()}
                                </Col>
                                <Col />
                            </Row>
                        </Form>
                    </ Col>
                    <Col />
                </Row>
                <Row style={{ paddingTop: "1.3em", paddingBottom: "1.3em" }}>
                    <Col xs={1} />
                    <Col
                        xs={9}
                    >
                        <hr />
                    </ Col>
                    <Col />
                </Row>
            </span>
        );
    }
}
