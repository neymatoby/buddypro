import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    requestNotificationPermission,
    areNotificationsEnabled,
    enableNotifications,
    disableNotifications,
    getNotificationPermission
} from '../../services/notificationService';
import './Layout.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [notificationsOn, setNotificationsOn] = useState(false);

    useEffect(() => {
        setNotificationsOn(areNotificationsEnabled());
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationToggle = async () => {
        if (notificationsOn) {
            disableNotifications();
            setNotificationsOn(false);
        } else {
            if (getNotificationPermission() === 'granted') {
                enableNotifications();
                setNotificationsOn(true);
            } else {
                const result = await requestNotificationPermission();
                setNotificationsOn(result.granted);
            }
        }
    };

    return (
        <header className="header">
            <div className="header__brand">
                <img src="/favicon.svg" alt="BuddyPro" className="header__logo" />
                <div>
                    <h1 className="header__title">BuddyPro</h1>
                    <span className="header__subtitle">Trading Analysis</span>
                </div>
            </div>

            <nav className="header__nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Dashboard
                </NavLink>
                <NavLink
                    to="/analysis"
                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Analysis
                </NavLink>
                <NavLink
                    to="/challenges"
                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Learn
                </NavLink>
                <NavLink
                    to="/performance"
                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Stats
                </NavLink>
                <NavLink
                    to="/assistant"
                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    AI
                </NavLink>
            </nav>

            <div className="header__actions">
                {/* Notification Bell */}
                <button
                    className={`header__icon-btn ${notificationsOn ? 'header__icon-btn--active' : ''}`}
                    onClick={handleNotificationToggle}
                    title={notificationsOn ? 'Notifications on' : 'Enable notifications'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        {notificationsOn && <circle cx="18" cy="5" r="3" fill="var(--color-accent)" stroke="none" />}
                    </svg>
                </button>

                <button className="header__icon-btn" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
                    {isDark ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>

                {user ? (
                    <div className="header__user" onClick={handleLogout} title="Click to logout">
                        <div className="header__avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="header__username">{user.name}</span>
                    </div>
                ) : (
                    <NavLink to="/login" className="header__user">
                        <div className="header__avatar">?</div>
                        <span className="header__username">Login</span>
                    </NavLink>
                )}
            </div>
        </header>
    );
};

const MobileNav = () => (
    <nav className="mobile-nav">
        <ul className="mobile-nav__list">
            <li>
                <NavLink
                    to="/"
                    className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
                >
                    <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    Home
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/analysis"
                    className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
                >
                    <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Charts
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/challenges"
                    className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
                >
                    <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Learn
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/performance"
                    className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
                >
                    <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Stats
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/assistant"
                    className={({ isActive }) => `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
                >
                    <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    AI
                </NavLink>
            </li>
        </ul>
    </nav>
);

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <MobileNav />
        </div>
    );
};

export default Layout;
