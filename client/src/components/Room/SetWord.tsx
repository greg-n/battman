import React, { FormEvent } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { PlayerState } from "../../types/Player";
import SimpleToolTip from "../SimpleToolTip";

interface SetWordProps {
    playerState: PlayerState;
    playerWord: null | string;
    minLength: number;
    maxLength: number;
    setWord: (word: string) => void;
}

interface SetWordState {
    validated: boolean | undefined;
    invalidFeedback: string | undefined;
    playerWord: string | undefined;
}

function validWord(word: string): boolean {
    return /^[a-zA-Z]+$/g.test(word);
}

export default class SetWord extends React.Component<SetWordProps, SetWordState> {
    constructor(props: SetWordProps) {
        super(props);

        this.state = {
            validated: undefined,
            invalidFeedback: "Player name required.",
            playerWord: props.playerWord || undefined
        };

        this.checkPlayerWord = this.checkPlayerWord.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
    }

    componentDidUpdate(prevProps: SetWordProps): void {
        if (prevProps === this.props)
            return;

        if (prevProps.playerWord != null) {
            if (prevProps.playerWord.length < this.props.minLength) {
                this.setState({
                    // keep current word in state so user has a starting place
                    validated: false,
                    invalidFeedback: `Word must be longer than ${this.props.minLength} chars.`
                });
            } else if (prevProps.playerWord.length > this.props.maxLength) {
                this.setState({
                    // keep current word in state so user has a starting place
                    validated: false,
                    invalidFeedback: `Word must be shorter than ${this.props.maxLength} chars.`
                });
            }
        }
    }

    checkPlayerWord(event: React.ChangeEvent<HTMLInputElement>): void {
        const word = event.target.value;

        if (word === "")
            this.setState({
                validated: false,
                playerWord: word,
                invalidFeedback: "No word given."
            });
        else if (word.length < this.props.minLength)
            this.setState({
                validated: false,
                playerWord: word,
                invalidFeedback: `Word must be at least ${this.props.minLength} chars.`
            });
        else if (word.length > this.props.maxLength)
            this.setState({
                validated: false,
                playerWord: word,
                invalidFeedback: `Word must be at most ${this.props.maxLength} chars.`
            });
        else if (!validWord(word))
            this.setState({
                validated: false,
                playerWord: word,
                invalidFeedback: "Name must be comprised solely of a [a-z, A-Z] chars."
            });
        else if (typeof this.props.playerWord === "string" && word === this.props.playerWord)
            this.setState({
                validated: undefined,
                playerWord: word,
                invalidFeedback: "This is your set word."
            });
        else
            this.setState({
                playerWord: word,
                validated: true,
                invalidFeedback: undefined
            });
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.validated) {
            return;
        }

        if (!form.checkValidity()) {
            toast.error("Form reads as invalid on submit.");
            return;
        }

        this.props.setWord(this.state.playerWord as string);
        this.setState({ validated: undefined });
    }

    renderSubmitButton(): JSX.Element {
        if (this.props.playerState !== PlayerState.joined)
            return (
                <SimpleToolTip
                    text="Must not be readied to set a word."
                >
                    <span>
                        <Button
                            style={{ pointerEvents: "none" }}
                            variant="secondary"
                            disabled
                        >
                            Set Word
                        </Button>
                    </span>
                </SimpleToolTip>
            );
        else if (
            typeof this.props.playerWord === "string"
            && this.state.playerWord === this.props.playerWord
        )
            return (
                <SimpleToolTip
                    text="This is your set word."
                >
                    <span>
                        <Button
                            style={{ pointerEvents: "none" }}
                            variant="primary"
                            disabled
                        >
                            Got It!
                        </Button>
                    </span>
                </SimpleToolTip>
            );
        else if (!this.state.validated)
            return (
                <Button
                    variant="secondary"
                    disabled
                >
                    Set Word
                </Button>
            );
        else
            return (
                <Button
                    type="submit"
                    variant="success"
                >
                    Set Word
                </ Button>
            );
    }

    render(): JSX.Element {
        return (
            <div>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Row>
                        <Form.Label>
                            Set your word
                            {this.props.playerWord != null && this.state.playerWord !== this.props.playerWord
                                ? `. Currently: ${this.props.playerWord}`
                                : `. Min: ${this.props.minLength}. Max: ${this.props.maxLength}.`}
                        </Form.Label>
                    </Row>
                    <Row>
                        <Col
                            xs={7}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em", textAlign: "center" }}
                        >
                            <Form.Control
                                placeholder="Your word"
                                onChange={this.checkPlayerWord}
                                value={this.state.playerWord || ""}
                                isInvalid={this.state.validated === false}
                                required
                                // Cannot be anything but joined to set a word
                                disabled={this.props.playerState !== PlayerState.joined}
                            />
                            <Form.Control.Feedback type="invalid">
                                {this.state.invalidFeedback}
                            </Form.Control.Feedback>
                        </Col>
                        <Col />
                        <Col
                            xs={4}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em", textAlign: "center" }}
                        >
                            {this.renderSubmitButton()}
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}
