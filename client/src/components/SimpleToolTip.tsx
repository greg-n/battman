import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { OverlayInjectedProps } from "react-bootstrap/Overlay";

export default function SimpleToolTip(props: { text: string; children: JSX.Element }): JSX.Element {
    return (
        <OverlayTrigger
            delay={{ show: 150, hide: 150 }}
            overlay={(overlayProps: OverlayInjectedProps): JSX.Element => (
                <Tooltip id="button-tooltip" {...overlayProps}>
                    {props.text}
                </Tooltip>
            )}
        >
            {props.children}
        </OverlayTrigger>
    );
}
