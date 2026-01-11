import { formatPrice, formatPercent } from '../../utils/formatters';
import { useMarket } from '../../context/MarketContext';
import './PriceCard.css';

// Currency flags/icons
const currencyIcons = {
    EUR: '🇪🇺',
    USD: '🇺🇸',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    NZD: '🇳🇿',
};

const PriceCard = ({
    pair,
    price,
    change = 0,
    changePercent = 0,
    onClick,
    isSelected = false,
    compact = false,
    showWatchlist = true,
}) => {
    const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useMarket();
    const [base, quote] = pair.split('/');

    const isUp = change >= 0;
    const inWatchlist = isInWatchlist(pair);

    const handleWatchlistClick = (e) => {
        e.stopPropagation();
        if (inWatchlist) {
            removeFromWatchlist(pair);
        } else {
            addToWatchlist(pair);
        }
    };

    return (
        <div
            className={`price-card ${isSelected ? 'price-card--selected' : ''} ${isUp ? 'price-card--bullish' : 'price-card--bearish'
                } ${compact ? 'price-card--compact' : ''}`}
            onClick={onClick}
        >
            <div className="price-card__left">
                <div className="price-card__icon">
                    {currencyIcons[base] || '💱'}
                </div>
                <div className="price-card__info">
                    <span className="price-card__pair">{pair}</span>
                    <span className="price-card__name">{base} / {quote}</span>
                </div>
            </div>

            <div className="price-card__right">
                <span className="price-card__price">
                    {formatPrice(price, pair)}
                </span>
                <span className={`price-card__change ${isUp ? 'price-card__change--up' : 'price-card__change--down'}`}>
                    <svg className="price-card__arrow" viewBox="0 0 24 24" fill="currentColor">
                        {isUp ? (
                            <path d="M7 14l5-5 5 5H7z" />
                        ) : (
                            <path d="M7 10l5 5 5-5H7z" />
                        )}
                    </svg>
                    {formatPercent(changePercent)}
                </span>
            </div>

            {showWatchlist && (
                <button
                    className={`price-card__watchlist-btn ${inWatchlist ? 'price-card__watchlist-btn--active' : ''}`}
                    onClick={handleWatchlistClick}
                    title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default PriceCard;
