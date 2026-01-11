import { INDICATORS } from '../../utils/constants';
import './IndicatorPanel.css';

// RSI Gauge component
const RSIGauge = ({ value }) => {
    const radius = 52;
    const circumference = radius * Math.PI;
    const percentage = value / 100;
    const offset = circumference - (percentage * circumference);

    let color = 'var(--color-neutral)';
    if (value >= INDICATORS.RSI.overbought) color = 'var(--color-bearish)';
    else if (value <= INDICATORS.RSI.oversold) color = 'var(--color-bullish)';

    return (
        <div className="rsi-gauge">
            <svg viewBox="0 0 120 60" width="120" height="60">
                <path
                    className="rsi-gauge__bg"
                    d="M 10,55 A 50,50 0 0,1 110,55"
                />
                <path
                    className="rsi-gauge__fill"
                    d="M 10,55 A 50,50 0 0,1 110,55"
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="rsi-gauge__value" style={{ color }}>
                {value?.toFixed(1) || '--'}
            </span>
        </div>
    );
};

// MACD Mini Chart
const MACDMini = ({ histogram = [] }) => {
    const lastValues = histogram.slice(-20).filter(v => v !== null);
    const maxAbs = Math.max(...lastValues.map(Math.abs), 0.0001);

    return (
        <div className="macd-mini">
            {lastValues.map((value, index) => {
                const height = Math.max(2, Math.abs(value / maxAbs) * 40);
                return (
                    <div
                        key={index}
                        className={`macd-mini__bar ${value >= 0 ? 'macd-mini__bar--positive' : 'macd-mini__bar--negative'}`}
                        style={{ height: `${height}px` }}
                    />
                );
            })}
        </div>
    );
};

const IndicatorPanel = ({ indicators, signal }) => {
    if (!indicators) {
        return (
            <div className="indicator-panel">
                <div className="indicator-panel__item">
                    <span className="indicator-panel__name">Loading indicators...</span>
                </div>
            </div>
        );
    }

    const rsiValue = indicators.rsi?.[indicators.rsi.length - 1];
    const macd = signal?.indicators?.macd;
    const ema = signal?.indicators?.ema;
    const bb = signal?.indicators?.bollingerBands;

    const getRSIStatus = (value) => {
        if (value >= INDICATORS.RSI.overbought) return { text: 'Overbought', type: 'bearish' };
        if (value <= INDICATORS.RSI.oversold) return { text: 'Oversold', type: 'bullish' };
        if (value > 55) return { text: 'Bullish', type: 'bullish' };
        if (value < 45) return { text: 'Bearish', type: 'bearish' };
        return { text: 'Neutral', type: 'neutral' };
    };

    const getMACDStatus = (line, signalLine) => {
        if (line > signalLine) return { text: 'Bullish', type: 'bullish' };
        return { text: 'Bearish', type: 'bearish' };
    };

    const rsiStatus = rsiValue ? getRSIStatus(rsiValue) : null;
    const macdStatus = macd ? getMACDStatus(macd.line, macd.signal) : null;

    return (
        <div className="indicator-panel">
            {/* RSI */}
            <div className="indicator-panel__item">
                <div className="indicator-panel__label">
                    <span className="indicator-panel__name">RSI (14)</span>
                    <span className="indicator-panel__description">Relative Strength Index</span>
                </div>
                <div className="indicator-panel__value">
                    <RSIGauge value={rsiValue} />
                    {rsiStatus && (
                        <span className={`indicator-panel__badge indicator-panel__badge--${rsiStatus.type}`}>
                            {rsiStatus.text}
                        </span>
                    )}
                </div>
            </div>

            {/* MACD */}
            <div className="indicator-panel__item">
                <div className="indicator-panel__label">
                    <span className="indicator-panel__name">MACD</span>
                    <span className="indicator-panel__description">
                        Line: {macd?.line?.toFixed(5) || '--'} | Signal: {macd?.signal?.toFixed(5) || '--'}
                    </span>
                </div>
                <div className="indicator-panel__value">
                    {indicators.macd?.histogram && (
                        <MACDMini histogram={indicators.macd.histogram} />
                    )}
                    {macdStatus && (
                        <span className={`indicator-panel__badge indicator-panel__badge--${macdStatus.type}`}>
                            {macdStatus.text}
                        </span>
                    )}
                </div>
            </div>

            {/* EMAs */}
            <div className="indicator-panel__item">
                <div className="indicator-panel__label">
                    <span className="indicator-panel__name">Moving Averages</span>
                    <span className="indicator-panel__description">EMA 9 / 21 / 50</span>
                </div>
                <div className="indicator-panel__value" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: '#f59e0b' }}>
                        EMA 9: {ema?.ema9?.toFixed(5) || '--'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: '#8b5cf6' }}>
                        EMA 21: {ema?.ema21?.toFixed(5) || '--'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: '#3b82f6' }}>
                        EMA 50: {ema?.ema50?.toFixed(5) || '--'}
                    </span>
                </div>
            </div>

            {/* Bollinger Bands */}
            <div className="indicator-panel__item">
                <div className="indicator-panel__label">
                    <span className="indicator-panel__name">Bollinger Bands</span>
                    <span className="indicator-panel__description">Upper / Middle / Lower</span>
                </div>
                <div className="indicator-panel__value" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-bearish)' }}>
                        Upper: {bb?.upper?.toFixed(5) || '--'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        Middle: {bb?.middle?.toFixed(5) || '--'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-bullish)' }}>
                        Lower: {bb?.lower?.toFixed(5) || '--'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IndicatorPanel;
