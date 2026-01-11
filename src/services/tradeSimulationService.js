/**
 * Trade Simulation Service
 * Simulates trades with realistic 50-70% win probability
 */

const SIMULATION_STORAGE_KEY = 'buddypro_simulated_trades';

/**
 * Get simulated trades from storage
 */
export const getSimulatedTrades = () => {
    try {
        const stored = localStorage.getItem(SIMULATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * Save simulated trade to storage
 */
const saveSimulatedTrade = (trade) => {
    try {
        const trades = getSimulatedTrades();
        trades.unshift(trade); // Add to beginning
        // Keep only last 50 trades
        const trimmed = trades.slice(0, 50);
        localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Error saving trade:', e);
    }
};

/**
 * Calculate win probability based on signal quality
 * Returns value between 50-70%
 */
export const calculateWinProbability = (signal, indicators) => {
    let baseProbability = 55; // Default

    if (signal?.confidence) {
        // Higher confidence = higher probability
        if (signal.confidence >= 80) baseProbability = 68;
        else if (signal.confidence >= 70) baseProbability = 65;
        else if (signal.confidence >= 60) baseProbability = 60;
        else if (signal.confidence >= 50) baseProbability = 55;
        else baseProbability = 52;
    }

    // Add small random variance (-3 to +3)
    const variance = (Math.random() - 0.5) * 6;
    const finalProbability = Math.min(70, Math.max(50, baseProbability + variance));

    return Math.round(finalProbability);
};

/**
 * Determine if trade is a win based on probability
 */
export const determineOutcome = (probability) => {
    const roll = Math.random() * 100;
    return roll < probability;
};

/**
 * Calculate ATR-based stop loss and take profit
 */
const calculateLevels = (entryPrice, direction, atr, pair) => {
    // Default ATR if not available
    const effectiveAtr = atr || entryPrice * 0.001; // 0.1% of price

    // Stop loss: 1.5x ATR
    const slDistance = effectiveAtr * 1.5;
    // Take profit: 2x ATR (risk-reward 1:1.33)
    const tpDistance = effectiveAtr * 2;

    const isLong = direction === 'BUY';

    return {
        stopLoss: isLong ? entryPrice - slDistance : entryPrice + slDistance,
        takeProfit: isLong ? entryPrice + tpDistance : entryPrice - tpDistance,
        slPips: slDistance,
        tpPips: tpDistance,
    };
};

/**
 * Generate price movement animation data
 */
export const generatePriceMovement = (entryPrice, targetPrice, steps = 20) => {
    const prices = [entryPrice];
    const totalMove = targetPrice - entryPrice;
    const stepSize = totalMove / steps;

    for (let i = 1; i <= steps; i++) {
        // Add some noise to make it look realistic
        const noise = (Math.random() - 0.5) * Math.abs(stepSize) * 0.3;
        const progress = i / steps;
        // Ease-in-out movement
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const price = entryPrice + (totalMove * easeProgress) + noise;
        prices.push(price);
    }

    // Ensure final price hits target
    prices[prices.length - 1] = targetPrice;
    return prices;
};

/**
 * Start a simulated trade
 */
export const startSimulatedTrade = (direction, currentPrice, pair, signal, indicators) => {
    const probability = calculateWinProbability(signal, indicators);
    const isWin = determineOutcome(probability);

    // Get ATR for realistic levels
    const atr = indicators?.atr?.[indicators.atr.length - 1] || currentPrice * 0.001;
    const levels = calculateLevels(currentPrice, direction, atr, pair);

    // Determine exit price based on outcome
    const exitPrice = isWin ? levels.takeProfit : levels.stopLoss;
    const pnlPips = isWin ? levels.tpPips : -levels.slPips;

    // Generate animation frames
    const priceMovement = generatePriceMovement(currentPrice, exitPrice);

    const trade = {
        id: Date.now().toString(),
        pair,
        direction,
        entryPrice: currentPrice,
        exitPrice,
        stopLoss: levels.stopLoss,
        takeProfit: levels.takeProfit,
        probability,
        isWin,
        pnlPips: Math.round(pnlPips * 10000) / 10, // Convert to pips display
        timestamp: new Date().toISOString(),
        priceMovement,
    };

    // Save to history
    saveSimulatedTrade({
        ...trade,
        priceMovement: undefined, // Don't store animation data
    });

    return trade;
};

/**
 * Get simulation statistics
 */
export const getSimulationStats = () => {
    const trades = getSimulatedTrades();

    if (trades.length === 0) {
        return {
            totalTrades: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalPnL: 0,
            streak: 0,
            streakType: null,
        };
    }

    const wins = trades.filter(t => t.isWin).length;
    const losses = trades.length - wins;
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnlPips || 0), 0);

    // Calculate streak
    let streak = 0;
    let streakType = trades[0]?.isWin ? 'win' : 'loss';
    for (const trade of trades) {
        if ((trade.isWin && streakType === 'win') || (!trade.isWin && streakType === 'loss')) {
            streak++;
        } else {
            break;
        }
    }

    return {
        totalTrades: trades.length,
        wins,
        losses,
        winRate: Math.round((wins / trades.length) * 100),
        totalPnL: Math.round(totalPnL * 10) / 10,
        streak,
        streakType,
    };
};

/**
 * Clear simulation history
 */
export const clearSimulationHistory = () => {
    try {
        localStorage.removeItem(SIMULATION_STORAGE_KEY);
    } catch {
        // Ignore
    }
};
