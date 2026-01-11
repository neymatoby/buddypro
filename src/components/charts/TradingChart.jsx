import { useEffect, useRef, useState, useMemo } from 'react';
import { TIMEFRAMES, CHART_COLORS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { generateTradeSetup } from '../../services/tradeSetupService';
import './TradingChart.css';

const TradingChart = ({
    data = [],
    pair = 'EUR/USD',
    timeframe = '60min',
    onTimeframeChange,
    indicators = null,
    isLoading = false,
    showTradeLines = false,
    signal = null,
}) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const emaSeriesRef = useRef([]);
    const priceLinesRef = useRef([]);
    const { isDark } = useTheme();
    const [error, setError] = useState(null);
    const [chartLoaded, setChartLoaded] = useState(false);

    // Generate trade setup for price lines
    const tradeSetup = useMemo(() => {
        if (showTradeLines && data.length > 50 && indicators && signal) {
            return generateTradeSetup(data, indicators, signal);
        }
        return null;
    }, [data, indicators, signal, showTradeLines]);

    // Get current price info
    const currentPrice = data && data.length > 0 ? data[data.length - 1]?.close : null;
    const prevPrice = data && data.length > 1 ? data[data.length - 2]?.close : null;
    const priceChange = currentPrice && prevPrice ? currentPrice - prevPrice : 0;
    const priceChangePercent = prevPrice ? (priceChange / prevPrice) * 100 : 0;
    const isUp = priceChange >= 0;

    useEffect(() => {
        if (!chartContainerRef.current) return;

        let chart = null;
        let candlestickSeries = null;

        const initChart = async () => {
            try {
                // Dynamic import for lightweight-charts (v5 compatible)
                const LightweightCharts = await import('lightweight-charts');

                // Chart colors based on theme
                const colors = isDark ? {
                    background: '#1e293b',
                    textColor: '#94a3b8',
                    gridColor: 'rgba(148, 163, 184, 0.1)',
                } : {
                    background: '#ffffff',
                    textColor: '#475569',
                    gridColor: 'rgba(15, 23, 42, 0.1)',
                };

                // Create chart using v5 API
                chart = LightweightCharts.createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: 'solid', color: colors.background },
                        textColor: colors.textColor,
                    },
                    grid: {
                        vertLines: { color: colors.gridColor },
                        horzLines: { color: colors.gridColor },
                    },
                    crosshair: {
                        mode: 0, // Normal crosshair mode
                        vertLine: {
                            color: '#64748b',
                            width: 1,
                            style: 2,
                        },
                        horzLine: {
                            color: '#64748b',
                            width: 1,
                            style: 2,
                        },
                    },
                    rightPriceScale: {
                        borderColor: colors.gridColor,
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.1,
                        },
                    },
                    timeScale: {
                        borderColor: colors.gridColor,
                        timeVisible: true,
                        secondsVisible: false,
                    },
                    handleScale: {
                        axisPressedMouseMove: true,
                    },
                    handleScroll: {
                        vertTouchDrag: false,
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });

                chartRef.current = chart;

                // Add candlestick series using v5 API
                candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
                    upColor: CHART_COLORS.bullish,
                    downColor: CHART_COLORS.bearish,
                    borderUpColor: CHART_COLORS.bullish,
                    borderDownColor: CHART_COLORS.bearish,
                    wickUpColor: CHART_COLORS.bullish,
                    wickDownColor: CHART_COLORS.bearish,
                });

                seriesRef.current = candlestickSeries;
                setChartLoaded(true);
                setError(null);

                // Handle resize
                const handleResize = () => {
                    if (chartContainerRef.current && chart) {
                        try {
                            chart.applyOptions({
                                width: chartContainerRef.current.clientWidth,
                                height: chartContainerRef.current.clientHeight,
                            });
                        } catch (e) {
                            // Ignore resize errors
                        }
                    }
                };

                window.addEventListener('resize', handleResize);

                // Cleanup function
                return () => {
                    window.removeEventListener('resize', handleResize);
                    try {
                        if (chart) {
                            chart.remove();
                        }
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                    chartRef.current = null;
                    seriesRef.current = null;
                    emaSeriesRef.current = [];
                    priceLinesRef.current = [];
                };
            } catch (e) {
                console.error('Chart initialization error:', e);
                setError('Failed to initialize chart: ' + e.message);
                return () => { };
            }
        };

        const cleanupPromise = initChart();

        return () => {
            cleanupPromise.then(cleanup => {
                if (cleanup) cleanup();
            });
        };
    }, [isDark]);

    // Update data
    useEffect(() => {
        if (seriesRef.current && data && data.length > 0 && chartLoaded) {
            try {
                // Validate and format data
                const validData = data
                    .filter(d => d && d.time && typeof d.open === 'number')
                    .map(d => ({
                        time: d.time,
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                    }));

                if (validData.length > 0) {
                    seriesRef.current.setData(validData);
                    chartRef.current?.timeScale().fitContent();
                }
            } catch (e) {
                console.error('Error updating chart data:', e);
            }
        }
    }, [data, chartLoaded]);

    // Add EMA lines if available
    useEffect(() => {
        if (!chartRef.current || !indicators || !data || !data.length || !chartLoaded) return;

        const addEmaLines = async () => {
            try {
                const LightweightCharts = await import('lightweight-charts');

                // Clear previous EMA series
                emaSeriesRef.current.forEach(series => {
                    try {
                        chartRef.current?.removeSeries(series);
                    } catch (e) {
                        // Ignore removal errors
                    }
                });
                emaSeriesRef.current = [];

                // Add EMA 21 line
                if (indicators.ema21 && indicators.ema21.length > 0) {
                    const ema21Series = chartRef.current.addSeries(LightweightCharts.LineSeries, {
                        color: '#f59e0b',
                        lineWidth: 1,
                        priceLineVisible: false,
                        lastValueVisible: false,
                    });

                    const ema21Data = indicators.ema21
                        .map((value, index) => ({
                            time: data[index]?.time,
                            value: value,
                        }))
                        .filter(d => d.value !== null && d.time);

                    if (ema21Data.length > 0) {
                        ema21Series.setData(ema21Data);
                        emaSeriesRef.current.push(ema21Series);
                    }
                }

                // Add EMA 50 line
                if (indicators.ema50 && indicators.ema50.length > 0) {
                    const ema50Series = chartRef.current.addSeries(LightweightCharts.LineSeries, {
                        color: '#8b5cf6',
                        lineWidth: 1,
                        priceLineVisible: false,
                        lastValueVisible: false,
                    });

                    const ema50Data = indicators.ema50
                        .map((value, index) => ({
                            time: data[index]?.time,
                            value: value,
                        }))
                        .filter(d => d.value !== null && d.time);

                    if (ema50Data.length > 0) {
                        ema50Series.setData(ema50Data);
                        emaSeriesRef.current.push(ema50Series);
                    }
                }
            } catch (e) {
                console.error('Error adding EMA lines:', e);
            }
        };

        addEmaLines();
    }, [indicators, data, chartLoaded]);

    // Add trade setup price lines (Entry, Stop Loss, Take Profit)
    useEffect(() => {
        if (!seriesRef.current || !chartLoaded || !tradeSetup?.active) return;

        try {
            // Clear previous price lines
            priceLinesRef.current.forEach(line => {
                try {
                    seriesRef.current?.removePriceLine(line);
                } catch (e) {
                    // Ignore
                }
            });
            priceLinesRef.current = [];

            // Entry line (blue)
            const entryLine = seriesRef.current.createPriceLine({
                price: tradeSetup.entry,
                color: '#3b82f6',
                lineWidth: 2,
                lineStyle: 0, // Solid
                axisLabelVisible: true,
                title: 'ENTRY',
            });
            priceLinesRef.current.push(entryLine);

            // Stop Loss line (red)
            const stopLine = seriesRef.current.createPriceLine({
                price: tradeSetup.stopLoss,
                color: '#ef4444',
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'STOP',
            });
            priceLinesRef.current.push(stopLine);

            // Take Profit line (green)
            const tpLine = seriesRef.current.createPriceLine({
                price: tradeSetup.takeProfit,
                color: '#22c55e',
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'TARGET',
            });
            priceLinesRef.current.push(tpLine);

            // Add support/resistance levels if available
            if (tradeSetup.levels && tradeSetup.levels.length > 0) {
                tradeSetup.levels.slice(0, 4).forEach(level => {
                    const srLine = seriesRef.current.createPriceLine({
                        price: level.price,
                        color: level.color || (level.type === 'support' ? '#22c55e' : '#ef4444'),
                        lineWidth: 1,
                        lineStyle: 1, // Dotted
                        axisLabelVisible: false,
                        title: level.label,
                    });
                    priceLinesRef.current.push(srLine);
                });
            }
        } catch (e) {
            console.error('Error adding price lines:', e);
        }
    }, [tradeSetup, chartLoaded]);

    if (error) {
        return (
            <div className="trading-chart">
                <div className="trading-chart__loading">
                    <span>⚠️ {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="trading-chart">
            {/* Timeframe toolbar */}
            <div className="trading-chart__toolbar">
                {TIMEFRAMES.map(tf => (
                    <button
                        key={tf.value}
                        className={`trading-chart__timeframe-btn ${timeframe === tf.value ? 'trading-chart__timeframe-btn--active' : ''
                            }`}
                        onClick={() => onTimeframeChange?.(tf.value)}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Price info */}
            {currentPrice && (
                <div className="trading-chart__info">
                    <span className="trading-chart__price">
                        {formatPrice(currentPrice, pair)}
                    </span>
                    <span className={`trading-chart__change ${isUp ? 'trading-chart__change--up' : 'trading-chart__change--down'}`}>
                        {isUp ? '+' : ''}{priceChange.toFixed(pair.includes('JPY') ? 3 : 5)} ({priceChangePercent.toFixed(2)}%)
                    </span>
                    {tradeSetup?.active && (
                        <span className={`trading-chart__signal-badge trading-chart__signal-badge--${tradeSetup.direction.toLowerCase()}`}>
                            {tradeSetup.direction} {tradeSetup.probability}%
                        </span>
                    )}
                </div>
            )}

            {/* Chart container */}
            <div ref={chartContainerRef} className="trading-chart__container" />

            {/* Loading overlay */}
            {(isLoading || !chartLoaded) && !error && (
                <div className="trading-chart__loading">
                    <div className="trading-chart__spinner" />
                    <span>Loading chart...</span>
                </div>
            )}
        </div>
    );
};

export default TradingChart;
