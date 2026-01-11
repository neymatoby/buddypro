import { useState, useEffect } from 'react';
import {
    getActiveSessions,
    getTradingRecommendation,
    getCurrentWindow,
    getCurrentWATHour,
} from '../../services/tradingSessionService';
import './SessionIndicator.css';

const SessionIndicator = () => {
    const [recommendation, setRecommendation] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [currentWindow, setCurrentWindow] = useState(null);
    const [watTime, setWatTime] = useState('');

    useEffect(() => {
        const updateSession = () => {
            setRecommendation(getTradingRecommendation());
            setActiveSessions(getActiveSessions());
            setCurrentWindow(getCurrentWindow());

            const now = new Date();
            const watHour = getCurrentWATHour();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setWatTime(`${watHour.toString().padStart(2, '0')}:${minutes} WAT`);
        };

        updateSession();
        const interval = setInterval(updateSession, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (!recommendation) return null;

    return (
        <div className="session-indicator">
            <div className="session-indicator__header">
                <span className="session-indicator__title">🌍 Trading Session</span>
                <span className="session-indicator__time">{watTime}</span>
            </div>

            {/* Market Status */}
            <div className="session-indicator__status">
                <span className="session-indicator__status-icon">{recommendation.icon}</span>
                <div className="session-indicator__status-content">
                    <div className="session-indicator__status-title">{recommendation.title}</div>
                    <div className="session-indicator__status-message">{recommendation.message}</div>
                </div>
                <div className="session-indicator__quality">
                    {[1, 2, 3, 4].map(star => (
                        <span
                            key={star}
                            className={`session-indicator__star ${star <= recommendation.quality ? 'session-indicator__star--active' : ''}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>

            {/* Active Sessions */}
            {activeSessions.length > 0 && (
                <div className="session-indicator__sessions">
                    {activeSessions.map(session => (
                        <div key={session.key} className="session-indicator__session">
                            <span className="session-indicator__session-dot" />
                            <span>{session.emoji} {session.name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Trading Suggestion */}
            <div className="session-indicator__suggestion">
                💡 {recommendation.suggestedAction}
            </div>

            {/* Best Pairs for Current Window */}
            {currentWindow && currentWindow.bestPairs && (
                <div className="session-indicator__pairs">
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Best pairs:</span>
                    {currentWindow.bestPairs.map(pair => (
                        <span key={pair} className="session-indicator__pair">{pair}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SessionIndicator;
