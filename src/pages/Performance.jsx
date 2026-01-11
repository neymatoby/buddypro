import { useState, useEffect } from 'react';
import { getSavedTrades, calculateStats, getRecommendations } from '../services/performanceService';
import { getRelativeTime } from '../utils/formatters';
import './Performance.css';

const Performance = () => {
    const [trades, setTrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const savedTrades = getSavedTrades();
        setTrades(savedTrades);

        const calculatedStats = calculateStats(savedTrades);
        setStats(calculatedStats);

        const recs = getRecommendations(calculatedStats);
        setRecommendations(recs);
    }, []);

    return (
        <div className="performance-page">
            <div className="performance-page__header">
                <div>
                    <h1 className="performance-page__title">📊 Trade Performance</h1>
                    <p className="performance-page__subtitle">
                        Analyze your trading history and discover patterns
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="performance-page__stats">
                    <div className="performance-page__stat">
                        <div className="performance-page__stat-value">{stats.totalTrades}</div>
                        <div className="performance-page__stat-label">Total Signals</div>
                    </div>
                    <div className="performance-page__stat">
                        <div className={`performance-page__stat-value ${stats.winRate >= 50 ? 'performance-page__stat-value--positive' : 'performance-page__stat-value--negative'}`}>
                            {stats.winRate}%
                        </div>
                        <div className="performance-page__stat-label">Win Rate</div>
                    </div>
                    <div className="performance-page__stat">
                        <div className={`performance-page__stat-value ${stats.totalPips >= 0 ? 'performance-page__stat-value--positive' : 'performance-page__stat-value--negative'}`}>
                            {stats.totalPips >= 0 ? '+' : ''}{stats.totalPips}
                        </div>
                        <div className="performance-page__stat-label">Total Pips</div>
                    </div>
                    <div className="performance-page__stat">
                        <div className={`performance-page__stat-value ${stats.avgPips >= 0 ? 'performance-page__stat-value--positive' : 'performance-page__stat-value--negative'}`}>
                            {stats.avgPips >= 0 ? '+' : ''}{stats.avgPips}
                        </div>
                        <div className="performance-page__stat-label">Avg Pips/Trade</div>
                    </div>
                    <div className="performance-page__stat">
                        <div className="performance-page__stat-value performance-page__stat-value--positive">
                            {stats.wins}
                        </div>
                        <div className="performance-page__stat-label">Wins</div>
                    </div>
                    <div className="performance-page__stat">
                        <div className="performance-page__stat-value performance-page__stat-value--negative">
                            {stats.losses}
                        </div>
                        <div className="performance-page__stat-label">Losses</div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <>
                    <h2 className="performance-page__section-title">💡 Recommendations</h2>
                    <div className="performance-page__recommendations">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="performance-page__recommendation">
                                <span className="performance-page__recommendation-icon">{rec.icon}</span>
                                <div className="performance-page__recommendation-content">
                                    <div className="performance-page__recommendation-title">{rec.title}</div>
                                    <div className="performance-page__recommendation-desc">{rec.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Trade History */}
            <div className="performance-page__history">
                <div className="performance-page__history-header">
                    <h2 className="performance-page__history-title">Signal History</h2>
                </div>
                <div className="performance-page__history-list">
                    {trades.map((trade) => (
                        <div key={trade.id} className="performance-page__trade">
                            <div className="performance-page__trade-left">
                                <div className={`performance-page__trade-icon performance-page__trade-icon--${trade.outcome}`}>
                                    {trade.outcome === 'profit' ? '✓' : '✗'}
                                </div>
                                <div className="performance-page__trade-info">
                                    <span className="performance-page__trade-pair">{trade.pair}</span>
                                    <span className="performance-page__trade-signal">
                                        {trade.signal} • {trade.confidence}% confidence
                                    </span>
                                </div>
                            </div>
                            <div className="performance-page__trade-right">
                                <div className={`performance-page__trade-pips ${trade.pips >= 0 ? 'performance-page__trade-pips--positive' : 'performance-page__trade-pips--negative'}`}>
                                    {trade.pips >= 0 ? '+' : ''}{trade.pips} pips
                                </div>
                                <div className="performance-page__trade-time">
                                    {getRelativeTime(trade.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Performance;
