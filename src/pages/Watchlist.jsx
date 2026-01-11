import { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { CURRENCY_PAIRS } from '../utils/constants';
import PriceCard from '../components/charts/PriceCard';
import './Watchlist.css';

const Watchlist = () => {
    const { watchlist, rates, setSelectedPair } = useMarket();
    const [searchQuery, setSearchQuery] = useState('');

    const watchlistPairs = CURRENCY_PAIRS.filter(p => watchlist.includes(p.symbol));
    const otherPairs = CURRENCY_PAIRS.filter(p => !watchlist.includes(p.symbol));

    const filteredWatchlist = watchlistPairs.filter(p =>
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOther = otherPairs.filter(p =>
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="watchlist-page">
            <div className="watchlist-page__header">
                <div>
                    <h1 className="watchlist-page__title">My Watchlist</h1>
                    <p className="watchlist-page__subtitle">
                        Track your favorite currency pairs
                    </p>
                </div>
                <div className="watchlist-page__search">
                    <input
                        type="text"
                        className="watchlist-page__search-input"
                        placeholder="Search currency pairs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Watchlist */}
            {filteredWatchlist.length > 0 ? (
                <div className="watchlist-page__grid">
                    {filteredWatchlist.map(pair => {
                        const rate = rates[pair.symbol];
                        return (
                            <PriceCard
                                key={pair.symbol}
                                pair={pair.symbol}
                                price={rate?.price}
                                change={rate?.change}
                                changePercent={rate?.changePercent}
                                onClick={() => setSelectedPair(pair.symbol)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="watchlist-page__empty">
                    <div className="watchlist-page__empty-icon">⭐</div>
                    <p className="watchlist-page__empty-text">
                        {searchQuery ? 'No pairs match your search' : 'Your watchlist is empty'}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                        Click the star icon on any currency pair to add it to your watchlist
                    </p>
                </div>
            )}

            {/* All Other Pairs */}
            {filteredOther.length > 0 && (
                <>
                    <h2 className="watchlist-page__section-title">All Currency Pairs</h2>
                    <div className="watchlist-page__grid">
                        {filteredOther.map(pair => {
                            const rate = rates[pair.symbol];
                            return (
                                <PriceCard
                                    key={pair.symbol}
                                    pair={pair.symbol}
                                    price={rate?.price}
                                    change={rate?.change}
                                    changePercent={rate?.changePercent}
                                    onClick={() => setSelectedPair(pair.symbol)}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default Watchlist;
