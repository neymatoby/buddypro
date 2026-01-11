/**
 * Learning Service
 * Handles daily learning prompts, journal, and progress tracking
 */

const JOURNAL_STORAGE_KEY = 'forexpro_learning_journal';
const STREAK_STORAGE_KEY = 'forexpro_learning_streak';

/**
 * Daily reflection prompts
 */
export const REFLECTION_PROMPTS = [
    "What trading concept did you learn today?",
    "What was your biggest insight about the market today?",
    "Did you notice any patterns in price action today?",
    "What indicator or tool did you practice using today?",
    "What would you do differently in your analysis next time?",
    "What trading rule did you follow well today?",
    "What emotional challenge did you face while analyzing charts?",
    "What news or event affected the market today?",
    "What did you learn about risk management today?",
    "How did you practice patience in your analysis today?",
    "What chart pattern did you identify today?",
    "What correlation between pairs did you observe?",
    "How did you handle uncertainty in your analysis?",
    "What mistake did you learn from today?",
    "What successful strategy element did you identify?",
];

/**
 * Trading tips and educational content
 */
export const TRADING_TIPS = [
    {
        category: 'Risk Management',
        tip: 'Never risk more than 1-2% of your trading capital on a single trade.',
        explanation: 'This ensures you can survive a losing streak and stay in the game.',
    },
    {
        category: 'Technical Analysis',
        tip: 'Always wait for confirmation before entering a trade.',
        explanation: 'A single indicator signal is not enough - look for confluence from multiple sources.',
    },
    {
        category: 'Psychology',
        tip: 'Keep a trading journal to track your emotions and decisions.',
        explanation: 'Self-awareness helps identify patterns in your behavior that affect trading.',
    },
    {
        category: 'Strategy',
        tip: 'The trend is your friend - trade with the prevailing direction.',
        explanation: 'Counter-trend trades have lower probability of success.',
    },
    {
        category: 'Timing',
        tip: 'Major news events cause high volatility - be cautious.',
        explanation: 'Consider staying out of positions during major economic announcements.',
    },
    {
        category: 'Patience',
        tip: 'Wait for your setup - not every day is a trading day.',
        explanation: 'Quality over quantity leads to better long-term results.',
    },
    {
        category: 'Analysis',
        tip: 'Higher timeframes give more reliable signals.',
        explanation: 'Daily and 4H charts filter out noise present in lower timeframes.',
    },
    {
        category: 'Discipline',
        tip: 'Set your stop loss before entering a trade - and stick to it.',
        explanation: 'Pre-planning removes emotional decision-making in the moment.',
    },
];

/**
 * Get today's reflection prompt
 */
export const getTodayPrompt = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
};

/**
 * Get a random trading tip
 */
export const getRandomTip = () => {
    return TRADING_TIPS[Math.floor(Math.random() * TRADING_TIPS.length)];
};

/**
 * Get today's trading tip
 */
export const getTodayTip = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return TRADING_TIPS[dayOfYear % TRADING_TIPS.length];
};

/**
 * Save a journal entry
 */
export const saveJournalEntry = (entry) => {
    try {
        const existing = getJournalEntries();
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            prompt: getTodayPrompt(),
            content: entry,
            mood: null, // Can be extended with mood tracking
        };
        existing.unshift(newEntry);
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 365))); // Keep 1 year
        updateStreak();
        return newEntry;
    } catch (e) {
        console.error('Error saving journal entry:', e);
        return null;
    }
};

/**
 * Get all journal entries
 */
export const getJournalEntries = () => {
    try {
        const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

/**
 * Get today's journal entry (if exists)
 */
export const getTodayEntry = () => {
    const entries = getJournalEntries();
    const today = new Date().toDateString();
    return entries.find(e => new Date(e.date).toDateString() === today);
};

/**
 * Check if user has completed today's journal
 */
export const hasCompletedTodayJournal = () => {
    return getTodayEntry() !== null;
};

/**
 * Get learning streak data
 */
export const getStreakData = () => {
    try {
        const saved = localStorage.getItem(STREAK_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch { }

    return {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        totalEntries: 0,
    };
};

/**
 * Update streak after completing an entry
 */
export const updateStreak = () => {
    const data = getStreakData();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastEntryDate === today) {
        // Already logged today
        return data;
    }

    const newData = { ...data };
    newData.totalEntries++;

    if (data.lastEntryDate === yesterday) {
        // Continuing streak
        newData.currentStreak++;
    } else if (data.lastEntryDate !== today) {
        // Streak broken, start new
        newData.currentStreak = 1;
    }

    if (newData.currentStreak > newData.longestStreak) {
        newData.longestStreak = newData.currentStreak;
    }

    newData.lastEntryDate = today;
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newData));

    return newData;
};

/**
 * Check if streak is at risk (didn't log yesterday)
 */
export const isStreakAtRisk = () => {
    const data = getStreakData();
    if (!data.lastEntryDate) return false;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return data.lastEntryDate !== today && data.lastEntryDate !== yesterday && data.currentStreak > 0;
};

/**
 * Get motivational message based on streak
 */
export const getMotivationalMessage = (streak) => {
    if (streak === 0) return "Start your learning journey today! 🌱";
    if (streak === 1) return "Great start! Keep the momentum going! 🔥";
    if (streak < 7) return `${streak} day streak! Building good habits! 💪`;
    if (streak < 14) return `${streak} days strong! You're on fire! 🔥`;
    if (streak < 30) return `${streak} day streak! Impressive dedication! ⭐`;
    if (streak < 60) return `${streak} days! You're becoming an expert! 🏆`;
    return `${streak} day streak! Legendary commitment! 👑`;
};

/**
 * Clear all learning data
 */
export const clearLearningData = () => {
    localStorage.removeItem(JOURNAL_STORAGE_KEY);
    localStorage.removeItem(STREAK_STORAGE_KEY);
};
