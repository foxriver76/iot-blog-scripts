interface NotificationOptions {
    /** Title of the mssage */
    title: string;
    /** Message content */
    content: string;
}

interface PushAction {
    /** Displayed in app */
    buttonTitle: string;
    /** Used as action response */
    identifier: string;
}

interface PushNotificationAdditionalOptions {
    /** If url should be opened */
    openUrl?: string;
    /** If additional actins should be shown */
    actions?: PushAction[];
    /** If given will only be delivered to matching devices */
    devices?: string[];
}

type PushNotificationOptions = NotificationOptions & PushNotificationAdditionalOptions;

/**
 * Send a push notification
 *
 * @param options title and content information
 */
function sendPushNotification(options: PushNotificationOptions): void {
    const { content, title, openUrl, actions, devices } = options;

    const payload: Partial<Record<keyof PushNotificationAdditionalOptions, string>> = {};

    if (openUrl) {
        payload.openUrl = openUrl;
    }

    if (actions) {
        payload.actions = JSON.stringify(actions);
    }

    if (devices) {
        payload.devices = JSON.stringify(devices);
    }

    setState(
        'iot.0.app.message',
        JSON.stringify({
            message: content,
            title,
            priority: 'high',
            payload: payload,
        }),
        false,
    );
}
