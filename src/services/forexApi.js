import { API_CONFIG, TIMEFRAMES } from '../utils/constants';
import { formatPairForAPI } from '../utils/formatters';

const { ALPHA_VANTAGE } = API_CONFIG;

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate cache key
const getCacheKey = (pair, timeframe) => `${pair}_${timeframe}`;

// Check if cache is valid
const isCacheValid = (key) => {
    const cached = cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Fetch forex data from Alpha Vantage
export const fetchForexData = async (pair, timeframe = '60min') => {
    const cacheKey = getCacheKey(pair, timeframe);

    // Return cached data if valid
    if (isCacheValid(cacheKey)) {
        return cache.get(cacheKey).data;
    }

    const [fromCurrency, toCurrency] = pair.split('/');

    let functionName;
    let interval = '';

    if (timeframe === 'daily') {
        functionName = 'FX_DAILY';
    } else {
        functionName = 'FX_INTRADAY';
        interval = timeframe;
    }

    const params = new URLSearchParams({
        function: functionName,
        from_symbol: fromCurrency,
        to_symbol: toCurrency,
        apikey: ALPHA_VANTAGE.API_KEY,
        outputsize: 'compact',
    });

    if (interval) {
        params.append('interval', interval);
    }

    try {
        const response = await fetch(`${ALPHA_VANTAGE.BASE_URL}?${params}`);
        const data = await response.json();

        if (data['Error Message'] || data['Note']) {
            throw new Error(data['Error Message'] || data['Note']);
        }

        const timeSeries = data[`Time Series FX (${timeframe === 'daily' ? 'Daily' : timeframe})`];

        if (!timeSeries) {
            // Return demo data if API fails
            return generateDemoData(pair, timeframe);
        }

        const formattedData = Object.entries(timeSeries).map(([time, values]) => ({
            time: new Date(time).getTime() / 1000,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
        })).sort((a, b) => a.time - b.time);

        // Cache the result
        cache.set(cacheKey, {
            data: formattedData,
            timestamp: Date.now(),
        });

        return formattedData;
    } catch (error) {
        console.warn('API fetch failed, using demo data:', error.message);
        return generateDemoData(pair, timeframe);
    }
};

// Fetch current exchange rate
export const fetchExchangeRate = async (pair) => {
    const [fromCurrency, toCurrency] = pair.split('/');

    const params = new URLSearchParams({
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: fromCurrency,
        to_currency: toCurrency,
        apikey: ALPHA_VANTAGE.API_KEY,
    });

    try {
        const response = await fetch(`${ALPHA_VANTAGE.BASE_URL}?${params}`);
        const data = await response.json();

        if (data['Error Message'] || data['Note']) {
            throw new Error(data['Error Message'] || data['Note']);
        }

        const rateData = data['Realtime Currency Exchange Rate'];

        if (!rateData) {
            return generateDemoRate(pair);
        }

        return {
            pair,
            price: parseFloat(rateData['5. Exchange Rate']),
            bid: parseFloat(rateData['8. Bid Price']),
            ask: parseFloat(rateData['9. Ask Price']),
            timestamp: rateData['6. Last Refreshed'],
            change: 0, // Calculate from historical data
            changePercent: 0,
        };
    } catch (error) {
        console.warn('Rate fetch failed, using demo data:', error.message);
        return generateDemoRate(pair);
    }
};

// Generate demo data for offline/demo mode
const generateDemoData = (pair, timeframe) => {
    const now = Date.now() / 1000;
    const timeframeConfig = TIMEFRAMES.find(tf => tf.value === timeframe) || TIMEFRAMES[4];
    const intervalSeconds = timeframeConfig.minutes * 60;
    const data = [];

    // Base prices for different pairs
    const basePrices = {
        'EUR/USD': 1.0850,
        'GBP/USD': 1.2650,
        'USD/JPY': 148.50,
        'USD/CHF': 0.8750,
        'AUD/USD': 0.6550,
        'USD/CAD': 1.3550,
        'default': 1.0000,
    };

    let basePrice = basePrices[pair] || basePrices.default;
    const volatility = pair.includes('JPY') ? 0.5 : 0.003;

    // Generate 100 candles
    for (let i = 100; i >= 0; i--) {
        const time = now - (i * intervalSeconds);

        // Random walk with slight trend
        const trend = Math.sin(i / 20) * volatility;
        const noise = (Math.random() - 0.5) * volatility * 2;

        const open = basePrice;
        const change = trend + noise;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;

        data.push({
            time: Math.floor(time),
            open,
            high,
            low,
            close,
        });

        basePrice = close;
    }

    return data;
};

// Generate demo rate for offline/demo mode
const generateDemoRate = (pair) => {
    const basePrices = {
        'EUR/USD': 1.0850,
        'GBP/USD': 1.2650,
        'USD/JPY': 148.50,
        'USD/CHF': 0.8750,
        'AUD/USD': 0.6550,
        'USD/CAD': 1.3550,
        'NZD/USD': 0.6150,
        'EUR/GBP': 0.8580,
        'EUR/JPY': 161.00,
        'GBP/JPY': 187.70,
    };

    const basePrice = basePrices[pair] || 1.0000;
    const spread = pair.includes('JPY') ? 0.03 : 0.0003;
    const change = (Math.random() - 0.5) * (pair.includes('JPY') ? 1 : 0.01);
    const changePercent = (change / basePrice) * 100;

    return {
        pair,
        price: basePrice + change,
        bid: basePrice + change - spread / 2,
        ask: basePrice + change + spread / 2,
        timestamp: new Date().toISOString(),
        change,
        changePercent,
    };
};

// Fetch multiple pairs at once
export const fetchMultipleRates = async (pairs) => {
    const results = await Promise.all(
        pairs.map(pair => fetchExchangeRate(pair.symbol || pair))
    );
    return results;
};

// Clear cache
export const clearCache = () => {
    cache.clear();
};
