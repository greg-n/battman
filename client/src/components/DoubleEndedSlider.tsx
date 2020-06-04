import React from "react";
import ReactSlider from "react-slider";
import "../styles/Slider.css";

interface DoubleEndedSliderProps {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
    onChange: (min: number, max: number) => void;
}

export default function DoubleEndedSlider(props: DoubleEndedSliderProps): JSX.Element {
    return (
        <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            min={props.min}
            max={props.max}
            defaultValue={[props.defaultMin, props.defaultMax]}
            ariaLabel={["Lower thumb", "Upper thumb"]}
            ariaValuetext={(state): string => `Thumb value ${state.valueNow}`}
            renderThumb={(props, state): JSX.Element => <div {...props}>{state.valueNow}</div>}
            onChange={(e): void => props.onChange(
                (e as unknown as number[])[0],
                (e as unknown as number[])[1]
            )}
            pearling
        />
    );
}
