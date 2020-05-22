import React, { FormEvent } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";

interface JoinCreateProps {
    buttonText: string;
    onSubmit: () => Promise<void>;
}

interface JoinCreateState {
    validated: boolean | undefined;
    invalidFeedback: string | undefined;
    playerName: string | undefined;
}

function validPlayerName(name: string): boolean {
    return /^[a-zA-Z0-9_ .]+$/g.test(name) && name.length <= 16;
}

export default class JoinCreate extends React.Component<JoinCreateProps, JoinCreateState> {

    constructor(props: JoinCreateProps) {
        super(props);

        this.state = {
            validated: undefined,
            invalidFeedback: "Player name required.",
            playerName: undefined
        };

        this.checkPlayerName = this.checkPlayerName.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
    }

    checkPlayerName(event: React.ChangeEvent<HTMLInputElement>): void {
        const playerName = event.target.value;

        if (playerName === "")
            this.setState({
                validated: false,
                playerName: playerName,
                invalidFeedback: "No name given."
            });
        else if (!validPlayerName(playerName))
            this.setState({
                validated: false,
                playerName: playerName,
                invalidFeedback: "Name must be comprised solely of a maximum 16 [a-z, A-Z, 0-9, _, ' ', .] chars."
            });
        else
            this.setState({
                playerName: playerName,
                validated: true,
                invalidFeedback: undefined
            });
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
            toast.error("Form reads as invalid on submit.");
            return;
        }

        this.props.onSubmit()
            .catch((error) => {
                console.error(error);
                toast.error(error.message);
            });
    }

    renderSubmitButton(): JSX.Element {
        if (!this.state.validated)
            return (
                <Button
                    variant="secondary"
                    disabled
                >
                    {this.props.buttonText}
                </Button>
            );
        else
            return (
                <Button
                    type="submit"
                    variant="success"
                >
                    {this.props.buttonText}
                </ Button>
            );
    }

    render(): JSX.Element {
        return (
            <div>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col
                            xs={8}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em" }}
                        >
                            <Form.Control
                                placeholder="Player name"
                                onChange={this.checkPlayerName}
                                value={this.state.playerName || ""}
                                isInvalid={this.state.validated === false}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {this.state.invalidFeedback}
                            </Form.Control.Feedback>
                        </Col>
                        <Col
                            xs={4}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em" }}
                        >
                            {this.renderSubmitButton()}
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}

