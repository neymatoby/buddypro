/**
 * Challenge Service
 * Provides daily trading quizzes and gamification
 */

const CHALLENGE_STORAGE_KEY = 'forexpro_challenges';
const XP_STORAGE_KEY = 'forexpro_xp';

/**
 * Quiz Question Bank
 */
export const QUIZ_QUESTIONS = [
    // Technical Indicators
    {
        id: 1,
        category: 'Indicators',
        difficulty: 'easy',
        question: 'What does RSI stand for?',
        options: [
            'Relative Strength Index',
            'Real Stock Indicator',
            'Rate of Stock Investment',
            'Relative Speed Index'
        ],
        correct: 0,
        explanation: 'RSI (Relative Strength Index) measures the speed and magnitude of price changes to identify overbought or oversold conditions.',
        xp: 10,
    },
    {
        id: 2,
        category: 'Indicators',
        difficulty: 'medium',
        question: 'An RSI reading above 70 typically indicates:',
        options: [
            'Oversold conditions',
            'Overbought conditions',
            'Neutral market',
            'High volume'
        ],
        correct: 1,
        explanation: 'RSI above 70 suggests the asset may be overbought and could be due for a pullback or reversal.',
        xp: 15,
    },
    {
        id: 3,
        category: 'Indicators',
        difficulty: 'medium',
        question: 'What is a MACD crossover?',
        options: [
            'When price crosses a moving average',
            'When the MACD line crosses the signal line',
            'When two currencies reach the same price',
            'When volume exceeds average'
        ],
        correct: 1,
        explanation: 'A MACD crossover occurs when the MACD line (12 EMA - 26 EMA) crosses above or below the signal line (9 EMA of MACD).',
        xp: 15,
    },
    {
        id: 4,
        category: 'Indicators',
        difficulty: 'easy',
        question: 'Which indicator uses upper and lower bands?',
        options: [
            'RSI',
            'MACD',
            'Bollinger Bands',
            'Fibonacci'
        ],
        correct: 2,
        explanation: 'Bollinger Bands consist of a middle band (SMA) and upper/lower bands based on standard deviation.',
        xp: 10,
    },
    // Chart Patterns
    {
        id: 5,
        category: 'Patterns',
        difficulty: 'medium',
        question: 'A "Head and Shoulders" pattern typically signals:',
        options: [
            'Trend continuation',
            'High volatility ahead',
            'Trend reversal',
            'Sideways movement'
        ],
        correct: 2,
        explanation: 'Head and Shoulders is a reversal pattern that signals a potential change in trend direction.',
        xp: 15,
    },
    {
        id: 6,
        category: 'Patterns',
        difficulty: 'easy',
        question: 'What does a "Double Top" pattern suggest?',
        options: [
            'Strong bullish momentum',
            'Bearish reversal',
            'Continuation of uptrend',
            'Increased volume'
        ],
        correct: 1,
        explanation: 'A Double Top is a bearish reversal pattern where price fails to break above a resistance level twice.',
        xp: 10,
    },
    {
        id: 7,
        category: 'Patterns',
        difficulty: 'hard',
        question: 'In an "ascending triangle" pattern, which line is typically horizontal?',
        options: [
            'The lower trendline',
            'The upper trendline',
            'Both trendlines',
            'Neither trendline'
        ],
        correct: 1,
        explanation: 'Ascending triangles have a horizontal upper resistance line and a rising lower trendline.',
        xp: 20,
    },
    // Risk Management
    {
        id: 8,
        category: 'Risk',
        difficulty: 'easy',
        question: 'What is the recommended maximum risk per trade?',
        options: [
            '10-20% of capital',
            '5-10% of capital',
            '1-2% of capital',
            '50% of capital'
        ],
        correct: 2,
        explanation: 'The 1-2% rule helps protect your capital and ensures you can survive a series of losses.',
        xp: 10,
    },
    {
        id: 9,
        category: 'Risk',
        difficulty: 'medium',
        question: 'What is a "stop-loss" order?',
        options: [
            'An order to buy at market',
            'An order to limit losses at a predetermined level',
            'An order to increase position size',
            'An order to hold indefinitely'
        ],
        correct: 1,
        explanation: 'A stop-loss automatically closes a position when price reaches a specified level to limit potential losses.',
        xp: 15,
    },
    {
        id: 10,
        category: 'Risk',
        difficulty: 'hard',
        question: 'What risk-reward ratio means you need a 50% win rate to break even?',
        options: [
            '1:3',
            '1:2',
            '1:1',
            '2:1'
        ],
        correct: 2,
        explanation: 'With a 1:1 risk-reward ratio, you need to win 50% of trades to break even (excluding fees).',
        xp: 20,
    },
    // Market Basics
    {
        id: 11,
        category: 'Basics',
        difficulty: 'easy',
        question: 'What time does the London forex session typically open?',
        options: [
            '00:00 UTC',
            '08:00 UTC',
            '13:00 UTC',
            '21:00 UTC'
        ],
        correct: 1,
        explanation: 'The London session opens at approximately 08:00 UTC and is the most liquid session.',
        xp: 10,
    },
    {
        id: 12,
        category: 'Basics',
        difficulty: 'easy',
        question: 'What does "going long" mean in forex?',
        options: [
            'Holding a position for a long time',
            'Buying expecting price to rise',
            'Using high leverage',
            'Trading on higher timeframes'
        ],
        correct: 1,
        explanation: 'Going long means buying a currency pair with the expectation that its value will increase.',
        xp: 10,
    },
    {
        id: 13,
        category: 'Basics',
        difficulty: 'medium',
        question: 'A "pip" in EUR/USD typically represents:',
        options: [
            '0.01',
            '0.001',
            '0.0001',
            '0.00001'
        ],
        correct: 2,
        explanation: 'For most pairs, a pip is the 4th decimal place (0.0001). For JPY pairs, it\'s the 2nd decimal.',
        xp: 15,
    },
    // Psychology
    {
        id: 14,
        category: 'Psychology',
        difficulty: 'medium',
        question: 'What is "revenge trading"?',
        options: [
            'Trading against the trend',
            'Making impulsive trades after a loss to recover money',
            'Copying another trader\'s strategy',
            'Trading during news events'
        ],
        correct: 1,
        explanation: 'Revenge trading is an emotional response where traders take excessive risks trying to recover losses quickly.',
        xp: 15,
    },
    {
        id: 15,
        category: 'Psychology',
        difficulty: 'medium',
        question: 'What is "FOMO" in trading?',
        options: [
            'First Order Market Open',
            'Fear Of Missing Out',
            'Fundamental Options Market Order',
            'Foreign Money Operations'
        ],
        correct: 1,
        explanation: 'FOMO (Fear Of Missing Out) can lead to impulsive entries without proper analysis.',
        xp: 15,
    },
];

/**
 * Get a random set of questions for daily challenge
 */
export const getDailyChallenge = (count = 5) => {
    const today = new Date().toDateString();
    const savedChallenge = getSavedChallenge();

    // Return existing challenge if already generated today
    if (savedChallenge && savedChallenge.date === today) {
        return savedChallenge;
    }

    // Generate new challenge
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, count);

    const challenge = {
        date: today,
        questions,
        completed: false,
        score: 0,
        answers: [],
        startedAt: null,
        completedAt: null,
    };

    saveDailyChallenge(challenge);
    return challenge;
};

/**
 * Get saved daily challenge
 */
export const getSavedChallenge = () => {
    try {
        const saved = localStorage.getItem(CHALLENGE_STORAGE_KEY);
        if (saved) {
            const challenge = JSON.parse(saved);
            return challenge;
        }
    } catch { }
    return null;
};

/**
 * Save daily challenge progress
 */
export const saveDailyChallenge = (challenge) => {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(challenge));
};

/**
 * Submit answer for a question
 */
export const submitAnswer = (questionId, selectedOption) => {
    const challenge = getSavedChallenge();
    if (!challenge) return null;

    const question = challenge.questions.find(q => q.id === questionId);
    if (!question) return null;

    const isCorrect = selectedOption === question.correct;
    const xpEarned = isCorrect ? question.xp : 0;

    // Record start time if first answer
    if (!challenge.startedAt) {
        challenge.startedAt = new Date().toISOString();
    }

    // Add answer
    challenge.answers.push({
        questionId,
        selectedOption,
        isCorrect,
        xpEarned,
    });

    // Check if challenge complete
    if (challenge.answers.length === challenge.questions.length) {
        challenge.completed = true;
        challenge.completedAt = new Date().toISOString();
        challenge.score = challenge.answers.filter(a => a.isCorrect).length;

        // Add XP
        const totalXp = challenge.answers.reduce((sum, a) => sum + a.xpEarned, 0);
        addXP(totalXp);
    }

    saveDailyChallenge(challenge);

    return {
        isCorrect,
        xpEarned,
        explanation: question.explanation,
        correctAnswer: question.options[question.correct],
    };
};

/**
 * Get XP data
 */
export const getXPData = () => {
    try {
        const saved = localStorage.getItem(XP_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch { }

    return {
        totalXP: 0,
        level: 1,
        challengesCompleted: 0,
        perfectScores: 0,
        lastChallengeDate: null,
    };
};

/**
 * Add XP and update level
 */
export const addXP = (amount) => {
    const data = getXPData();
    data.totalXP += amount;
    data.challengesCompleted++;
    data.lastChallengeDate = new Date().toDateString();

    // Calculate level (100 XP per level)
    data.level = Math.floor(data.totalXP / 100) + 1;

    localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(data));
    return data;
};

/**
 * Get XP needed for next level
 */
export const getXPForNextLevel = (currentXP) => {
    const currentLevel = Math.floor(currentXP / 100) + 1;
    const xpForNextLevel = currentLevel * 100;
    return xpForNextLevel - currentXP;
};

/**
 * Get level title based on XP
 */
export const getLevelTitle = (level) => {
    if (level < 5) return 'Beginner';
    if (level < 10) return 'Novice Trader';
    if (level < 20) return 'Intermediate';
    if (level < 35) return 'Advanced Trader';
    if (level < 50) return 'Expert';
    if (level < 75) return 'Master Trader';
    return 'Legendary Trader';
};

/**
 * Check if today's challenge is completed
 */
export const isTodayChallengeCompleted = () => {
    const challenge = getSavedChallenge();
    const today = new Date().toDateString();
    return challenge && challenge.date === today && challenge.completed;
};

/**
 * Get challenge history stats
 */
export const getChallengeStats = () => {
    const xpData = getXPData();
    return {
        ...xpData,
        levelTitle: getLevelTitle(xpData.level),
        xpToNextLevel: getXPForNextLevel(xpData.totalXP),
        progressPercent: (xpData.totalXP % 100),
    };
};

/**
 * Reset all challenge data
 */
export const resetChallengeData = () => {
    localStorage.removeItem(CHALLENGE_STORAGE_KEY);
    localStorage.removeItem(XP_STORAGE_KEY);
};
