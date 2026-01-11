import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { CURRENCY_PAIRS } from '../utils/constants';
import { getRelativeTime } from '../utils/formatters';
import TradingChart from '../components/charts/TradingChart';
import PriceCard from '../components/charts/PriceCard';
import SignalCard from '../components/analysis/SignalCard';
import SessionIndicator from '../components/analysis/SessionIndicator';
import TradeSetupCard from '../components/analysis/TradeSetupCard';
import './Dashboard.css';

const Dashboard = () => {
    const {
        rates,
        chartData,
        indicators,
        signal,
        selectedPair,
        setSelectedPair,
        selectedTimeframe,
        setSelectedTimeframe,
        isLoading,
        lastUpdate,
        refreshRates,
        watchlist,
    } = useMarket();

    const displayedPairs = CURRENCY_PAIRS.filter(p => watchlist.includes(p.symbol)).slice(0, 6);

    // If watchlist is empty, show first 6 pairs
    const pairsToShow = displayedPairs.length > 0 ? displayedPairs : CURRENCY_PAIRS.slice(0, 6);

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Market Dashboard</h1>
                    <p className="dashboard__subtitle">
                        Real-time forex analysis with AI-powered insights
                    </p>
                </div>
                <div className="dashboard__last-update">
                    {lastUpdate && (
                        <>
                            <span>Updated {getRelativeTime(lastUpdate.toISOString())}</span>
                            <button className="dashboard__refresh-btn" onClick={refreshRates}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="dashboard__stats">
                <div className="dashboard__stat">
                    <div className="dashboard__stat-value">{watchlist.length}</div>
                    <div className="dashboard__stat-label">Watchlist</div>
                </div>
                <div className="dashboard__stat">
                    <div className="dashboard__stat-value" style={{ color: 'var(--color-accent)' }}>
                        {signal?.confidence || 0}%
                    </div>
                    <div className="dashboard__stat-label">Signal Confidence</div>
                </div>
                <div className="dashboard__stat">
                    <div className="dashboard__stat-value" style={{
                        color: signal?.signal?.label?.includes('Buy') ? 'var(--color-bullish)' :
                            signal?.signal?.label?.includes('Sell') ? 'var(--color-bearish)' :
                                'var(--color-neutral)'
                    }}>
                        {signal?.signal?.label || 'Loading...'}
                    </div>
                    <div className="dashboard__stat-label">Current Signal</div>
                </div>
                <div className="dashboard__stat">
                    <div className="dashboard__stat-value">{selectedTimeframe}</div>
                    <div className="dashboard__stat-label">Timeframe</div>
                </div>
            </div>

            <div className="dashboard__grid">
                <div className="dashboard__main">
                    {/* Chart Section */}
                    <section>
                        <div className="dashboard__section-header">
                            <h2 className="dashboard__section-title">{selectedPair} Chart</h2>
                            <Link to="/analysis" className="dashboard__section-link">
                                Full Analysis →
                            </Link>
                        </div>
                        <TradingChart
                            data={chartData}
                            pair={selectedPair}
                            timeframe={selectedTimeframe}
                            onTimeframeChange={setSelectedTimeframe}
                            indicators={indicators}
                            isLoading={isLoading}
                            showTradeLines={true}
                            signal={signal}
                        />
                    </section>

                    {/* Currency Pairs */}
                    <section>
                        <div className="dashboard__section-header">
                            <h2 className="dashboard__section-title">Currency Pairs</h2>
                            <Link to="/watchlist" className="dashboard__section-link">
                                Manage Watchlist →
                            </Link>
                        </div>
                        <div className="dashboard__market-grid">
                            {pairsToShow.map(pair => {
                                const rate = rates[pair.symbol];
                                return (
                                    <PriceCard
                                        key={pair.symbol}
                                        pair={pair.symbol}
                                        price={rate?.price}
                                        change={rate?.change}
                                        changePercent={rate?.changePercent}
                                        isSelected={selectedPair === pair.symbol}
                                        onClick={() => setSelectedPair(pair.symbol)}
                                    />
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="dashboard__sidebar">
                    {/* Session Indicator - West Africa Focus */}
                    <SessionIndicator />

                    {/* Trade Setup Card */}
                    <TradeSetupCard />

                    {/* Signal Card */}
                    <SignalCard signal={signal} pair={selectedPair} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
