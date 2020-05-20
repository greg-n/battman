import React, { FormEvent } from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { generateRoomName } from "../../utils/roomName";
import { toast } from "react-toastify";

enum RoomNameVacancy {
    noName,
    vacant,
    determining,
    taken
}

interface RoomFinderState {
    validated: boolean;
    nameVacancy: RoomNameVacancy;
    roomName: string | undefined;
}

export default class RoomFinder extends React.Component<{}, RoomFinderState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            validated: false,
            nameVacancy: RoomNameVacancy.noName,
            roomName: undefined
        };

        this.populateOpenRoomName = this.populateOpenRoomName.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
    }

    componentDidMount(): void {
        this.populateOpenRoomName()
            .catch((error) => {
                toast.error(error.message);
                console.error(error);
            });
    }

    async populateOpenRoomName(): Promise<void> {
        this.setState({ roomName: generateRoomName() });
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({ validated: true });
    }

    renderSubmitButton(): JSX.Element {
        switch (this.state.nameVacancy) {
            case RoomNameVacancy.noName:
                return (
                    <Button
                        variant="secondary"
                        disabled
                    >
                        Go
                    </ Button>
                );
            case RoomNameVacancy.vacant:
                return (
                    <Button
                        type="submit"
                        variant="success"
                    >
                        Go
                    </ Button>
                );
            case RoomNameVacancy.determining:
                return (
                    <Button
                        disabled
                    >
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    </Button>
                );
            default:
                throw new Error("Name vacancy value isn't known.");
        }
    }

    render(): JSX.Element {
        return (
            <div>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col
                            xs={2}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em" }}
                        >
                            <Button
                                variant="light"
                                onClick={this.populateOpenRoomName}
                            >
                                <BsArrowClockwise />
                            </Button>
                        </Col>
                        <Col
                            xs={8}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em" }}
                        >
                            <Form.Control
                                placeholder="Room name"
                                defaultValue={this.state.roomName}
                                required
                            />
                        </Col>
                        <Col
                            xs={2}
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
