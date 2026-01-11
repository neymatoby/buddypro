import { useState, useEffect } from 'react';
import {
    getDailyChallenge,
    submitAnswer,
    getChallengeStats,
    getLevelTitle,
    getXPForNextLevel,
} from '../services/challengeService';
import './Challenges.css';

const Challenges = () => {
    const [challenge, setChallenge] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const dailyChallenge = getDailyChallenge();
        setChallenge(dailyChallenge);
        setCurrentIndex(dailyChallenge.answers?.length || 0);
        setStats(getChallengeStats());
    }, []);

    const handleOptionClick = (optionIndex) => {
        if (feedback) return; // Already answered

        const currentQuestion = challenge.questions[currentIndex];
        const result = submitAnswer(currentQuestion.id, optionIndex);

        setSelectedOption(optionIndex);
        setFeedback(result);

        // Refresh challenge and stats
        setChallenge(getDailyChallenge());
        setStats(getChallengeStats());
    };

    const handleNext = () => {
        setSelectedOption(null);
        setFeedback(null);
        setCurrentIndex(prev => prev + 1);
    };

    if (!challenge) {
        return <div className="challenges-page">Loading...</div>;
    }

    const currentQuestion = challenge.questions[currentIndex];
    const isCompleted = challenge.completed;
    const totalXpEarned = challenge.answers?.reduce((sum, a) => sum + a.xpEarned, 0) || 0;

    return (
        <div className="challenges-page">
            <div className="challenges-page__header">
                <h1 className="challenges-page__title">🎯 Daily Challenge</h1>
                <p className="challenges-page__subtitle">
                    Test your trading knowledge and earn XP!
                </p>
            </div>

            {/* XP Progress */}
            {stats && (
                <div className="challenges-page__xp">
                    <div className="challenges-page__xp-header">
                        <div className="challenges-page__level">
                            <div className="challenges-page__level-badge">{stats.level}</div>
                            <div className="challenges-page__level-info">
                                <span className="challenges-page__level-title">{stats.levelTitle}</span>
                                <span className="challenges-page__level-subtitle">Level {stats.level}</span>
                            </div>
                        </div>
                        <div className="challenges-page__xp-total">{stats.totalXP} XP</div>
                    </div>
                    <div className="challenges-page__xp-bar">
                        <div
                            className="challenges-page__xp-fill"
                            style={{ width: `${stats.progressPercent}%` }}
                        />
                    </div>
                    <div className="challenges-page__xp-label">
                        {stats.xpToNextLevel} XP to Level {stats.level + 1}
                    </div>
                </div>
            )}

            {/* Completed State */}
            {isCompleted ? (
                <div className="challenges-page__completed">
                    <div className="challenges-page__completed-icon">🏆</div>
                    <div className="challenges-page__completed-title">Challenge Complete!</div>
                    <div className="challenges-page__completed-score">
                        {challenge.score} / {challenge.questions.length} Correct
                    </div>
                    <div className="challenges-page__completed-xp">
                        +{totalXpEarned} XP earned!
                    </div>
                    <div className="challenges-page__completed-message">
                        Come back tomorrow for a new challenge!
                    </div>
                </div>
            ) : currentQuestion ? (
                /* Quiz Interface */
                <div className="challenges-page__quiz">
                    <div className="challenges-page__quiz-header">
                        <span className="challenges-page__quiz-title">Question {currentIndex + 1}</span>
                        <span className="challenges-page__quiz-progress">
                            {currentIndex + 1} of {challenge.questions.length}
                        </span>
                    </div>

                    <div className="challenges-page__question">
                        <div className="challenges-page__question-category">
                            {currentQuestion.category} • {currentQuestion.difficulty}
                        </div>
                        <div className="challenges-page__question-text">
                            {currentQuestion.question}
                        </div>
                    </div>

                    <div className="challenges-page__options">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = 'challenges-page__option';

                            if (feedback) {
                                if (index === currentQuestion.correct) {
                                    optionClass += ' challenges-page__option--correct';
                                } else if (index === selectedOption && !feedback.isCorrect) {
                                    optionClass += ' challenges-page__option--wrong';
                                }
                                optionClass += ' challenges-page__option--disabled';
                            }

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={!!feedback}
                                >
                                    <span className="challenges-page__option-letter">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className={`challenges-page__feedback challenges-page__feedback--${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                            <div className={`challenges-page__feedback-title challenges-page__feedback-title--${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                                {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                {feedback.xpEarned > 0 && ` +${feedback.xpEarned} XP`}
                            </div>
                            <div className="challenges-page__feedback-text">
                                {feedback.explanation}
                            </div>
                        </div>
                    )}

                    {/* Next Button */}
                    {feedback && currentIndex < challenge.questions.length - 1 && (
                        <button className="challenges-page__next-btn" onClick={handleNext}>
                            Next Question →
                        </button>
                    )}

                    {feedback && currentIndex === challenge.questions.length - 1 && (
                        <button
                            className="challenges-page__next-btn"
                            onClick={() => {
                                setChallenge(getDailyChallenge());
                                setStats(getChallengeStats());
                            }}
                        >
                            See Results
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Challenges;
