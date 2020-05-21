import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { OverlayInjectedProps, Placement } from "react-bootstrap/Overlay";

interface SimpleToolTipProps {
    placement?: Placement;
    text: string;
    children: JSX.Element;
}

export default function SimpleToolTip(props: SimpleToolTipProps): JSX.Element {
    return (
        <OverlayTrigger
            placement={props.placement}
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
