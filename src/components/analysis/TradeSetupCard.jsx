import { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { generateTradeSetup, getTradeQuality } from '../../services/tradeSetupService';
import { formatPrice } from '../../utils/formatters';
import './TradeSetupCard.css';

const TradeSetupCard = () => {
    const { chartData, indicators, signal, selectedPair } = useMarket();

    const setup = useMemo(() => {
        return generateTradeSetup(chartData, indicators, signal);
    }, [chartData, indicators, signal]);

    if (!setup) {
        return (
            <div className="trade-setup">
                <div className="trade-setup__header">
                    <span className="trade-setup__title">📊 Trade Setup</span>
                </div>
                <div className="trade-setup__empty">
                    <div className="trade-setup__empty-icon">⏳</div>
                    <div className="trade-setup__empty-text">Loading analysis...</div>
                </div>
            </div>
        );
    }

    if (!setup.active) {
        return (
            <div className="trade-setup">
                <div className="trade-setup__header">
                    <span className="trade-setup__title">📊 Trade Setup</span>
                </div>
                <div className="trade-setup__empty">
                    <div className="trade-setup__empty-icon">⚖️</div>
                    <div className="trade-setup__empty-text">{setup.message}</div>
                    <div className="trade-setup__empty-suggestion">{setup.suggestion}</div>
                </div>
            </div>
        );
    }

    const quality = getTradeQuality(setup.probability);
    const circumference = 2 * Math.PI * 28;
    const strokeDashoffset = circumference - (setup.probability / 100) * circumference;
    const isLong = setup.direction === 'LONG';

    return (
        <div className="trade-setup">
            <div className="trade-setup__header">
                <span className="trade-setup__title">📊 Trade Setup</span>
                <span className={`trade-setup__badge trade-setup__badge--${isLong ? 'long' : 'short'}`}>
                    {isLong ? '📈 LONG' : '📉 SHORT'}
                </span>
            </div>

            {/* Probability Ring */}
            <div className="trade-setup__probability">
                <div className="trade-setup__probability-ring">
                    <svg className="trade-setup__probability-svg" width="70" height="70" viewBox="0 0 70 70">
                        <circle
                            className="trade-setup__probability-bg"
                            cx="35"
                            cy="35"
                            r="28"
                        />
                        <circle
                            className="trade-setup__probability-fill"
                            cx="35"
                            cy="35"
                            r="28"
                            style={{
                                stroke: quality.color,
                                strokeDasharray: circumference,
                                strokeDashoffset,
                            }}
                        />
                    </svg>
                    <span className="trade-setup__probability-text">{setup.probability}%</span>
                </div>
                <div className="trade-setup__probability-info">
                    <div className="trade-setup__probability-label">Success Probability</div>
                    <div className="trade-setup__quality">
                        <span
                            className="trade-setup__quality-badge"
                            style={{ background: quality.color, color: 'white' }}
                        >
                            {quality.rating}
                        </span>
                        <span className="trade-setup__quality-label">{quality.label}</span>
                    </div>
                </div>
            </div>

            {/* Entry/Stop/Target Levels */}
            <div className="trade-setup__levels">
                <div className="trade-setup__level">
                    <div className="trade-setup__level-label">Entry Price</div>
                    <div className="trade-setup__level-value trade-setup__level-value--entry">
                        {formatPrice(setup.entry, selectedPair)}
                    </div>
                </div>
                <div className="trade-setup__level">
                    <div className="trade-setup__level-label">Stop Loss</div>
                    <div className="trade-setup__level-value trade-setup__level-value--stop">
                        {formatPrice(setup.stopLoss, selectedPair)}
                    </div>
                </div>
                <div className="trade-setup__level">
                    <div className="trade-setup__level-label">Take Profit</div>
                    <div className="trade-setup__level-value trade-setup__level-value--target">
                        {formatPrice(setup.takeProfit, selectedPair)}
                    </div>
                </div>
            </div>

            {/* Risk/Reward Ratio */}
            <div className="trade-setup__rr">
                <span>Risk/Reward:</span>
                <span className="trade-setup__rr-value">1:{setup.riskReward}</span>
            </div>

            {/* Reasons */}
            {setup.reasons && setup.reasons.length > 0 && (
                <div className="trade-setup__reasons">
                    {setup.reasons.slice(0, 3).map((reason, i) => (
                        <div key={i} className="trade-setup__reason">
                            <span className="trade-setup__reason-icon">•</span>
                            <span>{reason}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Warning */}
            <div className="trade-setup__warning">
                ⚠️ For educational purposes only. Always use proper risk management.
            </div>
        </div>
    );
};

export default TradeSetupCard;
