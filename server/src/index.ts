import { setUpServer, tearDownServerItems } from "./server";

const signalsToCatch: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];

setUpServer()
    .then((serverItems) => {
        let tornDown = false;
        for (const signal of signalsToCatch) {
            process.once(signal, () => {
                if (tornDown)
                    return;
                else
                    tornDown = true;

                tearDownServerItems(serverItems)
                    .catch((error) => {
                        console.error("Error on shutdown", error);
                    });
            });
        }
    })
    .catch((error) => {
        console.error("Error on starting", error);
    });