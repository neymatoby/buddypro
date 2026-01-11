// Format price with appropriate decimal places
export const formatPrice = (price, pair = 'EUR/USD') => {
    if (price === null || price === undefined) return '--';

    // JPY pairs typically have 3 decimal places
    const isJpyPair = pair.includes('JPY');
    const decimals = isJpyPair ? 3 : 5;

    return Number(price).toFixed(decimals);
};

// Format percentage change
export const formatPercent = (value, includeSign = true) => {
    if (value === null || value === undefined) return '--';

    const formatted = Math.abs(value).toFixed(2);
    const sign = value >= 0 ? '+' : '-';

    return includeSign ? `${sign}${formatted}%` : `${formatted}%`;
};

// Format large numbers (for volume, etc.)
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '--';

    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';

    return num.toFixed(2);
};

// Format date/time
export const formatDateTime = (dateString, options = {}) => {
    const date = new Date(dateString);

    const defaultOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    };

    return date.toLocaleDateString('en-US', defaultOptions);
};

// Format time only
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format date only
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Get relative time (e.g., "5 minutes ago")
export const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(dateString);
};

// Format currency pair for API calls
export const formatPairForAPI = (pair) => {
    return pair.replace('/', '');
};

// Get confidence level label
export const getConfidenceLabel = (score) => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Low';
    return 'Very Low';
};

// Get confidence color
export const getConfidenceColor = (score) => {
    if (score >= 70) return 'var(--color-bullish)';
    if (score >= 40) return 'var(--color-neutral)';
    return 'var(--color-bearish)';
};

// Clamp a number between min and max
export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

// Generate unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
