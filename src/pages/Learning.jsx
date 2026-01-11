import { useState, useEffect } from 'react';
import {
    getTodayPrompt,
    getTodayTip,
    saveJournalEntry,
    getJournalEntries,
    getTodayEntry,
    getStreakData,
    getMotivationalMessage,
} from '../services/learningService';
import { formatDate } from '../utils/formatters';
import './Learning.css';

const Learning = () => {
    const [journalText, setJournalText] = useState('');
    const [todayEntry, setTodayEntry] = useState(null);
    const [entries, setEntries] = useState([]);
    const [streakData, setStreakData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const todayPrompt = getTodayPrompt();
    const todayTip = getTodayTip();

    useEffect(() => {
        setTodayEntry(getTodayEntry());
        setEntries(getJournalEntries());
        setStreakData(getStreakData());
    }, []);

    const handleSubmit = () => {
        if (!journalText.trim()) return;

        setIsSubmitting(true);

        const entry = saveJournalEntry(journalText);
        if (entry) {
            setTodayEntry(entry);
            setEntries(getJournalEntries());
            setStreakData(getStreakData());
            setJournalText('');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="learning-page">
            <div className="learning-page__header">
                <h1 className="learning-page__title">📝 Learning Journal</h1>
                <p className="learning-page__subtitle">
                    Reflect on your trading journey every day
                </p>
            </div>

            {/* Streak Display */}
            {streakData && (
                <div className="learning-page__streak">
                    <div className="learning-page__streak-item">
                        <div className="learning-page__streak-value">🔥 {streakData.currentStreak}</div>
                        <div className="learning-page__streak-label">Day Streak</div>
                    </div>
                    <div className="learning-page__streak-item">
                        <div className="learning-page__streak-value">🏆 {streakData.longestStreak}</div>
                        <div className="learning-page__streak-label">Best Streak</div>
                    </div>
                    <div className="learning-page__streak-item">
                        <div className="learning-page__streak-value">📚 {streakData.totalEntries}</div>
                        <div className="learning-page__streak-label">Total Entries</div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            {streakData && (
                <p className="learning-page__streak-message">
                    {getMotivationalMessage(streakData.currentStreak)}
                </p>
            )}

            {/* Today's Prompt or Completed State */}
            {todayEntry ? (
                <div className="learning-page__completed">
                    <div className="learning-page__completed-icon">✅</div>
                    <div className="learning-page__completed-text">
                        You've completed today's reflection!
                    </div>
                </div>
            ) : (
                <div className="learning-page__prompt">
                    <div className="learning-page__prompt-label">Today's Reflection</div>
                    <div className="learning-page__prompt-text">{todayPrompt}</div>
                    <textarea
                        className="learning-page__textarea"
                        placeholder="Write your thoughts here..."
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                    />
                    <div className="learning-page__prompt-actions">
                        <button
                            className="learning-page__submit-btn"
                            onClick={handleSubmit}
                            disabled={!journalText.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>
            )}

            {/* Today's Trading Tip */}
            <div className="learning-page__tip">
                <div className="learning-page__tip-category">💡 {todayTip.category}</div>
                <div className="learning-page__tip-text">{todayTip.tip}</div>
                <div className="learning-page__tip-explanation">{todayTip.explanation}</div>
            </div>

            {/* Journal History */}
            {entries.length > 0 && (
                <div className="learning-page__history">
                    <div className="learning-page__history-header">
                        <h2 className="learning-page__history-title">Past Entries</h2>
                    </div>
                    <div className="learning-page__history-list">
                        {entries.slice(0, 10).map((entry) => (
                            <div key={entry.id} className="learning-page__entry">
                                <div className="learning-page__entry-date">
                                    {formatDate(entry.date)}
                                </div>
                                <div className="learning-page__entry-prompt">
                                    "{entry.prompt}"
                                </div>
                                <div className="learning-page__entry-content">
                                    {entry.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Learning;
