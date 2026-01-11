import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getRelativeTime } from '../utils/formatters';
import './History.css';

const History = () => {
    const [activeTab, setActiveTab] = useState('signals');
    const [signalHistory, setSignalHistory] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        // Load history from localStorage
        const signals = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGNALS) || '[]');
        const searches = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');

        // Generate demo data if empty
        if (signals.length === 0) {
            const demoSignals = [
                {
                    id: 1,
                    pair: 'EUR/USD',
                    signal: 'Buy',
                    confidence: 72,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    price: 1.0856,
                },
                {
                    id: 2,
                    pair: 'GBP/USD',
                    signal: 'Strong Sell',
                    confidence: 85,
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    price: 1.2642,
                },
                {
                    id: 3,
                    pair: 'USD/JPY',
                    signal: 'Neutral',
                    confidence: 45,
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    price: 148.32,
                },
                {
                    id: 4,
                    pair: 'EUR/USD',
                    signal: 'Buy',
                    confidence: 68,
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    price: 1.0821,
                },
            ];
            setSignalHistory(demoSignals);
        } else {
            setSignalHistory(signals);
        }

        if (searches.length === 0) {
            const demoSearches = [
                { id: 1, query: 'What is RSI?', timestamp: new Date(Date.now() - 1800000).toISOString() },
                { id: 2, query: 'How to trade MACD crossovers', timestamp: new Date(Date.now() - 5400000).toISOString() },
                { id: 3, query: 'Best time to trade EUR/USD', timestamp: new Date(Date.now() - 86400000).toISOString() },
            ];
            setSearchHistory(demoSearches);
        } else {
            setSearchHistory(searches);
        }
    }, []);

    const clearHistory = () => {
        if (activeTab === 'signals') {
            localStorage.removeItem(STORAGE_KEYS.SIGNALS);
            setSignalHistory([]);
        } else {
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            setSearchHistory([]);
        }
    };

    const getSignalBadgeClass = (signal) => {
        if (signal.toLowerCase().includes('buy')) return 'history-page__item-badge--buy';
        if (signal.toLowerCase().includes('sell')) return 'history-page__item-badge--sell';
        return 'history-page__item-badge--neutral';
    };

    const getSignalIconClass = (signal) => {
        if (signal.toLowerCase().includes('buy')) return 'history-page__item-icon--bullish';
        if (signal.toLowerCase().includes('sell')) return 'history-page__item-icon--bearish';
        return '';
    };

    return (
        <div className="history-page">
            <div className="history-page__header">
                <h1 className="history-page__title">History</h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div className="history-page__tabs">
                        <button
                            className={`history-page__tab ${activeTab === 'signals' ? 'history-page__tab--active' : ''}`}
                            onClick={() => setActiveTab('signals')}
                        >
                            📊 Signals
                        </button>
                        <button
                            className={`history-page__tab ${activeTab === 'searches' ? 'history-page__tab--active' : ''}`}
                            onClick={() => setActiveTab('searches')}
                        >
                            🔍 Searches
                        </button>
                    </div>
                    <button className="history-page__clear-btn" onClick={clearHistory}>
                        Clear
                    </button>
                </div>
            </div>

            {activeTab === 'signals' ? (
                signalHistory.length > 0 ? (
                    <div className="history-page__list">
                        {signalHistory.map((item) => (
                            <div key={item.id} className="history-page__item">
                                <div className="history-page__item-left">
                                    <div className={`history-page__item-icon ${getSignalIconClass(item.signal)}`}>
                                        {item.signal.toLowerCase().includes('buy') ? '📈' :
                                            item.signal.toLowerCase().includes('sell') ? '📉' : '➖'}
                                    </div>
                                    <div className="history-page__item-info">
                                        <span className="history-page__item-title">{item.pair}</span>
                                        <span className="history-page__item-desc">
                                            Price: {item.price} • Confidence: {item.confidence}%
                                        </span>
                                    </div>
                                </div>
                                <div className="history-page__item-right">
                                    <span className="history-page__item-time">
                                        {getRelativeTime(item.timestamp)}
                                    </span>
                                    <span className={`history-page__item-badge ${getSignalBadgeClass(item.signal)}`}>
                                        {item.signal}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="history-page__empty">
                        <div className="history-page__empty-icon">📊</div>
                        <p className="history-page__empty-text">No signal history yet</p>
                    </div>
                )
            ) : (
                searchHistory.length > 0 ? (
                    <div className="history-page__list">
                        {searchHistory.map((item) => (
                            <div key={item.id} className="history-page__item">
                                <div className="history-page__item-left">
                                    <div className="history-page__item-icon">🔍</div>
                                    <div className="history-page__item-info">
                                        <span className="history-page__item-title">{item.query}</span>
                                    </div>
                                </div>
                                <div className="history-page__item-right">
                                    <span className="history-page__item-time">
                                        {getRelativeTime(item.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="history-page__empty">
                        <div className="history-page__empty-icon">🔍</div>
                        <p className="history-page__empty-text">No search history yet</p>
                    </div>
                )
            )}
        </div>
    );
};

export default History;
