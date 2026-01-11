import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

const { GEMINI } = API_CONFIG;

// API Key management
const API_KEY_STORAGE = 'forexpro_gemini_key';

export const getApiKey = () => {
    try {
        return localStorage.getItem(API_KEY_STORAGE) || GEMINI.API_KEY || '';
    } catch {
        return GEMINI.API_KEY || '';
    }
};

export const setApiKey = (key) => {
    try {
        if (key) {
            localStorage.setItem(API_KEY_STORAGE, key);
        } else {
            localStorage.removeItem(API_KEY_STORAGE);
        }
        return true;
    } catch {
        return false;
    }
};

export const hasApiKey = () => {
    return !!getApiKey();
};

// Pre-built forex knowledge base for offline responses
const FOREX_KNOWLEDGE = {
    basics: {
        'what is forex': 'Forex (FX) is the global marketplace for trading national currencies. It\'s the largest financial market in the world with over $6 trillion daily volume. Trading happens 24/5 across major financial centers.',
        'what is a pip': 'A pip (Percentage in Point) is the smallest price move in forex. For most pairs, 1 pip = 0.0001. For JPY pairs, 1 pip = 0.01. Example: EUR/USD moving from 1.0850 to 1.0851 is a 1 pip move.',
        'what is leverage': 'Leverage allows you to control larger positions with less capital. 1:100 leverage means $1,000 controls $100,000. While it amplifies profits, it also amplifies losses. Always use proper risk management.',
        'what is a lot': 'A standard lot = 100,000 units of base currency. Mini lot = 10,000 units. Micro lot = 1,000 units. Most retail traders use mini or micro lots to manage risk.',
        'what are major pairs': 'Major pairs include EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD, and NZD/USD. They have the highest liquidity and tightest spreads.',
    },
    indicators: {
        'what is rsi': 'RSI (Relative Strength Index) measures momentum on a 0-100 scale. Above 70 = overbought (potential sell), Below 30 = oversold (potential buy). Created by J. Welles Wilder, it\'s one of the most popular indicators.',
        'what is macd': 'MACD (Moving Average Convergence Divergence) shows trend direction and momentum. A bullish signal occurs when MACD crosses above the signal line. Bearish when it crosses below.',
        'what is ema': 'EMA (Exponential Moving Average) gives more weight to recent prices than SMA. Common periods: 9 (short-term), 21 (medium), 50 (intermediate), 200 (long-term trend).',
        'what are bollinger bands': 'Bollinger Bands show volatility using a middle SMA and upper/lower bands at 2 standard deviations. Price near upper band may indicate overbought, near lower band may indicate oversold.',
        'what is support resistance': 'Support is a price level where demand is strong enough to prevent further decline. Resistance is where selling pressure prevents further rise. These levels often become trading targets.',
    },
    strategies: {
        'trend following': 'Trend following involves trading in the direction of the prevailing trend. Key rules: "The trend is your friend", use moving averages to identify trend, wait for pullbacks to enter.',
        'breakout trading': 'Breakout trading involves entering when price breaks through support/resistance levels with increased volume. Confirm breakouts with indicators and use stop losses below the breakout level.',
        'risk management': 'Golden rules: 1) Never risk more than 1-2% per trade, 2) Always use stop losses, 3) Maintain a positive risk-reward ratio (at least 1:2), 4) Don\'t overtrade, 5) Never revenge trade.',
        'position sizing': 'Calculate position size: Risk Amount = Account × Risk % (e.g., 1%). Position Size = Risk Amount / (Entry - Stop Loss in pips × pip value). This ensures consistent risk per trade.',
    },
    patterns: {
        'head and shoulders': 'Head and Shoulders is a reversal pattern with three peaks - the middle (head) higher than the two shoulders. A break below the neckline signals a bearish reversal. Inverse H&S signals bullish reversal.',
        'double top': 'Double Top forms when price reaches the same high twice with a moderate decline between. A break below the support level confirms the pattern. Target = pattern height projected down.',
        'double bottom': 'Double Bottom is the inverse of Double Top - two lows at similar levels. A break above resistance confirms bullish reversal. It\'s often called a "W" pattern.',
        'triangle patterns': 'Triangles show consolidation. Ascending (higher lows, flat top) = bullish. Descending (lower highs, flat bottom) = bearish. Symmetrical = continuation in prior trend direction.',
    },
};

// Format response with markdown
const formatResponse = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '**$1**')
        .replace(/\n/g, '\n\n');
};

// Search knowledge base
const searchKnowledge = (query) => {
    const normalizedQuery = query.toLowerCase().trim();

    // Direct matches
    for (const category of Object.values(FOREX_KNOWLEDGE)) {
        for (const [key, value] of Object.entries(category)) {
            if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
                return value;
            }
        }
    }

    // Keyword matches
    const keywords = {
        rsi: FOREX_KNOWLEDGE.indicators['what is rsi'],
        macd: FOREX_KNOWLEDGE.indicators['what is macd'],
        ema: FOREX_KNOWLEDGE.indicators['what is ema'],
        moving: FOREX_KNOWLEDGE.indicators['what is ema'],
        bollinger: FOREX_KNOWLEDGE.indicators['what are bollinger bands'],
        support: FOREX_KNOWLEDGE.indicators['what is support resistance'],
        resistance: FOREX_KNOWLEDGE.indicators['what is support resistance'],
        pip: FOREX_KNOWLEDGE.basics['what is a pip'],
        lot: FOREX_KNOWLEDGE.basics['what is a lot'],
        leverage: FOREX_KNOWLEDGE.basics['what is leverage'],
        major: FOREX_KNOWLEDGE.basics['what are major pairs'],
        trend: FOREX_KNOWLEDGE.strategies['trend following'],
        breakout: FOREX_KNOWLEDGE.strategies['breakout trading'],
        risk: FOREX_KNOWLEDGE.strategies['risk management'],
        position: FOREX_KNOWLEDGE.strategies['position sizing'],
        head: FOREX_KNOWLEDGE.patterns['head and shoulders'],
        shoulder: FOREX_KNOWLEDGE.patterns['head and shoulders'],
        double: normalizedQuery.includes('top')
            ? FOREX_KNOWLEDGE.patterns['double top']
            : FOREX_KNOWLEDGE.patterns['double bottom'],
        triangle: FOREX_KNOWLEDGE.patterns['triangle patterns'],
    };

    for (const [keyword, response] of Object.entries(keywords)) {
        if (normalizedQuery.includes(keyword)) {
            return response;
        }
    }

    return null;
};

// Generate contextualized response
const generateContextResponse = (query, marketContext = {}) => {
    const { pair, price, signal, indicators } = marketContext;

    if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('analysis')) {
        if (pair && indicators) {
            let response = `**${pair} Analysis**\n\n`;

            if (indicators.rsi) {
                const rsiStatus = indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral';
                response += `📊 **RSI (${indicators.rsi.toFixed(1)})**: ${rsiStatus}\n`;
            }

            if (indicators.macd) {
                const macdTrend = indicators.macd.line > indicators.macd.signal ? 'bullish' : 'bearish';
                response += `📈 **MACD**: ${macdTrend} momentum\n`;
            }

            if (signal) {
                response += `\n🎯 **Signal**: ${signal.signal.label} (${signal.confidence}% confidence)\n`;
                response += `\n**Reasons:**\n`;
                signal.reasons.forEach(reason => {
                    response += `• ${reason}\n`;
                });
            }

            return response;
        }
    }

    return null;
};

// Main chat function
export const sendMessage = async (message, context = {}) => {
    // First try local knowledge base
    const knowledgeResponse = searchKnowledge(message);
    if (knowledgeResponse) {
        return {
            content: formatResponse(knowledgeResponse),
            source: 'knowledge_base',
        };
    }

    // Try context-aware response
    const contextResponse = generateContextResponse(message, context);
    if (contextResponse) {
        return {
            content: contextResponse,
            source: 'context',
        };
    }

    // Try Gemini API if key is configured
    const apiKey = getApiKey();
    if (apiKey) {
        try {
            const response = await fetch(
                `${GEMINI.BASE_URL}/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are ForexPro AI, a helpful forex trading assistant. Answer the following question about forex trading concisely and accurately. If asked about specific trades, always emphasize risk management and that this is educational information only, not financial advice.\n\nQuestion: ${message}`,
                            }],
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 500,
                        },
                    }),
                }
            );

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return {
                    content: data.candidates[0].content.parts[0].text,
                    source: 'gemini',
                };
            }
        } catch (error) {
            console.warn('Gemini API error:', error);
        }
    }

    // Fallback response
    return {
        content: `I can help you with forex trading questions! Try asking about:

📚 **Basics**: What is forex? What is a pip? What is leverage?

📊 **Indicators**: What is RSI? What is MACD? What are Bollinger Bands?

📈 **Strategies**: Trend following, breakout trading, risk management

🎯 **Patterns**: Head and shoulders, double top/bottom, triangles

💡 Tip: Add a Gemini API key in settings for more advanced responses!`,
        source: 'fallback',
    };
};

// Get suggested questions
export const getSuggestedQuestions = () => [
    'What is RSI and how do I use it?',
    'Explain MACD signals',
    'How do I calculate position size?',
    'What are the best practices for risk management?',
    'How do I identify support and resistance?',
    'What is the best time to trade forex?',
];

// Export knowledge categories for UI
export const getKnowledgeCategories = () => Object.keys(FOREX_KNOWLEDGE);
