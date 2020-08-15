import { toast } from "react-toastify";

const openToast = Date.now(); // Same toast id for all notification toasts
let openNotification: Notification | undefined;

function checkNotificationPromise(): boolean {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }

    return true;
}

export function requestPermissions(): void {
    function handlePermission(permission: NotificationPermission): void {
        // Whatever the user answers, we make sure Chrome stores the information
        if (!("permission" in Notification)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            Notification.permission = permission;
        }

        if (permission === "granted") {
            toast.success(
                "All set for notifications!",
                { toastId: openToast }
            );
        } else {
            toast.warning(
                "Could not get correct permissions for notifications.",
                { toastId: openToast }
            );
        }
    }

    if (!("Notification" in window)) {
        toast.warning(
            "This browser does not support notifications. You'll get these popups exclusively."
        );
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    handlePermission(permission);
                });
        } else {
            Notification.requestPermission(function (permission) {
                handlePermission(permission);
            });
        }
    }
}

export function send(title: string, body?: string): void {
    if ("Notification" in window && !document.hasFocus()) {
        if (Notification.permission !== "granted") {
            return;
        }
        if (openNotification != null) {
            openNotification.close();
            openNotification = undefined;
        }
        openNotification = new Notification(title, { body, icon: "/public/favicon.ico" });
        openNotification.addEventListener("close", () => {
            openNotification?.close();
            openNotification = undefined;
        });
    } else {
        toast.dismiss(openToast);
        toast.info(
            `${title}${body != null ? `: ${body}` : ""}`,
            { toastId: openToast }
        );
    }
}
