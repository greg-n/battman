import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap for whole app
import "react-toastify/dist/ReactToastify.css";

import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import "./App.css";
import Landing from "./routes/Landing";
import { ToastContainer, Slide } from "react-toastify";

function App(): JSX.Element {
    return (
        <span>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                newestOnTop
                draggable={false}
                transition={Slide}
            />
            <Router>
                <Switch>
                    <Route path="/">
                        <Landing />
                    </Route>
                </Switch>
            </Router>
        </span>
    );
}

export default App;
