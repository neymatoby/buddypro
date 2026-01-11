/**
 * Trade Setup Service
 * Generates trade setups with entry/exit levels and success probability
 */

import { SIGNAL_TYPES } from '../utils/constants';

/**
 * Calculate trade setup based on technical analysis
 */
export const generateTradeSetup = (data, indicators, signal) => {
    if (!data || data.length < 50 || !indicators || !signal) {
        return null;
    }

    const currentPrice = data[data.length - 1].close;
    const lastCandle = data[data.length - 1];
    const atr = getATRValue(indicators.atr);

    if (!atr) return null;

    // Determine direction from signal
    const isBullish = signal.signal === SIGNAL_TYPES.BUY ||
        signal.signal === SIGNAL_TYPES.STRONG_BUY;
    const isBearish = signal.signal === SIGNAL_TYPES.SELL ||
        signal.signal === SIGNAL_TYPES.STRONG_SELL;

    if (!isBullish && !isBearish) {
        return {
            active: false,
            message: 'No clear setup - market is ranging',
            suggestion: 'Wait for stronger directional signals',
        };
    }

    // Calculate entry, stop loss, and take profit
    const direction = isBullish ? 'LONG' : 'SHORT';
    const entry = currentPrice;

    // Stop loss: 1.5x ATR below/above entry
    const stopDistance = atr * 1.5;
    const stopLoss = isBullish
        ? entry - stopDistance
        : entry + stopDistance;

    // Take profit: 2x ATR (1.5 risk-reward)
    const takeProfitDistance = atr * 2;
    const takeProfit = isBullish
        ? entry + takeProfitDistance
        : entry - takeProfitDistance;

    // Calculate risk/reward ratio
    const riskPips = Math.abs(entry - stopLoss);
    const rewardPips = Math.abs(takeProfit - entry);
    const riskReward = (rewardPips / riskPips).toFixed(2);

    // Calculate success probability based on confluence
    const probability = calculateProbability(indicators, signal, data);

    // Generate setup levels for chart
    const levels = generateLevels(data, indicators, isBullish);

    return {
        active: true,
        direction,
        entry,
        stopLoss,
        takeProfit,
        riskReward,
        probability,
        atr,
        levels,
        reasons: signal.reasons || [],
        timestamp: new Date().toISOString(),
    };
};

/**
 * Calculate success probability based on indicator confluence
 */
const calculateProbability = (indicators, signal, data) => {
    let score = 0;
    let maxScore = 0;

    // RSI contribution (0-15 points)
    maxScore += 15;
    const rsi = getLastValue(indicators.rsi);
    if (rsi !== null) {
        if (signal.signal.includes('Buy') && rsi < 40) score += 15;
        else if (signal.signal.includes('Buy') && rsi < 50) score += 10;
        else if (signal.signal.includes('Sell') && rsi > 60) score += 15;
        else if (signal.signal.includes('Sell') && rsi > 50) score += 10;
        else score += 5;
    }

    // MACD contribution (0-15 points)
    maxScore += 15;
    if (indicators.macd) {
        const macdLine = getLastValue(indicators.macd.macdLine);
        const signalLine = getLastValue(indicators.macd.signalLine);
        if (macdLine !== null && signalLine !== null) {
            if (signal.signal.includes('Buy') && macdLine > signalLine) score += 15;
            else if (signal.signal.includes('Sell') && macdLine < signalLine) score += 15;
            else score += 5;
        }
    }

    // EMA trend contribution (0-20 points)
    maxScore += 20;
    const ema21 = getLastValue(indicators.ema21);
    const ema50 = getLastValue(indicators.ema50);
    const price = data[data.length - 1].close;

    if (ema21 && ema50) {
        if (signal.signal.includes('Buy')) {
            if (price > ema21 && ema21 > ema50) score += 20;
            else if (price > ema21) score += 12;
            else score += 5;
        } else if (signal.signal.includes('Sell')) {
            if (price < ema21 && ema21 < ema50) score += 20;
            else if (price < ema21) score += 12;
            else score += 5;
        }
    }

    // Bollinger Bands contribution (0-15 points)
    maxScore += 15;
    if (indicators.bollingerBands) {
        const upper = getLastValue(indicators.bollingerBands.upper);
        const lower = getLastValue(indicators.bollingerBands.lower);
        const middle = getLastValue(indicators.bollingerBands.middle);

        if (upper && lower && middle) {
            if (signal.signal.includes('Buy') && price <= lower * 1.01) score += 15;
            else if (signal.signal.includes('Sell') && price >= upper * 0.99) score += 15;
            else if (signal.signal.includes('Buy') && price < middle) score += 10;
            else if (signal.signal.includes('Sell') && price > middle) score += 10;
            else score += 5;
        }
    }

    // Signal confidence contribution (0-20 points)
    maxScore += 20;
    if (signal.confidence >= 80) score += 20;
    else if (signal.confidence >= 70) score += 15;
    else if (signal.confidence >= 60) score += 10;
    else score += 5;

    // Calculate final probability (capped between 50-75%)
    const rawProbability = (score / maxScore) * 100;
    const probability = Math.min(75, Math.max(50, Math.round(rawProbability * 0.75 + 25)));

    return probability;
};

/**
 * Generate support/resistance levels for chart
 */
const generateLevels = (data, indicators, isBullish) => {
    const levels = [];
    const currentPrice = data[data.length - 1].close;

    // EMA levels
    const ema21 = getLastValue(indicators.ema21);
    const ema50 = getLastValue(indicators.ema50);

    if (ema21) {
        levels.push({
            price: ema21,
            type: currentPrice > ema21 ? 'support' : 'resistance',
            label: 'EMA 21',
            color: '#f59e0b',
        });
    }

    if (ema50) {
        levels.push({
            price: ema50,
            type: currentPrice > ema50 ? 'support' : 'resistance',
            label: 'EMA 50',
            color: '#8b5cf6',
        });
    }

    // Bollinger Band levels
    if (indicators.bollingerBands) {
        const upper = getLastValue(indicators.bollingerBands.upper);
        const lower = getLastValue(indicators.bollingerBands.lower);

        if (upper) {
            levels.push({
                price: upper,
                type: 'resistance',
                label: 'BB Upper',
                color: '#ef4444',
            });
        }
        if (lower) {
            levels.push({
                price: lower,
                type: 'support',
                label: 'BB Lower',
                color: '#22c55e',
            });
        }
    }

    // Support/Resistance from indicator
    if (indicators.supportResistance && indicators.supportResistance.length > 0) {
        indicators.supportResistance.slice(0, 4).forEach((level, i) => {
            levels.push({
                price: level.price,
                type: level.type,
                label: `${level.type === 'support' ? 'S' : 'R'}${i + 1}`,
                color: level.type === 'support' ? '#22c55e' : '#ef4444',
                strength: level.strength,
            });
        });
    }

    return levels;
};

/**
 * Helper: Get last non-null value from array
 */
const getLastValue = (arr) => {
    if (!arr || !Array.isArray(arr)) return null;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] !== null) return arr[i];
    }
    return null;
};

/**
 * Helper: Get ATR value
 */
const getATRValue = (atrArray) => {
    return getLastValue(atrArray);
};

/**
 * Get trade quality rating
 */
export const getTradeQuality = (probability) => {
    if (probability >= 70) return { rating: 'A', label: 'High Quality', color: '#22c55e' };
    if (probability >= 60) return { rating: 'B', label: 'Good Setup', color: '#84cc16' };
    if (probability >= 55) return { rating: 'C', label: 'Moderate', color: '#f59e0b' };
    return { rating: 'D', label: 'Low Quality', color: '#ef4444' };
};
