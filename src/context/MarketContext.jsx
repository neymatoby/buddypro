import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, CURRENCY_PAIRS } from '../utils/constants';
import { fetchMultipleRates, fetchForexData } from '../services/forexApi';
import { generateSignal, getAllIndicators } from '../services/technicalAnalysis';
import { showSignalNotification } from '../services/notificationService';

const MarketContext = createContext(null);

export const useMarket = () => {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarket must be used within a MarketProvider');
    }
    return context;
};

export const MarketProvider = ({ children }) => {
    const [rates, setRates] = useState({});
    const [selectedPair, setSelectedPair] = useState('EUR/USD');
    const [selectedTimeframe, setSelectedTimeframe] = useState('60min');
    const [chartData, setChartData] = useState([]);
    const [indicators, setIndicators] = useState(null);
    const [signal, setSignal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const initialLoadDone = useRef(false);

    // Watchlist state
    const [watchlist, setWatchlist] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
            return saved ? JSON.parse(saved) : ['EUR/USD', 'GBP/USD', 'USD/JPY'];
        } catch {
            return ['EUR/USD', 'GBP/USD', 'USD/JPY'];
        }
    });

    // Save watchlist changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        } catch {
            // Ignore storage errors
        }
    }, [watchlist]);

    // Fetch all rates
    const refreshRates = useCallback(async () => {
        try {
            const results = await fetchMultipleRates(CURRENCY_PAIRS);
            const ratesMap = {};
            results.forEach(rate => {
                if (rate && rate.pair) {
                    ratesMap[rate.pair] = rate;
                }
            });
            setRates(ratesMap);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error fetching rates:', err);
        }
    }, []);

    // Fetch chart data for selected pair
    const fetchChartData = useCallback(async (pair, timeframe) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchForexData(pair, timeframe);

            if (data && Array.isArray(data)) {
                setChartData(data);

                // Calculate indicators only if we have data
                if (data.length > 0) {
                    try {
                        const allIndicators = getAllIndicators(data);
                        setIndicators(allIndicators);

                        // Generate signal
                        const newSignal = generateSignal(data);
                        setSignal(newSignal);

                        // Trigger notification for strong signals
                        if (newSignal && newSignal.confidence >= 70) {
                            showSignalNotification({
                                ...newSignal,
                                pair: pair,
                            });
                        }
                    } catch (indicatorError) {
                        console.error('Error calculating indicators:', indicatorError);
                        setIndicators(null);
                        setSignal(null);
                    }
                } else {
                    setIndicators(null);
                    setSignal(null);
                }

                setLastUpdate(new Date());
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching chart data:', err);
            setChartData([]);
            setIndicators(null);
            setSignal(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load only
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            refreshRates();
            fetchChartData(selectedPair, selectedTimeframe);
        }

        // Auto-refresh rates every 5 minutes
        const interval = setInterval(() => {
            refreshRates();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []); // Empty deps - only run once

    // Refetch when pair or timeframe changes (but not on initial load)
    useEffect(() => {
        if (initialLoadDone.current) {
            fetchChartData(selectedPair, selectedTimeframe);
        }
    }, [selectedPair, selectedTimeframe]);

    // Watchlist actions
    const addToWatchlist = (pair) => {
        if (!watchlist.includes(pair)) {
            setWatchlist(prev => [...prev, pair]);
        }
    };

    const removeFromWatchlist = (pair) => {
        setWatchlist(prev => prev.filter(p => p !== pair));
    };

    const isInWatchlist = (pair) => watchlist.includes(pair);

    return (
        <MarketContext.Provider
            value={{
                // Market data
                rates,
                chartData,
                indicators,
                signal,
                isLoading,
                error,
                lastUpdate,

                // Selection
                selectedPair,
                setSelectedPair,
                selectedTimeframe,
                setSelectedTimeframe,

                // Watchlist
                watchlist,
                addToWatchlist,
                removeFromWatchlist,
                isInWatchlist,

                // Actions
                refreshRates,
                fetchChartData,
            }}
        >
            {children}
        </MarketContext.Provider>
    );
};
