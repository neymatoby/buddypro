import { INDICATORS, SIGNAL_TYPES } from '../utils/constants';

/**
 * Calculate Simple Moving Average (SMA)
 */
export const calculateSMA = (data, period) => {
    if (!data || !Array.isArray(data) || data.length < period) {
        return [];
    }

    const result = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
            continue;
        }

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j]?.close || 0;
        }
        result.push(sum / period);
    }

    return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 */
export const calculateEMA = (data, period) => {
    if (!data || !Array.isArray(data) || data.length < period) {
        return [];
    }

    const result = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for first period
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i]?.close || 0;
        result.push(null);
    }
    result[period - 1] = sum / period;

    // Calculate EMA for remaining periods
    for (let i = period; i < data.length; i++) {
        const ema = ((data[i]?.close || 0) - result[i - 1]) * multiplier + result[i - 1];
        result.push(ema);
    }

    return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 */
export const calculateRSI = (data, period = INDICATORS.RSI.period) => {
    if (!data || !Array.isArray(data) || data.length < period + 1) {
        return [];
    }
    const result = [];
    const gains = [];
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // First period - simple average
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Fill nulls for initial period
    for (let i = 0; i <= period; i++) {
        result.push(null);
    }

    // Calculate RSI
    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        result.push(rsi);
    }

    return result;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (data,
    fastPeriod = INDICATORS.MACD.fastPeriod,
    slowPeriod = INDICATORS.MACD.slowPeriod,
    signalPeriod = INDICATORS.MACD.signalPeriod
) => {
    if (!data || !Array.isArray(data) || data.length < slowPeriod) {
        return { macdLine: [], signalLine: [], histogram: [] };
    }

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine = [];
    const signalLine = [];
    const histogram = [];

    // Calculate MACD line
    for (let i = 0; i < data.length; i++) {
        if (fastEMA[i] === null || slowEMA[i] === null) {
            macdLine.push(null);
        } else {
            macdLine.push(fastEMA[i] - slowEMA[i]);
        }
    }

    // Calculate Signal line (EMA of MACD)
    const validMacd = macdLine.filter(v => v !== null);
    const macdData = validMacd.map((v, i) => ({ close: v }));
    const signalValues = calculateEMA(macdData, signalPeriod);

    let signalIdx = 0;
    for (let i = 0; i < macdLine.length; i++) {
        if (macdLine[i] === null) {
            signalLine.push(null);
            histogram.push(null);
        } else {
            const sig = signalValues[signalIdx] || null;
            signalLine.push(sig);
            histogram.push(sig !== null ? macdLine[i] - sig : null);
            signalIdx++;
        }
    }

    return { macdLine, signalLine, histogram };
};

/**
 * Calculate Bollinger Bands
 */
export const calculateBollingerBands = (data,
    period = INDICATORS.BOLLINGER.period,
    stdDevMultiplier = INDICATORS.BOLLINGER.stdDev
) => {
    if (!data || !Array.isArray(data) || data.length < period) {
        return { upper: [], middle: [], lower: [] };
    }

    const sma = calculateSMA(data, period);
    const upper = [];
    const lower = [];

    for (let i = 0; i < data.length; i++) {
        if (sma[i] === null) {
            upper.push(null);
            lower.push(null);
            continue;
        }

        // Calculate standard deviation
        let sumSquares = 0;
        for (let j = 0; j < period; j++) {
            const diff = (data[i - j]?.close || 0) - sma[i];
            sumSquares += diff * diff;
        }
        const stdDev = Math.sqrt(sumSquares / period);

        upper.push(sma[i] + stdDevMultiplier * stdDev);
        lower.push(sma[i] - stdDevMultiplier * stdDev);
    }

    return { upper, middle: sma, lower };
};

/**
 * Calculate Average True Range (ATR)
 */
export const calculateATR = (data, period = INDICATORS.ATR.period) => {
    if (!data || !Array.isArray(data) || data.length < period) {
        return [];
    }

    const trueRanges = [];
    const result = [];

    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            trueRanges.push(data[i].high - data[i].low);
        } else {
            const tr = Math.max(
                data[i].high - data[i].low,
                Math.abs(data[i].high - data[i - 1].close),
                Math.abs(data[i].low - data[i - 1].close)
            );
            trueRanges.push(tr);
        }
    }

    // Calculate ATR using EMA
    for (let i = 0; i < period - 1; i++) {
        result.push(null);
    }

    // First ATR is simple average
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(atr);

    // Smoothed ATR
    for (let i = period; i < trueRanges.length; i++) {
        atr = ((atr * (period - 1)) + trueRanges[i]) / period;
        result.push(atr);
    }

    return result;
};

/**
 * Detect Support and Resistance levels
 */
export const calculateSupportResistance = (data, lookback = 20) => {
    if (!data || !Array.isArray(data) || data.length < lookback * 2 + 1) {
        return [];
    }

    const levels = [];
    const tolerance = 0.001; // 0.1% tolerance

    // Find local highs and lows
    for (let i = lookback; i < data.length - lookback; i++) {
        let isHigh = true;
        let isLow = true;

        for (let j = 1; j <= lookback; j++) {
            if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) {
                isHigh = false;
            }
            if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) {
                isLow = false;
            }
        }

        if (isHigh) {
            levels.push({ price: data[i].high, type: 'resistance', strength: 1 });
        }
        if (isLow) {
            levels.push({ price: data[i].low, type: 'support', strength: 1 });
        }
    }

    // Cluster nearby levels
    const clustered = [];
    for (const level of levels) {
        const existing = clustered.find(
            l => Math.abs(l.price - level.price) / level.price < tolerance && l.type === level.type
        );

        if (existing) {
            existing.strength++;
            existing.price = (existing.price + level.price) / 2;
        } else {
            clustered.push({ ...level });
        }
    }

    // Sort by strength and return top levels
    return clustered
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 6);
};

/**
 * Generate trading signal based on all indicators
 */
export const generateSignal = (data) => {
    if (!data || data.length < 50) {
        return {
            signal: SIGNAL_TYPES.NEUTRAL,
            confidence: 0,
            reasons: ['Insufficient data for analysis'],
        };
    }

    const lastIndex = data.length - 1;
    const signals = [];
    const reasons = [];

    // RSI Signal
    const rsi = calculateRSI(data);
    const currentRSI = rsi[lastIndex];
    if (currentRSI !== null) {
        if (currentRSI < INDICATORS.RSI.oversold) {
            signals.push(2); // Strong buy
            reasons.push(`RSI (${currentRSI.toFixed(1)}) indicates oversold conditions`);
        } else if (currentRSI > INDICATORS.RSI.overbought) {
            signals.push(-2); // Strong sell
            reasons.push(`RSI (${currentRSI.toFixed(1)}) indicates overbought conditions`);
        } else if (currentRSI < 40) {
            signals.push(1); // Buy
            reasons.push(`RSI (${currentRSI.toFixed(1)}) suggests buying opportunity`);
        } else if (currentRSI > 60) {
            signals.push(-1); // Sell
            reasons.push(`RSI (${currentRSI.toFixed(1)}) suggests selling opportunity`);
        } else {
            signals.push(0);
        }
    }

    // MACD Signal
    const macd = calculateMACD(data);
    const currentMACD = macd.macdLine[lastIndex];
    const currentSignal = macd.signalLine[lastIndex];
    const prevMACD = macd.macdLine[lastIndex - 1];
    const prevSignal = macd.signalLine[lastIndex - 1];

    if (currentMACD !== null && currentSignal !== null && prevMACD !== null && prevSignal !== null) {
        // Bullish crossover
        if (prevMACD < prevSignal && currentMACD > currentSignal) {
            signals.push(2);
            reasons.push('MACD bullish crossover detected');
        }
        // Bearish crossover
        else if (prevMACD > prevSignal && currentMACD < currentSignal) {
            signals.push(-2);
            reasons.push('MACD bearish crossover detected');
        }
        // Above signal line
        else if (currentMACD > currentSignal) {
            signals.push(1);
            reasons.push('MACD above signal line (bullish momentum)');
        }
        // Below signal line
        else {
            signals.push(-1);
            reasons.push('MACD below signal line (bearish momentum)');
        }
    }

    // EMA Trend Signal
    const ema9 = calculateEMA(data, 9);
    const ema21 = calculateEMA(data, 21);
    const ema50 = calculateEMA(data, 50);

    const currentEMA9 = ema9[lastIndex];
    const currentEMA21 = ema21[lastIndex];
    const currentEMA50 = ema50[lastIndex];
    const currentPrice = data[lastIndex].close;

    if (currentEMA9 && currentEMA21 && currentEMA50) {
        if (currentEMA9 > currentEMA21 && currentEMA21 > currentEMA50 && currentPrice > currentEMA9) {
            signals.push(2);
            reasons.push('Strong uptrend: Price above all EMAs in bullish alignment');
        } else if (currentEMA9 < currentEMA21 && currentEMA21 < currentEMA50 && currentPrice < currentEMA9) {
            signals.push(-2);
            reasons.push('Strong downtrend: Price below all EMAs in bearish alignment');
        } else if (currentPrice > currentEMA21) {
            signals.push(1);
            reasons.push('Price above 21 EMA suggests bullish bias');
        } else if (currentPrice < currentEMA21) {
            signals.push(-1);
            reasons.push('Price below 21 EMA suggests bearish bias');
        } else {
            signals.push(0);
        }
    }

    // Bollinger Bands Signal
    const bb = calculateBollingerBands(data);
    const upperBand = bb.upper[lastIndex];
    const lowerBand = bb.lower[lastIndex];

    if (upperBand && lowerBand) {
        if (currentPrice <= lowerBand) {
            signals.push(1);
            reasons.push('Price at lower Bollinger Band (potential bounce)');
        } else if (currentPrice >= upperBand) {
            signals.push(-1);
            reasons.push('Price at upper Bollinger Band (potential reversal)');
        }
    }

    // Calculate overall signal
    const avgSignal = signals.length > 0
        ? signals.reduce((a, b) => a + b, 0) / signals.length
        : 0;

    let signalType;
    if (avgSignal >= 1.5) signalType = SIGNAL_TYPES.STRONG_BUY;
    else if (avgSignal >= 0.5) signalType = SIGNAL_TYPES.BUY;
    else if (avgSignal <= -1.5) signalType = SIGNAL_TYPES.STRONG_SELL;
    else if (avgSignal <= -0.5) signalType = SIGNAL_TYPES.SELL;
    else signalType = SIGNAL_TYPES.NEUTRAL;

    // Calculate confidence (0-100)
    const signalStrength = Math.abs(avgSignal);
    const signalAgreement = signals.length > 0
        ? 1 - (signals.filter(s => Math.sign(s) !== Math.sign(avgSignal)).length / signals.length)
        : 0;
    const confidence = Math.min(100, Math.round((signalStrength * 25 + signalAgreement * 75)));

    return {
        signal: signalType,
        confidence,
        reasons,
        indicators: {
            rsi: currentRSI,
            macd: {
                line: currentMACD,
                signal: currentSignal,
                histogram: macd.histogram[lastIndex],
            },
            ema: {
                ema9: currentEMA9,
                ema21: currentEMA21,
                ema50: currentEMA50,
            },
            bollingerBands: {
                upper: upperBand,
                middle: bb.middle[lastIndex],
                lower: lowerBand,
            },
        },
    };
};

/**
 * Get all indicators for charting
 */
export const getAllIndicators = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return {
            rsi: [],
            macd: { macdLine: [], signalLine: [], histogram: [] },
            ema9: [],
            ema21: [],
            ema50: [],
            ema200: [],
            bollingerBands: { upper: [], middle: [], lower: [] },
            atr: [],
            supportResistance: [],
        };
    }

    return {
        rsi: calculateRSI(data),
        macd: calculateMACD(data),
        ema9: calculateEMA(data, 9),
        ema21: calculateEMA(data, 21),
        ema50: calculateEMA(data, 50),
        ema200: calculateEMA(data, 200),
        bollingerBands: calculateBollingerBands(data),
        atr: calculateATR(data),
        supportResistance: calculateSupportResistance(data),
    };
};

