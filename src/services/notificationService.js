/**
 * Notification Service
 * Handles browser push notifications for trading signals
 */

const NOTIFICATION_PERMISSION_KEY = 'forexpro_notifications_enabled';
const NOTIFICATION_SETTINGS_KEY = 'forexpro_notification_settings';

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        return { granted: false, reason: 'Notifications not supported in this browser' };
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
            return { granted: true };
        } else if (permission === 'denied') {
            return { granted: false, reason: 'Permission denied by user' };
        } else {
            return { granted: false, reason: 'Permission request dismissed' };
        }
    } catch (error) {
        return { granted: false, reason: error.message };
    }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = () => {
    if (!isNotificationSupported()) return false;
    return Notification.permission === 'granted' &&
        localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';
};

/**
 * Disable notifications
 */
export const disableNotifications = () => {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'false');
};

/**
 * Enable notifications (if permission already granted)
 */
export const enableNotifications = () => {
    if (Notification.permission === 'granted') {
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
        return true;
    }
    return false;
};

/**
 * Get notification settings
 */
export const getNotificationSettings = () => {
    try {
        const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch { }

    return {
        minConfidence: 70,
        signalTypes: ['Strong Buy', 'Strong Sell', 'Buy', 'Sell'],
        soundEnabled: true,
        vibrationEnabled: true,
    };
};

/**
 * Save notification settings
 */
export const saveNotificationSettings = (settings) => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * Show a trading signal notification
 */
export const showSignalNotification = (signal) => {
    if (!areNotificationsEnabled()) return false;

    const settings = getNotificationSettings();

    // Check if signal meets criteria
    if (signal.confidence < settings.minConfidence) return false;
    if (!settings.signalTypes.includes(signal.signal)) return false;

    const isBullish = signal.signal.toLowerCase().includes('buy');
    const icon = isBullish ? '📈' : '📉';
    const title = `${icon} ${signal.signal} Signal - ${signal.pair}`;

    const body = `Confidence: ${signal.confidence}%\n${signal.reasons?.[0] || 'Check the app for details'}`;

    try {
        const notification = new Notification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: `signal-${signal.pair}-${Date.now()}`,
            requireInteraction: false,
            silent: !settings.soundEnabled,
        });

        // Vibrate if supported and enabled
        if (settings.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return true;
    } catch (error) {
        console.error('Failed to show notification:', error);
        return false;
    }
};

/**
 * Show a learning reminder notification
 */
export const showLearningReminder = () => {
    if (!areNotificationsEnabled()) return false;

    try {
        const notification = new Notification('📚 Daily Learning Reminder', {
            body: 'Time to complete your daily forex challenge! Keep your streak going.',
            icon: '/favicon.svg',
            tag: 'learning-reminder',
            requireInteraction: false,
        });

        setTimeout(() => notification.close(), 15000);

        notification.onclick = () => {
            window.focus();
            window.location.hash = '#/challenges';
            notification.close();
        };

        return true;
    } catch {
        return false;
    }
};

/**
 * Schedule a notification for later
 */
export const scheduleNotification = (title, body, delayMs) => {
    if (!areNotificationsEnabled()) return null;

    const timeoutId = setTimeout(() => {
        try {
            new Notification(title, {
                body,
                icon: '/favicon.svg',
            });
        } catch { }
    }, delayMs);

    return timeoutId;
};

/**
 * Cancel a scheduled notification
 */
export const cancelScheduledNotification = (timeoutId) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
};
