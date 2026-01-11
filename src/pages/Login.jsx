import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;
            if (activeTab === 'login') {
                result = login(email, password);
            } else {
                result = signup(email, password, name);
            }

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-page__container">
                <div className="login-page__header">
                    <img src="/favicon.svg" alt="ForexPro" className="login-page__logo" />
                    <h1 className="login-page__title">ForexPro Trading</h1>
                    <p className="login-page__subtitle">
                        Professional Forex Analysis with AI
                    </p>
                </div>

                <div className="login-page__card">
                    <div className="login-page__tabs">
                        <button
                            className={`login-page__tab ${activeTab === 'login' ? 'login-page__tab--active' : ''}`}
                            onClick={() => { setActiveTab('login'); setError(''); }}
                        >
                            Login
                        </button>
                        <button
                            className={`login-page__tab ${activeTab === 'signup' ? 'login-page__tab--active' : ''}`}
                            onClick={() => { setActiveTab('signup'); setError(''); }}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className="login-page__form" onSubmit={handleSubmit}>
                        {activeTab === 'signup' && (
                            <div className="login-page__form-group">
                                <label className="login-page__label">Name</label>
                                <input
                                    type="text"
                                    className="login-page__input"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="login-page__form-group">
                            <label className="login-page__label">Email</label>
                            <input
                                type="email"
                                className="login-page__input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-page__form-group">
                            <label className="login-page__label">Password</label>
                            <input
                                type="password"
                                className="login-page__input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <div className="login-page__error">{error}</div>}

                        <button
                            type="submit"
                            className="login-page__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Please wait...' : activeTab === 'login' ? 'Login' : 'Create Account'}
                        </button>
                    </form>

                    <div className="login-page__divider">or</div>

                    <button className="login-page__skip" onClick={handleSkip}>
                        Continue as Guest
                    </button>
                </div>

                <p className="login-page__footer">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                    <br />
                    Your data is stored locally on your device.
                </p>
            </div>
        </div>
    );
};

export default Login;
