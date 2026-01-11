import { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
    startSimulatedTrade,
    getSimulationStats,
    calculateWinProbability,
} from '../../services/tradeSimulationService';
import { formatPrice } from '../../utils/formatters';
import './TradingSimulator.css';

const TradingSimulator = () => {
    const { selectedPair, chartData, signal, indicators } = useMarket();
    const [activeTrade, setActiveTrade] = useState(null);
    const [animationPrice, setAnimationPrice] = useState(null);
    const [stats, setStats] = useState(getSimulationStats());
    const [isAnimating, setIsAnimating] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const animationRef = useRef(null);

    const currentPrice = chartData?.[chartData.length - 1]?.close || 0;
    const probability = calculateWinProbability(signal, indicators);

    // Update stats when trade completes
    useEffect(() => {
        if (!isAnimating && !activeTrade) {
            setStats(getSimulationStats());
        }
    }, [isAnimating, activeTrade]);

    const handleTakeTrade = (direction) => {
        if (isAnimating || !currentPrice) return;

        // Start the trade
        const trade = startSimulatedTrade(
            direction,
            currentPrice,
            selectedPair,
            signal,
            indicators
        );

        setActiveTrade(trade);
        setIsAnimating(true);
        setShowResult(false);

        // Animate price movement
        let step = 0;
        const animate = () => {
            if (step < trade.priceMovement.length) {
                setAnimationPrice(trade.priceMovement[step]);
                step++;
                animationRef.current = setTimeout(animate, 250); // 250ms per step
            } else {
                // Animation complete
                setIsAnimating(false);
                setShowResult(true);
                setTimeout(() => {
                    setShowResult(false);
                    setActiveTrade(null);
                    setAnimationPrice(null);
                    setStats(getSimulationStats());
                }, 3000); // Show result for 3 seconds
            }
        };

        animate();
    };

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, []);

    const displayPrice = animationPrice || currentPrice;
    const pnlDisplay = activeTrade && animationPrice
        ? (animationPrice - activeTrade.entryPrice) * (activeTrade.direction === 'BUY' ? 1 : -1)
        : 0;

    return (
        <div className="trading-simulator">
            <div className="trading-simulator__header">
                <h3 className="trading-simulator__title">🎯 Quick Trade</h3>
                <span className="trading-simulator__prob">{probability}% win</span>
            </div>

            {/* Trade Buttons */}
            {!activeTrade && (
                <div className="trading-simulator__actions">
                    <button
                        className="trading-simulator__btn trading-simulator__btn--buy"
                        onClick={() => handleTakeTrade('BUY')}
                        disabled={isAnimating || !currentPrice}
                    >
                        <span className="trading-simulator__btn-icon">📈</span>
                        <span className="trading-simulator__btn-label">BUY</span>
                    </button>
                    <button
                        className="trading-simulator__btn trading-simulator__btn--sell"
                        onClick={() => handleTakeTrade('SELL')}
                        disabled={isAnimating || !currentPrice}
                    >
                        <span className="trading-simulator__btn-icon">📉</span>
                        <span className="trading-simulator__btn-label">SELL</span>
                    </button>
                </div>
            )}

            {/* Active Trade Display */}
            {activeTrade && (
                <div className={`trading-simulator__trade trading-simulator__trade--${activeTrade.direction.toLowerCase()}`}>
                    <div className="trading-simulator__trade-header">
                        <span className="trading-simulator__direction">
                            {activeTrade.direction === 'BUY' ? '📈 LONG' : '📉 SHORT'}
                        </span>
                        {isAnimating && <span className="trading-simulator__status">Trading...</span>}
                    </div>

                    <div className="trading-simulator__prices">
                        <div className="trading-simulator__price-row">
                            <span>Entry:</span>
                            <span>{formatPrice(activeTrade.entryPrice, selectedPair)}</span>
                        </div>
                        <div className="trading-simulator__price-row">
                            <span>Current:</span>
                            <span className="trading-simulator__current-price">
                                {formatPrice(displayPrice, selectedPair)}
                            </span>
                        </div>
                        <div className="trading-simulator__price-row">
                            <span>TP:</span>
                            <span className="trading-simulator__tp">{formatPrice(activeTrade.takeProfit, selectedPair)}</span>
                        </div>
                        <div className="trading-simulator__price-row">
                            <span>SL:</span>
                            <span className="trading-simulator__sl">{formatPrice(activeTrade.stopLoss, selectedPair)}</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {isAnimating && (
                        <div className="trading-simulator__progress">
                            <div className="trading-simulator__progress-bar" />
                        </div>
                    )}

                    {/* Result */}
                    {showResult && (
                        <div className={`trading-simulator__result trading-simulator__result--${activeTrade.isWin ? 'win' : 'loss'}`}>
                            <span className="trading-simulator__result-icon">
                                {activeTrade.isWin ? '✅' : '❌'}
                            </span>
                            <span className="trading-simulator__result-text">
                                {activeTrade.isWin ? 'WIN' : 'LOSS'}
                            </span>
                            <span className="trading-simulator__result-pips">
                                {activeTrade.isWin ? '+' : ''}{activeTrade.pnlPips.toFixed(1)} pips
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="trading-simulator__stats">
                <div className="trading-simulator__stat">
                    <span className="trading-simulator__stat-value">{stats.totalTrades}</span>
                    <span className="trading-simulator__stat-label">Trades</span>
                </div>
                <div className="trading-simulator__stat">
                    <span className="trading-simulator__stat-value" style={{ color: 'var(--color-bullish)' }}>
                        {stats.winRate}%
                    </span>
                    <span className="trading-simulator__stat-label">Win Rate</span>
                </div>
                <div className="trading-simulator__stat">
                    <span
                        className="trading-simulator__stat-value"
                        style={{ color: stats.totalPnL >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}
                    >
                        {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL}
                    </span>
                    <span className="trading-simulator__stat-label">Pips</span>
                </div>
            </div>
        </div>
    );
};

export default TradingSimulator;
