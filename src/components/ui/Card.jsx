import './Card.css';

const Card = ({
    children,
    hover = false,
    glow = false,
    variant = 'default',
    compact = false,
    className = '',
    ...props
}) => {
    const classes = [
        'card',
        hover && 'card--hover',
        glow && 'card--glow',
        variant !== 'default' && `card--${variant}`,
        compact && 'card--compact',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`card__header ${className}`} {...props}>
        {children}
    </div>
);

const CardTitle = ({ children, subtitle, className = '', ...props }) => (
    <div className={className} {...props}>
        <h3 className="card__title">{children}</h3>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
    </div>
);

const CardContent = ({ children, className = '', ...props }) => (
    <div className={`card__content ${className}`} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`card__footer ${className}`} {...props}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
