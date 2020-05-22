import React from "react";
import { match as Match, useRouteMatch } from "react-router-dom";
import { default as RoomContainer } from "../containers/Room";

export default function Room(): JSX.Element {
    const match: Match<{ roomName: string }> = useRouteMatch();

    return (
        <RoomContainer
            roomName={match.params.roomName}
        />
    );
}
