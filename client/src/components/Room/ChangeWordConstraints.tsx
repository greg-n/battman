import React from "react";
import DoubleEndedSlider from "../DoubleEndedSlider";
import { Row, Col, Button, Form } from "react-bootstrap";
import SimpleToolTip from "../SimpleToolTip";

interface Props {
    minChars: number;
    maxChars: number;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
}

interface State {
    min: number;
    max: number;
    modified: boolean;
}

export default class ChangeWordConstraints extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            min: props.minChars,
            max: props.maxChars,
            modified: false
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderButton = this.renderButton.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (
            this.props.minChars !== prevProps.minChars
            || this.props.maxChars !== prevProps.maxChars
        ) {
            this.setState({ modified: false });
        }
    }

    onChange(min: number, max: number): void {
        this.setState({
            min,
            max,
            modified: !(this.props.minChars === min
                && this.props.maxChars === max)
        });
    }

    onSubmit(): void {
        if (this.state.modified === false) {
            return;
        }

        this.props.changeWordConstraints(
            this.state.min,
            this.state.max
        );
    }

    renderButton(): JSX.Element {
        if (this.state.modified === true) {
            return (
                <Button
                    onClick={this.onSubmit}
                    variant="success"
                >
                    Set
                </Button>
            );
        } else {
            return (
                <SimpleToolTip
                    text="These are the current constraints."
                >
                    <span>
                        <Button
                            style={{ pointerEvents: "none" }}
                            variant="secondary"
                            disabled
                        >
                            Current
                        </Button>
                    </span>
                </SimpleToolTip>
            );
        }
    }

    render(): JSX.Element {
        return (
            <span>
                <Row>
                    <Col xs={1} />
                    <Col
                    >
                        <Form.Label>
                            Set word constraints. Current: Min: {this.props.minChars}, Max: {this.props.maxChars}.
                        </Form.Label>
                    </Col>
                </Row>
                <Row>
                    <Col />
                    <Col xs={7} style={{ textAlign: "center" }}>
                        <DoubleEndedSlider
                            min={1}
                            max={24}
                            defaultMin={this.props.minChars}
                            defaultMax={this.props.maxChars}
                            onChange={this.onChange}
                        />
                    </Col>
                    <Col />
                </Row>
                <Row>
                    <Col />
                    <Col style={{ textAlign: "center" }}>
                        {this.renderButton()}
                    </Col>
                    <Col />
                </Row>
            </span>
        );
    }
}
