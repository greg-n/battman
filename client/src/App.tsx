import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import "./App.css";
import Landing from "./components/Landing";

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
