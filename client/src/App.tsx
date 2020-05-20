import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import "./App.css";
import Landing from "./components/Landing";
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap for whole app

function App(): JSX.Element {
    return (
        <Router>
            <Switch>
                <Route path="/">
                    <Landing />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
