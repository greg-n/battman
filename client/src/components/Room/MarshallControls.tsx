import React from "react";
import { Col, Row } from "react-bootstrap";
import { Player } from "../../types/Player";
import ReactSlider from "react-slider";
import "./Slider.css";

interface MarshallControlsProp {
    playerList: { [key: string]: Player };
    minChars: number;
    maxChars: number;
    selected?: string; // for guessing this will highlight the to be guessed for the guesser
    changeSelected: (name?: string) => void;
    changeWordConstraints: (minChars: number, maxChars: number) => void;
    transferMarshalship: (subject: string) => void;
}

export default function MarshallControls(props: MarshallControlsProp): JSX.Element {
    return (
        <span>
            <Row>
                <Col
                    xs={12}
                >
                    <ReactSlider
                        className="horizontal-slider"
                        thumbClassName="thumb"
                        trackClassName="track"
                        min={1}
                        max={24}
                        defaultValue={[props.minChars, props.maxChars]}
                        ariaLabel={["Lower thumb", "Upper thumb"]}
                        ariaValuetext={(state): string => `Thumb value ${state.valueNow}`}
                        renderThumb={(props, state): JSX.Element => <div {...props}>{state.valueNow}</div>}
                        onChange={(e): void => console.log(e)}
                        pearling
                    />
                </Col>
            </Row>
            <Row style={{ paddingTop: "1.3em" }} />
            <Row>
                <Col
                    xs={12}
                >
                    <div>
                        Hi{props.minChars} {props.selected}
                    </div>
                </Col>
            </Row>
            <Row style={{ paddingTop: "1.3em" }} />
        </span>
    );
}
