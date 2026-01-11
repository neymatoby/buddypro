import './Input.css';

const Input = ({
    label,
    error,
    icon,
    size = 'md',
    className = '',
    ...props
}) => {
    const inputClasses = [
        'input',
        `input--${size}`,
        error && 'input--error',
        icon && 'input--with-icon',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input className={inputClasses} {...props} />
            </div>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
