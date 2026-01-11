import { getConfidenceColor } from '../../utils/formatters';
import './SignalCard.css';

const SignalCard = ({ signal, pair }) => {
    if (!signal) {
        return (
            <div className="signal-card">
                <div className="signal-card__header">
                    <h3 className="signal-card__title">Trading Signal</h3>
                </div>
                <div className="signal-card__no-data">
                    Loading signal analysis...
                </div>
            </div>
        );
    }

    const signalType = signal.signal?.label?.toLowerCase().replace(' ', '-') || 'neutral';
    const signalLabel = signal.signal?.label || 'Neutral';
    const confidence = signal.confidence || 0;
    const reasons = signal.reasons || [];

    return (
        <div className="signal-card">
            <div className="signal-card__header">
                <h3 className="signal-card__title">Trading Signal - {pair}</h3>
            </div>

            <div className={`signal-card__signal signal-card__signal--${signalType}`}>
                <span className={`signal-card__signal-label signal-card__signal-label--${signalType}`}>
                    {signalLabel}
                </span>

                <div className="signal-card__confidence">
                    <div className="signal-card__confidence-bar">
                        <div
                            className="signal-card__confidence-fill"
                            style={{
                                width: `${confidence}%`,
                                background: getConfidenceColor(confidence),
                            }}
                        />
                    </div>
                    <span className="signal-card__confidence-text">
                        {confidence}% Confidence
                    </span>
                </div>
            </div>

            {reasons.length > 0 && (
                <div className="signal-card__reasons">
                    <h4 className="signal-card__reasons-title">Analysis Reasons</h4>
                    {reasons.map((reason, index) => (
                        <div key={index} className="signal-card__reason">
                            <svg className="signal-card__reason-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>{reason}</span>
                        </div>
                    ))}
                </div>
            )}

            <p style={{
                marginTop: 'var(--spacing-lg)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                textAlign: 'center'
            }}>
                ⚠️ This is for educational purposes only, not financial advice.
            </p>
        </div>
    );
};

export default SignalCard;
