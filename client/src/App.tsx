import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap for whole app
import React from "react";
import {
    BrowserRouter as Router,
    Route, Switch
} from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import InfoFooter from "./components/InfoFooter";
import Landing from "./routes/Landing";
import Room from "./routes/Room";

export default function App(): JSX.Element {
    return (
        <span>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                newestOnTop
                draggable={false}
                transition={Slide}
            />
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <div style={{ flexGrow: 1 }}>
                    <Router>
                        <Switch>
                            <Route exact path="/">
                                <Landing />
                            </Route>
                            <Route path="/:roomName">
                                <Room />
                            </Route>
                        </Switch>
                    </Router>
                </div>
                <div style={{ flexShrink: 0 }}>
                    <InfoFooter />
                </div>
            </div>
        </span>
    );
}
