import React, { FormEvent } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import SimpleToolTip from "../SimpleToolTip";

interface Props {
    clientName: string;
    guessablePlayers: string[];
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    makeGuess: (subject: string, guess: string) => void;
}

interface State {
    guess: string | undefined;
    selected: string | undefined;
    validated: boolean | undefined;
}

export default class Guess extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            guess: undefined,
            selected: props.selected,
            validated: undefined
        };

        this.checkGuess = this.checkGuess.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.selected !== prevProps.selected) {
            this.setState((prevState) => {
                let validated: boolean | undefined = prevState.validated;
                if (this.props.selected == null) {
                    validated = undefined;
                } else if (!this.props.guessablePlayers.includes(this.props.selected)) {
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
        const guess = event.target.value.trim();

        if (guess === "") {
            this.setState({
                guess: undefined,
                validated: false
            });
            return;
        }

        this.setState((prevState) => {
            return {
                guess,
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

        this.props.makeGuess(this.state.selected, this.state.guess);
        this.props.changeSelected(undefined);
        this.setState({ selected: undefined, guess: undefined, validated: undefined });
    }

    onSelect(event: React.ChangeEvent<HTMLInputElement>): void {
        const selected = event.target.value;
        this.props.changeSelected(selected);
        this.setState((prevState) => ({
            selected,
            // validation depends on guess now
            validated: prevState.guess != null
        }));
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
                                        isInvalid={this.state.validated === false && this.state.selected == null}
                                        onChange={this.onSelect}
                                    >
                                        <option key={"hidden value"} hidden />
                                        {
                                            this.props.guessablePlayers
                                                .map((name) => (
                                                    <option key={name}>{name}</option>
                                                ))
                                        }
                                    </Form.Control>
                                </Col>
                                <Col
                                    xs={7}
                                    style={{ paddingLeft: "0.3em", paddingRight: "0.1em", textAlign: "center" }}
                                >
                                    <Form.Control
                                        placeholder="Your guess"
                                        onChange={this.checkGuess}
                                        value={this.state.guess || ""}
                                        isInvalid={this.state.validated === false && this.state.guess == null}
                                        required
                                    />
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
                                    {this.state.validated != null
                                        ? (
                                            <Button
                                                type="submit"
                                                variant="success"
                                            >
                                                Guess
                                            </Button>
                                        ) : (
                                            <SimpleToolTip
                                                text="Must select a guessable user and insert guess."
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
                                        )}
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
