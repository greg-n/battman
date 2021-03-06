import React, { FormEvent } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import SimpleToolTip from "../SimpleToolTip";

interface Props {
    currentMarshal: string; // should be client
    playerNames: string[];
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    transferMarshalship: (subject: string) => void;
}

interface State {
    selected: string | undefined;
    validated: boolean | undefined;
}

export default class TransferMarshalship extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selected: props.selected,
            validated: undefined
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.selected !== prevProps.selected) {
            let validated: boolean | undefined = false;
            if (this.props.selected == null) {
                validated = undefined;
            } else if (this.props.selected !== this.props.currentMarshal) {
                validated = true;
            }
            this.setState({
                selected: this.props.selected,
                validated
            });
        }
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (this.state.validated !== true || this.state.selected == null) {
            return;
        }

        if (!form.checkValidity()) {
            toast.error("Form reads as invalid on submit.");
            return;
        }

        this.props.transferMarshalship(this.state.selected);
        this.props.changeSelected(undefined);
        this.setState({ validated: undefined });
    }

    onSelect(event: React.ChangeEvent<HTMLInputElement>): void {
        this.props.changeSelected(event.target.value);
        this.setState({
            selected: event.target.value,
            validated: true
        });
    }

    render(): JSX.Element {
        const filteredNames: (string | undefined)[] = this.props.playerNames
            .filter((name) => (name !== this.props.currentMarshal));
        filteredNames.unshift(undefined);

        return (
            <span>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col xs={1} />
                        <Col
                        >
                            <Form.Label>
                                Transfer Marshalship
                            </Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col />
                        <Col
                            xs={5}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.4em", textAlign: "center" }}
                        >
                            <Form.Control
                                as="select"
                                value={this.state.selected != null ? this.state.selected : ""}
                                disabled={filteredNames.length === 0}
                                required
                                onChange={this.onSelect}
                            >
                                <option key={"hidden value"} hidden />
                                {
                                    this.props.playerNames
                                        .map((name) => (
                                            <option key={name}>{name}</option>
                                        ))
                                }
                            </Form.Control>
                        </Col>
                        <Col
                            style={{ paddingLeft: "0.4em", paddingRight: "0.1em", textAlign: "center" }}
                        >
                            {this.state.selected != null && this.props.currentMarshal !== this.state.selected
                                ? (
                                    <Button
                                        type="submit"
                                        variant="success"
                                    >
                                        Transfer
                                    </Button>
                                ) : (
                                    <SimpleToolTip
                                        text="Must select a user to transfer to."
                                    >
                                        <span>
                                            <Button
                                                style={{ pointerEvents: "none" }}
                                                variant="secondary"
                                                disabled
                                            >
                                                Transfer
                                            </Button>
                                        </span>
                                    </SimpleToolTip>
                                )}
                        </Col>
                        <Col />
                    </Row>
                </Form>
            </span>
        );
    }
}
