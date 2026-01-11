import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon = false,
    loading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const classes = [
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full',
        icon && 'button--icon',
        loading && 'button--loading',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
