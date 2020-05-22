import React from "react";
import { useLocation, match as Match, useRouteMatch } from "react-router-dom";
import qs from "qs";
import { default as RoomContainer } from "../containers/Room";

export default function Room(): JSX.Element {
    const location = useLocation();
    const match: Match<{ roomName: string }> = useRouteMatch();

    const searchQuery = location.search;
    // should have '?' at beginning
    const trimmed = searchQuery.slice(1, searchQuery.length);
    const parsed = qs.parse(trimmed);

    return (
        <RoomContainer
            roomName={match.params.roomName}
            tryImmediateCreate={parsed.tryImmediateCreate === "true"}
        />
    );
}
