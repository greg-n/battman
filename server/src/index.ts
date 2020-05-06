import { setUpServer } from "./server";

setUpServer()
    .catch((error) => {
        console.error("Encountered", error);
    });