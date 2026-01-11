import { useMarket } from '../context/MarketContext';
import { CURRENCY_PAIRS } from '../utils/constants';
import { formatPrice } from '../utils/formatters';
import TradingChart from '../components/charts/TradingChart';
import SignalCard from '../components/analysis/SignalCard';
import IndicatorPanel from '../components/analysis/IndicatorPanel';
import './Analysis.css';

const Analysis = () => {
    const {
        chartData,
        indicators,
        signal,
        selectedPair,
        setSelectedPair,
        selectedTimeframe,
        setSelectedTimeframe,
        isLoading,
    } = useMarket();

    const supportResistance = indicators?.supportResistance || [];

    return (
        <div className="analysis-page">
            <div className="analysis-page__header">
                <h1 className="analysis-page__title">Technical Analysis</h1>
                <div className="analysis-page__pair-selector">
                    {CURRENCY_PAIRS.slice(0, 6).map(pair => (
                        <button
                            key={pair.symbol}
                            className={`analysis-page__pair-btn ${selectedPair === pair.symbol ? 'analysis-page__pair-btn--active' : ''
                                }`}
                            onClick={() => setSelectedPair(pair.symbol)}
                        >
                            {pair.symbol}
                        </button>
                    ))}
                </div>
            </div>

            <div className="analysis-page__grid">
                <div className="analysis-page__main">
                    {/* Chart */}
                    <TradingChart
                        data={chartData}
                        pair={selectedPair}
                        timeframe={selectedTimeframe}
                        onTimeframeChange={setSelectedTimeframe}
                        indicators={indicators}
                        isLoading={isLoading}
                    />

                    {/* Technical Indicators */}
                    <div className="analysis-page__section">
                        <h2 className="analysis-page__section-title">Technical Indicators</h2>
                        <IndicatorPanel indicators={indicators} signal={signal} />
                    </div>
                </div>

                <div className="analysis-page__sidebar">
                    {/* Signal Card */}
                    <SignalCard signal={signal} pair={selectedPair} />

                    {/* Support/Resistance */}
                    <div className="analysis-page__section">
                        <h2 className="analysis-page__section-title">Support & Resistance</h2>
                        {supportResistance.length > 0 ? (
                            <div className="sr-levels">
                                {supportResistance.map((level, index) => (
                                    <div key={index} className="sr-level">
                                        <span className={`sr-level__type sr-level__type--${level.type}`}>
                                            {level.type}
                                        </span>
                                        <span className="sr-level__price">
                                            {formatPrice(level.price, selectedPair)}
                                        </span>
                                        <div className="sr-level__strength">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`sr-level__dot ${i < level.strength ? 'sr-level__dot--active' : ''
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                Analyzing price levels...
                            </p>
                        )}
                    </div>

                    {/* Trading Tips */}
                    <div className="analysis-page__section">
                        <h2 className="analysis-page__section-title">Trading Tips</h2>
                        <ul style={{
                            listStyle: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <li style={{
                                padding: 'var(--spacing-sm)',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                📊 Always wait for confirmation before entering a trade
                            </li>
                            <li style={{
                                padding: 'var(--spacing-sm)',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                🎯 Never risk more than 1-2% of your account per trade
                            </li>
                            <li style={{
                                padding: 'var(--spacing-sm)',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)'
                            }}>
                                ⏰ Best trading hours: London & NY session overlap
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
