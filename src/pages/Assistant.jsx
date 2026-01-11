import { useState, useEffect } from 'react';
import ChatInterface from '../components/assistant/ChatInterface';
import { getApiKey, setApiKey, hasApiKey } from '../services/aiService';
import './Assistant.css';

const topics = [
    { icon: '📊', label: 'Technical Indicators', query: 'Explain RSI and MACD indicators' },
    { icon: '📈', label: 'Trend Analysis', query: 'How do I identify market trends?' },
    { icon: '💰', label: 'Risk Management', query: 'What are the best risk management practices?' },
    { icon: '🎯', label: 'Entry & Exit', query: 'How do I find good entry and exit points?' },
    { icon: '📐', label: 'Chart Patterns', query: 'Explain common chart patterns' },
    { icon: '🧠', label: 'Trading Psychology', query: 'How to manage emotions while trading?' },
];

const Assistant = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [hasKey, setHasKey] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        setHasKey(hasApiKey());
    }, []);

    const handleSaveApiKey = () => {
        if (apiKeyInput.trim()) {
            setApiKey(apiKeyInput.trim());
            setHasKey(true);
            setApiKeyInput('');
            setSaveMessage('✓ API key saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleClearApiKey = () => {
        setApiKey('');
        setHasKey(false);
        setSaveMessage('API key removed');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    return (
        <div className="assistant-page">
            <div className="assistant-page__main">
                <div className="assistant-page__header">
                    <h1 className="assistant-page__title">AI Trading Assistant</h1>
                    <p className="assistant-page__subtitle">
                        Ask questions about forex trading, technical analysis, and market strategies
                    </p>
                </div>
                <div className="assistant-page__chat">
                    <ChatInterface />
                </div>
            </div>

            <div className="assistant-page__sidebar">
                {/* Quick Topics */}
                <div className="assistant-page__section">
                    <h3 className="assistant-page__section-title">Quick Topics</h3>
                    <div className="assistant-page__topics">
                        {topics.map((topic, index) => (
                            <button key={index} className="assistant-page__topic">
                                <span className="assistant-page__topic-icon">{topic.icon}</span>
                                <span>{topic.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* API Key Settings */}
                <div className="assistant-page__section">
                    <h3 className="assistant-page__section-title">
                        🔑 Gemini API Key
                        {hasKey && <span style={{ color: 'var(--color-bullish)', marginLeft: '8px', fontSize: '0.8em' }}>● Connected</span>}
                    </h3>
                    <div className="assistant-page__api-key">
                        {!hasKey ? (
                            <>
                                <input
                                    type="password"
                                    className="assistant-page__api-input"
                                    placeholder="Enter your API key..."
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
                                />
                                <button
                                    className="assistant-page__api-btn"
                                    onClick={handleSaveApiKey}
                                    disabled={!apiKeyInput.trim()}
                                    style={{
                                        marginTop: '8px',
                                        padding: '8px 16px',
                                        background: 'var(--color-accent)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: apiKeyInput.trim() ? 'pointer' : 'not-allowed',
                                        opacity: apiKeyInput.trim() ? 1 : 0.5,
                                    }}
                                >
                                    Save Key
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>API key configured</span>
                                <button
                                    onClick={handleClearApiKey}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'transparent',
                                        color: 'var(--color-bearish)',
                                        border: '1px solid var(--color-bearish)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em',
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        {saveMessage && (
                            <p style={{
                                marginTop: '8px',
                                fontSize: 'var(--font-size-xs)',
                                color: saveMessage.includes('✓') ? 'var(--color-bullish)' : 'var(--color-text-secondary)'
                            }}>
                                {saveMessage}
                            </p>
                        )}
                        <p className="assistant-page__api-note">
                            Optional: Add a Gemini API key for enhanced AI responses.
                            Get one free at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="assistant-page__section" style={{ background: 'var(--color-neutral-bg)' }}>
                    <h3 className="assistant-page__section-title">⚠️ Disclaimer</h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        This AI assistant provides educational information only and should not be considered financial advice.
                        Trading forex involves significant risk of loss. Always do your own research and consider consulting
                        a financial advisor.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
