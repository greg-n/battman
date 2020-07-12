export default function beforeUnload(e: BeforeUnloadEvent): string {
    const confirmationMessage = "If you leave now you'll be kicked from the game. "
        + "If you're trying to refresh the page, "
        + "try the button in the top right corner to refresh without disconnecting.";

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
}
