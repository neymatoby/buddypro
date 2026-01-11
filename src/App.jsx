import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Assistant from './pages/Assistant';
import Watchlist from './pages/Watchlist';
import History from './pages/History';
import Performance from './pages/Performance';
import Learning from './pages/Learning';
import Challenges from './pages/Challenges';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/assistant" element={<Assistant />} />
                      <Route path="/watchlist" element={<Watchlist />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/performance" element={<Performance />} />
                      <Route path="/learning" element={<Learning />} />
                      <Route path="/challenges" element={<Challenges />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </HashRouter>
        </MarketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

