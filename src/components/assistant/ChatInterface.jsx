import { useState, useRef, useEffect } from 'react';
import { sendMessage, getSuggestedQuestions } from '../../services/aiService';
import { useMarket } from '../../context/MarketContext';
import { formatTime } from '../../utils/formatters';
import './ChatInterface.css';

const MessageBubble = ({ message }) => (
    <div className={`message-bubble message-bubble--${message.role}`}>
        <div
            className="message-bubble__content"
            dangerouslySetInnerHTML={{
                __html: message.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
            }}
        />
        <span className="message-bubble__time">
            {formatTime(message.timestamp)}
        </span>
    </div>
);

const TypingIndicator = () => (
    <div className="typing-indicator">
        <div className="typing-indicator__dot" />
        <div className="typing-indicator__dot" />
        <div className="typing-indicator__dot" />
    </div>
);

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "👋 Hello! I'm your BuddyPro AI assistant. I can help you understand forex trading, explain technical indicators, and answer your trading questions.\n\nWhat would you like to know?",
            timestamp: new Date().toISOString(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { selectedPair, signal, indicators } = useMarket();
    const suggestedQuestions = getSuggestedQuestions();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Get context for AI
            const context = {
                pair: selectedPair,
                signal,
                indicators: signal?.indicators,
            };

            const response = await sendMessage(input.trim(), context);

            const assistantMessage = {
                role: 'assistant',
                content: response.content,
                timestamp: new Date().toISOString(),
                source: response.source,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (question) => {
        setInput(question);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-interface">
            <div className="chat-interface__header">
                <div className="chat-interface__title">
                    <span className="chat-interface__title-icon">🤖</span>
                    <span>BuddyPro AI Assistant</span>
                </div>
                <div className="chat-interface__status">
                    <span className="chat-interface__status-dot" />
                    <span>Online</span>
                </div>
            </div>

            <div className="chat-interface__messages">
                {messages.map((message, index) => (
                    <MessageBubble key={index} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-interface__suggestions">
                <div className="chat-interface__suggestions-title">Suggested questions:</div>
                <div className="chat-interface__suggestions-list">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                        <button
                            key={index}
                            className="chat-interface__suggestion"
                            onClick={() => handleSuggestionClick(question)}
                        >
                            {question.length > 30 ? question.substring(0, 30) + '...' : question}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chat-interface__input-container">
                <div className="chat-interface__input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-interface__input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about forex trading..."
                        disabled={isTyping}
                    />
                    <button
                        className="chat-interface__send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
