/**
 * Request browser notification permission and return the result.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Send a browser notification if permission is granted.
 */
export function sendBrowserNotification(title: string, body: string, url?: string) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
    });

    if (url) {
        notification.onclick = () => {
            window.focus();
            window.location.href = url;
        };
    }
}
