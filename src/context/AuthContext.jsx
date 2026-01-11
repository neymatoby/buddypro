import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { generateId } from '../utils/formatters';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Error parsing saved user:', e);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        }
        setIsLoading(false);
    }, []);

    // Save user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
    }, [user]);

    const login = (email, password) => {
        // For demo, we'll do local authentication
        // In production, this would be an API call

        // Check if user exists
        const existingUsers = JSON.parse(localStorage.getItem('forexpro_users') || '[]');
        const existingUser = existingUsers.find(u => u.email === email);

        if (existingUser) {
            if (existingUser.password === password) {
                const userData = {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name,
                    settings: existingUser.settings || DEFAULT_SETTINGS,
                    createdAt: existingUser.createdAt,
                };
                setUser(userData);
                return { success: true, user: userData };
            }
            return { success: false, error: 'Invalid password' };
        }

        return { success: false, error: 'User not found. Please sign up.' };
    };

    const signup = (email, password, name) => {
        // Validate inputs
        if (!email || !password || !name) {
            return { success: false, error: 'All fields are required' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('forexpro_users') || '[]');
        if (existingUsers.find(u => u.email === email)) {
            return { success: false, error: 'User already exists' };
        }

        // Create new user
        const newUser = {
            id: generateId(),
            email,
            password, // In production, hash this!
            name,
            settings: DEFAULT_SETTINGS,
            createdAt: new Date().toISOString(),
        };

        existingUsers.push(newUser);
        localStorage.setItem('forexpro_users', JSON.stringify(existingUsers));

        const userData = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            settings: newUser.settings,
            createdAt: newUser.createdAt,
        };

        setUser(userData);
        return { success: true, user: userData };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    const updateSettings = (newSettings) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            settings: { ...user.settings, ...newSettings },
        };
        setUser(updatedUser);

        // Also update in users list
        const existingUsers = JSON.parse(localStorage.getItem('forexpro_users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
            existingUsers[userIndex].settings = updatedUser.settings;
            localStorage.setItem('forexpro_users', JSON.stringify(existingUsers));
        }
    };

    const updateProfile = (updates) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        // Also update in users list
        const existingUsers = JSON.parse(localStorage.getItem('forexpro_users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
            existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates };
            localStorage.setItem('forexpro_users', JSON.stringify(existingUsers));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                updateSettings,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
