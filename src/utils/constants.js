// Currency pairs configuration
export const CURRENCY_PAIRS = [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 'EUR', quote: 'USD' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', base: 'GBP', quote: 'USD' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', base: 'USD', quote: 'JPY' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', base: 'USD', quote: 'CHF' },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', base: 'AUD', quote: 'USD' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', base: 'USD', quote: 'CAD' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', base: 'NZD', quote: 'USD' },
    { symbol: 'EUR/GBP', name: 'Euro / British Pound', base: 'EUR', quote: 'GBP' },
    { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', base: 'EUR', quote: 'JPY' },
    { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', base: 'GBP', quote: 'JPY' },
];

// Timeframes
export const TIMEFRAMES = [
    { value: '1min', label: '1M', minutes: 1 },
    { value: '5min', label: '5M', minutes: 5 },
    { value: '15min', label: '15M', minutes: 15 },
    { value: '30min', label: '30M', minutes: 30 },
    { value: '60min', label: '1H', minutes: 60 },
    { value: '240min', label: '4H', minutes: 240 },
    { value: 'daily', label: '1D', minutes: 1440 },
];

// Technical Indicators Configuration
export const INDICATORS = {
    RSI: {
        name: 'Relative Strength Index',
        period: 14,
        overbought: 70,
        oversold: 30,
    },
    MACD: {
        name: 'MACD',
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
    },
    EMA: {
        name: 'Exponential Moving Average',
        periods: [9, 21, 50, 200],
    },
    BOLLINGER: {
        name: 'Bollinger Bands',
        period: 20,
        stdDev: 2,
    },
    ATR: {
        name: 'Average True Range',
        period: 14,
    },
};

// Signal types
export const SIGNAL_TYPES = {
    STRONG_BUY: { label: 'Strong Buy', color: '#10b981', weight: 2 },
    BUY: { label: 'Buy', color: '#34d399', weight: 1 },
    NEUTRAL: { label: 'Neutral', color: '#f59e0b', weight: 0 },
    SELL: { label: 'Sell', color: '#f87171', weight: -1 },
    STRONG_SELL: { label: 'Strong Sell', color: '#ef4444', weight: -2 },
};

// API Configuration
export const API_CONFIG = {
    ALPHA_VANTAGE: {
        BASE_URL: 'https://www.alphavantage.co/query',
        // User needs to add their own key
        API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo',
    },
    GEMINI: {
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
        API_KEY: import.meta.env.VITE_GEMINI_KEY || '',
    },
};

// Storage keys
export const STORAGE_KEYS = {
    USER: 'forexpro_user',
    WATCHLIST: 'forexpro_watchlist',
    HISTORY: 'forexpro_history',
    SIGNALS: 'forexpro_signals',
    THEME: 'forexpro_theme',
    SETTINGS: 'forexpro_settings',
};

// Chart colors
export const CHART_COLORS = {
    bullish: '#10b981',
    bearish: '#ef4444',
    background: '#0f172a',
    grid: 'rgba(148, 163, 184, 0.1)',
    text: '#94a3b8',
    crosshair: '#64748b',
};

// Default user settings
export const DEFAULT_SETTINGS = {
    theme: 'dark',
    notifications: true,
    defaultTimeframe: '60min',
    defaultIndicators: ['RSI', 'MACD', 'EMA'],
    soundAlerts: false,
};
