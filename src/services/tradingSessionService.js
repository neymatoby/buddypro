/**
 * Trading Session Service
 * Provides market session times and West Africa-optimized trading windows
 */

// West Africa Time is UTC+0 (Ghana, Senegal, etc.) or UTC+1 (Nigeria - WAT)
const WAT_OFFSET = 1; // Hours offset from UTC for West Africa Time

/**
 * Global Trading Sessions (times in UTC)
 */
export const TRADING_SESSIONS = {
    SYDNEY: {
        name: 'Sydney (Asia Pacific)',
        emoji: '🇦🇺',
        openUTC: 22,  // 22:00 UTC
        closeUTC: 7,  // 07:00 UTC
        pairs: ['AUD/USD', 'NZD/USD', 'AUD/JPY'],
        volatility: 'low',
    },
    TOKYO: {
        name: 'Tokyo (Asian)',
        emoji: '🇯🇵',
        openUTC: 0,   // 00:00 UTC
        closeUTC: 9,  // 09:00 UTC
        pairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
        volatility: 'medium',
    },
    LONDON: {
        name: 'London (European)',
        emoji: '🇬🇧',
        openUTC: 8,   // 08:00 UTC
        closeUTC: 17, // 17:00 UTC
        pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'],
        volatility: 'high',
    },
    NEW_YORK: {
        name: 'New York (American)',
        emoji: '🇺🇸',
        openUTC: 13,  // 13:00 UTC
        closeUTC: 22, // 22:00 UTC
        pairs: ['EUR/USD', 'GBP/USD', 'USD/CAD'],
        volatility: 'high',
    },
};

/**
 * Best trading windows for West Africa (in WAT - UTC+1)
 */
export const WEST_AFRICA_WINDOWS = [
    {
        name: 'London Open',
        startWAT: 9,   // 09:00 WAT
        endWAT: 12,    // 12:00 WAT
        quality: 3,    // Stars out of 4
        description: 'London opens - high volatility, good trends',
        bestPairs: ['EUR/USD', 'GBP/USD'],
    },
    {
        name: 'London/NY Overlap',
        startWAT: 14,  // 14:00 WAT
        endWAT: 18,    // 18:00 WAT  
        quality: 4,    // Best - 4 stars
        description: 'Best liquidity & volatility of the day',
        bestPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    },
    {
        name: 'NY Session',
        startWAT: 18,  // 18:00 WAT
        endWAT: 23,    // 23:00 WAT
        quality: 3,
        description: 'Strong US market moves',
        bestPairs: ['EUR/USD', 'USD/CAD', 'USD/JPY'],
    },
    {
        name: 'Asian Session',
        startWAT: 1,   // 01:00 WAT
        endWAT: 10,    // 10:00 WAT
        quality: 2,
        description: 'Lower volatility, range trading',
        bestPairs: ['USD/JPY', 'AUD/USD'],
    },
];

/**
 * Get current hour in West Africa Time (WAT)
 */
export const getCurrentWATHour = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    return (utcHour + WAT_OFFSET) % 24;
};

/**
 * Check if a session is currently active
 */
export const isSessionActive = (session) => {
    const utcHour = new Date().getUTCHours();

    if (session.openUTC < session.closeUTC) {
        return utcHour >= session.openUTC && utcHour < session.closeUTC;
    } else {
        // Session spans midnight
        return utcHour >= session.openUTC || utcHour < session.closeUTC;
    }
};

/**
 * Get all currently active sessions
 */
export const getActiveSessions = () => {
    return Object.entries(TRADING_SESSIONS)
        .filter(([_, session]) => isSessionActive(session))
        .map(([key, session]) => ({ key, ...session }));
};

/**
 * Get current trading window for West Africa
 */
export const getCurrentWindow = () => {
    const watHour = getCurrentWATHour();

    for (const window of WEST_AFRICA_WINDOWS) {
        if (window.startWAT < window.endWAT) {
            if (watHour >= window.startWAT && watHour < window.endWAT) {
                return window;
            }
        } else {
            if (watHour >= window.startWAT || watHour < window.endWAT) {
                return window;
            }
        }
    }

    return null;
};

/**
 * Get trading recommendation for current time
 */
export const getTradingRecommendation = () => {
    const watHour = getCurrentWATHour();
    const activeSessions = getActiveSessions();
    const currentWindow = getCurrentWindow();

    // Best times (London/NY overlap: 14:00-18:00 WAT)
    if (watHour >= 14 && watHour < 18) {
        return {
            status: 'excellent',
            icon: '🟢',
            title: 'Excellent Time to Trade',
            message: 'London/NY overlap - highest liquidity and volatility',
            suggestedAction: 'Look for breakout trades on EUR/USD or GBP/USD',
            quality: 4,
        };
    }

    // Good times (London: 09:00-14:00 WAT, NY: 18:00-22:00 WAT)
    if ((watHour >= 9 && watHour < 14) || (watHour >= 18 && watHour < 22)) {
        return {
            status: 'good',
            icon: '🟡',
            title: 'Good Time to Trade',
            message: activeSessions.map(s => s.name).join(' & ') + ' active',
            suggestedAction: 'Watch for trend continuation patterns',
            quality: 3,
        };
    }

    // Asian session (01:00-09:00 WAT)
    if (watHour >= 1 && watHour < 9) {
        return {
            status: 'moderate',
            icon: '🔵',
            title: 'Asian Session',
            message: 'Lower volatility - good for range trading',
            suggestedAction: 'Consider USD/JPY or wait for London open',
            quality: 2,
        };
    }

    // Quiet times
    return {
        status: 'low',
        icon: '⚪',
        title: 'Low Activity Period',
        message: 'Markets transitioning between sessions',
        suggestedAction: 'Wait for London open at 09:00 WAT',
        quality: 1,
    };
};

/**
 * Get time until next good trading window (in minutes)
 */
export const getTimeToNextWindow = () => {
    const now = new Date();
    const watHour = getCurrentWATHour();
    const watMinute = now.getMinutes();

    // Next good windows start at: 09:00, 14:00 WAT
    const goodTimes = [9, 14];

    for (const targetHour of goodTimes) {
        if (watHour < targetHour) {
            const hoursLeft = targetHour - watHour - 1;
            const minutesLeft = 60 - watMinute;
            return {
                hours: hoursLeft,
                minutes: minutesLeft,
                targetTime: `${targetHour.toString().padStart(2, '0')}:00 WAT`,
            };
        }
    }

    // Next window is tomorrow at 09:00
    const hoursLeft = (24 - watHour) + 9 - 1;
    const minutesLeft = 60 - watMinute;
    return {
        hours: hoursLeft,
        minutes: minutesLeft,
        targetTime: '09:00 WAT (tomorrow)',
    };
};

/**
 * Format time for West Africa
 */
export const formatWATTime = (utcHour) => {
    const watHour = (utcHour + WAT_OFFSET) % 24;
    return `${watHour.toString().padStart(2, '0')}:00 WAT`;
};
