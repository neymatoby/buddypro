import { STORAGE_KEYS } from '../utils/constants';

/**
 * Trade Performance Analysis Service
 * Analyzes historical signals to show when trades would have been profitable
 */

// Storage key for performance data
const PERFORMANCE_STORAGE_KEY = 'forexpro_performance';

/**
 * Analyze a trade opportunity based on signal and subsequent price movement
 */
export const analyzeTradeOpportunity = (signal, entryPrice, priceHistory, pipsTarget = 20) => {
    if (!priceHistory || priceHistory.length < 2) {
        return null;
    }

    const isBuy = signal.signal.toLowerCase().includes('buy');
    const isSell = signal.signal.toLowerCase().includes('sell');

    if (!isBuy && !isSell) {
        return { outcome: 'neutral', pips: 0, duration: 0 };
    }

    // Calculate pip value based on pair
    const pipMultiplier = signal.pair?.includes('JPY') ? 0.01 : 0.0001;

    let maxProfit = 0;
    let maxLoss = 0;
    let outcome = 'neutral';
    let exitIndex = 0;

    for (let i = 1; i < priceHistory.length; i++) {
        const currentPrice = priceHistory[i].close;
        const priceDiff = currentPrice - entryPrice;
        const pips = priceDiff / pipMultiplier;

        if (isBuy) {
            if (pips > maxProfit) maxProfit = pips;
            if (pips < maxLoss) maxLoss = pips;

            if (pips >= pipsTarget) {
                outcome = 'profit';
                exitIndex = i;
                break;
            } else if (pips <= -pipsTarget) {
                outcome = 'loss';
                exitIndex = i;
                break;
            }
        } else if (isSell) {
            const invertedPips = -pips;
            if (invertedPips > maxProfit) maxProfit = invertedPips;
            if (invertedPips < maxLoss) maxLoss = invertedPips;

            if (invertedPips >= pipsTarget) {
                outcome = 'profit';
                exitIndex = i;
                break;
            } else if (invertedPips <= -pipsTarget) {
                outcome = 'loss';
                exitIndex = i;
                break;
            }
        }
    }

    return {
        outcome,
        maxProfit: Math.round(maxProfit * 10) / 10,
        maxLoss: Math.round(maxLoss * 10) / 10,
        exitIndex,
        duration: exitIndex > 0 ? exitIndex : priceHistory.length,
        signal: signal.signal,
        confidence: signal.confidence,
    };
};

/**
 * Generate mock historical performance data for demo
 */
export const generateDemoPerformance = () => {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    const trades = [];
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
    const signals = ['Buy', 'Sell', 'Strong Buy', 'Strong Sell'];

    // Generate 20 historical trades over the last week
    for (let i = 0; i < 20; i++) {
        const timestamp = now - (i * 8 * hourMs) - Math.random() * 4 * hourMs;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const signal = signals[Math.floor(Math.random() * signals.length)];
        const confidence = 50 + Math.floor(Math.random() * 40);

        // Higher confidence = higher win probability
        const winProbability = confidence / 100;
        const isWin = Math.random() < winProbability;

        trades.push({
            id: i + 1,
            timestamp: new Date(timestamp).toISOString(),
            pair,
            signal,
            confidence,
            outcome: isWin ? 'profit' : 'loss',
            pips: isWin
                ? Math.round((10 + Math.random() * 30) * 10) / 10
                : -Math.round((5 + Math.random() * 20) * 10) / 10,
            duration: Math.floor(1 + Math.random() * 12), // hours
        });
    }

    return trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Calculate performance statistics
 */
export const calculateStats = (trades) => {
    if (!trades || trades.length === 0) {
        return {
            totalTrades: 0,
            winRate: 0,
            avgPips: 0,
            totalPips: 0,
            bestTrade: null,
            worstTrade: null,
            byHour: {},
            byPair: {},
        };
    }

    const wins = trades.filter(t => t.outcome === 'profit');
    const losses = trades.filter(t => t.outcome === 'loss');
    const totalPips = trades.reduce((sum, t) => sum + t.pips, 0);

    // Best trading hours
    const byHour = {};
    trades.forEach(t => {
        const hour = new Date(t.timestamp).getHours();
        if (!byHour[hour]) {
            byHour[hour] = { wins: 0, losses: 0, pips: 0 };
        }
        if (t.outcome === 'profit') byHour[hour].wins++;
        else byHour[hour].losses++;
        byHour[hour].pips += t.pips;
    });

    // Best pairs
    const byPair = {};
    trades.forEach(t => {
        if (!byPair[t.pair]) {
            byPair[t.pair] = { wins: 0, losses: 0, pips: 0, count: 0 };
        }
        byPair[t.pair].count++;
        if (t.outcome === 'profit') byPair[t.pair].wins++;
        else byPair[t.pair].losses++;
        byPair[t.pair].pips += t.pips;
    });

    // Find best hour
    let bestHour = null;
    let bestHourWinRate = 0;
    Object.entries(byHour).forEach(([hour, data]) => {
        const total = data.wins + data.losses;
        const winRate = total > 0 ? data.wins / total : 0;
        if (winRate > bestHourWinRate && total >= 2) {
            bestHourWinRate = winRate;
            bestHour = parseInt(hour);
        }
    });

    return {
        totalTrades: trades.length,
        wins: wins.length,
        losses: losses.length,
        winRate: Math.round((wins.length / trades.length) * 100),
        avgPips: Math.round((totalPips / trades.length) * 10) / 10,
        totalPips: Math.round(totalPips * 10) / 10,
        bestTrade: trades.reduce((best, t) => !best || t.pips > best.pips ? t : best, null),
        worstTrade: trades.reduce((worst, t) => !worst || t.pips < worst.pips ? t : worst, null),
        bestHour,
        bestHourWinRate: Math.round(bestHourWinRate * 100),
        byHour,
        byPair,
    };
};

/**
 * Get trading recommendations based on performance
 */
export const getRecommendations = (stats) => {
    const recommendations = [];

    if (stats.bestHour !== null) {
        const hourStr = stats.bestHour.toString().padStart(2, '0') + ':00';
        recommendations.push({
            type: 'timing',
            icon: '⏰',
            title: 'Best Trading Time',
            description: `Your best win rate (${stats.bestHourWinRate}%) is around ${hourStr}. Consider focusing your analysis during this window.`,
        });
    }

    if (stats.winRate < 50) {
        recommendations.push({
            type: 'strategy',
            icon: '📊',
            title: 'Improve Win Rate',
            description: 'Your win rate is below 50%. Consider waiting for higher confidence signals (75%+) before entering trades.',
        });
    }

    if (stats.winRate >= 60) {
        recommendations.push({
            type: 'success',
            icon: '🎯',
            title: 'Good Strategy',
            description: `Excellent! Your ${stats.winRate}% win rate shows a solid understanding of the signals. Keep refining your approach.`,
        });
    }

    // Best pair recommendation
    const pairs = Object.entries(stats.byPair || {});
    const bestPair = pairs.reduce((best, [pair, data]) => {
        const winRate = data.count > 0 ? data.wins / data.count : 0;
        if (!best || (winRate > best.winRate && data.count >= 2)) {
            return { pair, winRate, ...data };
        }
        return best;
    }, null);

    if (bestPair && bestPair.winRate > 0.5) {
        recommendations.push({
            type: 'pair',
            icon: '💱',
            title: `Focus on ${bestPair.pair}`,
            description: `You perform best with ${bestPair.pair} (${Math.round(bestPair.winRate * 100)}% win rate). Consider specializing in this pair.`,
        });
    }

    return recommendations;
};

/**
 * Save trade to history
 */
export const saveTrade = (trade) => {
    try {
        const existing = JSON.parse(localStorage.getItem(PERFORMANCE_STORAGE_KEY) || '[]');
        existing.unshift(trade);
        // Keep last 100 trades
        const trimmed = existing.slice(0, 100);
        localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(trimmed));
        return trimmed;
    } catch (e) {
        console.error('Error saving trade:', e);
        return [];
    }
};

/**
 * Get saved trades
 */
export const getSavedTrades = () => {
    try {
        const saved = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        // Return demo data if no saved trades
        return generateDemoPerformance();
    } catch {
        return generateDemoPerformance();
    }
};

/**
 * Clear trade history
 */
export const clearTradeHistory = () => {
    localStorage.removeItem(PERFORMANCE_STORAGE_KEY);
};
