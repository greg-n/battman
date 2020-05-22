import React from "react";
import { withRouter, match as Match } from "react-router-dom";
import { History, Location } from "history";
import qs from "qs";
import { toast } from "react-toastify";

interface RoomProps {
    history: History;
    location: Location;
    match: Match<{ roomName: string }>;
}

class Room extends React.Component<RoomProps, {}> {
    componentDidMount(): void {
        const searchQuery = this.props.location.search;
        if (typeof searchQuery === "string") {
            // should have '?' at beginning
            const trimmed = searchQuery.slice(1, searchQuery.length);
            const parsed = qs.parse(trimmed);
            if (parsed.tryImmediateCreate === "true") {
                toast("Will attempt immediate create!");
            }
        }
    }

    render(): JSX.Element {
        return (
            <div>
                Hi, welcome to {this.props.match.params.roomName}.
            </div>
        );
    }
}

// dangerous, but type for withRouter does not reflect potential undefined state behavior 
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default withRouter(Room);
