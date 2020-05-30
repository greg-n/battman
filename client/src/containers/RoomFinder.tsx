import { AxiosResponse } from "axios";
import { History, Location } from "history";
import debounce from "lodash.debounce";
import React, { FormEvent } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { BsArrowClockwise } from "react-icons/bs";
import { match as Match, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api";
import SimpleToolTip from "../components/SimpleToolTip";
import { GameExternalInfo } from "../types/Game";
import { generateRoomName } from "../utils/roomName";

enum RoomNameVacancy {
    noName,
    vacant,
    determining,
    taken,
    inValid
}

interface RoomFinderProps {
    history: History;
    location: Location;
    match: Match;
}

interface RoomFinderState {
    validated: boolean;
    nameVacancy: RoomNameVacancy;
    roomName: string | undefined;
}

function validRoomName(name: string): boolean {
    return /^[a-zA-Z-_]+$/g.test(name) && name.length <= 24;
}

class RoomFinder extends React.Component<RoomFinderProps, RoomFinderState> {
    // to allow checking via server when user stops typing
    debounceCheck = debounce(
        () => {
            const userEditedName = this.state.roomName;

            api.get(`/rooms/${userEditedName}`)
                .then((resp: AxiosResponse<null | GameExternalInfo>) => {
                    if (resp.data == null) { // if info is null then the game is available
                        this.setState({
                            roomName: userEditedName,
                            validated: true,
                            nameVacancy: RoomNameVacancy.vacant
                        });
                    } else {
                        this.setState({
                            validated: false,
                            nameVacancy: RoomNameVacancy.taken
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error(error.message);
                });
        },
        500,
        { leading: false, trailing: true }
    );

    constructor(props: RoomFinderProps) {
        super(props);

        this.state = {
            validated: false,
            nameVacancy: RoomNameVacancy.noName,
            roomName: undefined
        };

        this.checkRoomName = this.checkRoomName.bind(this);
        this.getInvalidFeedBack = this.getInvalidFeedBack.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.populateOpenRoomName = this.populateOpenRoomName.bind(this);
        this.renderSubmitButton = this.renderSubmitButton.bind(this);
    }

    componentDidMount(): void {
        this.populateOpenRoomName()
            .catch((error) => {
                toast.error(error.message);
                console.error(error);
            });
    }

    checkRoomName(event: React.ChangeEvent<HTMLInputElement>): void {
        if (!validRoomName(event.target.value)) {
            this.setState({
                roomName: event.target.value,
                validated: false,
                nameVacancy: event.target.value === "" || event.target.value == null
                    ? RoomNameVacancy.noName
                    : RoomNameVacancy.inValid
            });
            this.debounceCheck.cancel(); // stop any debounced event from happening

            return;
        }

        this.setState({
            roomName: event.target.value,
            nameVacancy: RoomNameVacancy.determining
        });
        this.debounceCheck();
    }

    getInvalidFeedBack(): string {
        switch (this.state.nameVacancy) {
            case RoomNameVacancy.noName:
                return "Must have a entry.";
            case RoomNameVacancy.taken:
                return "This room is taken.";
            case RoomNameVacancy.inValid:
                return "Room name is not only [a-z, A-Z, -, _] chars or is over 24 chars in length.";
            default:
                return "Form invalid.";
        }
    }

    handleSubmit(event: FormEvent<HTMLFormElement>): void {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.validated) {
            return;
        }

        if (form.checkValidity()) {
            this.props.history.push(
                `/${this.state.roomName}`
            );
        } else {
            toast.error("Form reads as invalid on submit.");
        }
    }

    async populateOpenRoomName(): Promise<void> {
        this.setState({ nameVacancy: RoomNameVacancy.determining });

        let openRoom: string | undefined;
        const maxTries = 4;
        let tryCounter = 0;

        while (openRoom == null && tryCounter < maxTries) {
            const potentialName = generateRoomName();
            // allow potential error to pass to caller
            const resp: AxiosResponse<null | GameExternalInfo> = await api.get(`/rooms/${potentialName}`);
            if (resp.data == null) { // if info is null then the game is available
                openRoom = potentialName;
            }

            tryCounter++;
        }

        if (tryCounter >= maxTries || openRoom == null) {
            toast.error("Couldn't find an open room name. Try again.");
            this.setState({ roomName: "", validated: false, nameVacancy: RoomNameVacancy.noName });
        } else {
            this.setState({ roomName: openRoom, validated: true, nameVacancy: RoomNameVacancy.vacant });
        }
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
                    </Button>
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
            case RoomNameVacancy.taken:
                return (
                    <Button
                        variant="dark"
                        disabled
                    >
                        Go
                    </Button>
                );
            case RoomNameVacancy.inValid:
                return (
                    <Button
                        variant="dark"
                        disabled
                    >
                        Go
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
                            <SimpleToolTip
                                placement="top"
                                text="Find vacant room name."
                            >
                                <Button
                                    variant="light"
                                    onClick={this.populateOpenRoomName}
                                >
                                    <BsArrowClockwise />
                                </Button>
                            </SimpleToolTip>
                        </Col>
                        <Col
                            xs={8}
                            style={{ paddingLeft: "0.1em", paddingRight: "0.1em" }}
                        >
                            <Form.Control
                                placeholder="Room name"
                                onChange={this.checkRoomName}
                                value={this.state.roomName || ""}
                                isInvalid={!this.state.validated && this.state.nameVacancy !== RoomNameVacancy.vacant}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {this.getInvalidFeedBack()}
                            </Form.Control.Feedback>
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

export default withRouter(RoomFinder);
