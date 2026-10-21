import type { ReactNode, ButtonHTMLAttributes } from 'react';

export type Accent = 'cyan' | 'magenta' | 'violet' | 'azure';

// Las clases se escriben completas para que Tailwind/PostCSS no las elimine.
const CARD_CLASS: Record<Accent, string> = {
    cyan: 'cyber-card',
    magenta: 'cyber-card cyber-card--magenta',
    violet: 'cyber-card cyber-card--violet',
    azure: 'cyber-card cyber-card--azure',
};

const CHIP_CLASS: Record<Accent, string> = {
    cyan: 'chip',
    magenta: 'chip chip--magenta',
    violet: 'chip chip--violet',
    azure: 'chip',
};

interface CardProps {
    accent?: Accent;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
    /** Si se indica, la tarjeta completa es un enlace. */
    href?: string;
    external?: boolean;
    ariaLabel?: string;
}

/** Tarjeta con esquinas cortadas, borde neón y parpadeo de encendido al hover/foco. */
export const CyberCard = ({
    accent = 'cyan', className = '', bodyClassName = '', children, href, external, ariaLabel,
}: CardProps) => {
    const classes = `${CARD_CLASS[accent]} ${className}`.trim();
    const inner = (
        <div className="cyber-card__face">
            <div className={`cyber-card__body ${bodyClassName}`.trim()}>{children}</div>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                className={classes}
                aria-label={ariaLabel}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
                {inner}
            </a>
        );
    }
    return <div className={classes}>{inner}</div>;
};

/** Etiqueta de tecnología / categoría. */
export const Chip = ({ children, accent = 'cyan' }: { children: ReactNode; accent?: Accent }) => (
    <span className={CHIP_CLASS[accent]}>{children}</span>
);

interface ButtonBaseProps {
    variant?: 'solid' | 'ghost';
    accent?: 'cyan' | 'magenta';
    className?: string;
    children: ReactNode;
}

const buttonClass = ({ variant = 'solid', accent = 'cyan', className = '' }: Omit<ButtonBaseProps, 'children'>) => {
    const variantClass = variant === 'solid' ? 'cyber-btn--solid' : 'cyber-btn--ghost';
    const accentClass = accent === 'magenta' ? 'cyber-btn--magenta' : '';
    return `cyber-btn ${variantClass} ${accentClass} ${className}`.trim();
};

type LinkButtonProps = ButtonBaseProps & {
    href: string;
    external?: boolean;
    ariaLabel?: string;
};

/** Botón-enlace cyberpunk. */
export const CyberLink = ({ href, external, ariaLabel, children, ...base }: LinkButtonProps) => (
    <a
        href={href}
        className={buttonClass(base)}
        aria-label={ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
        <span className="cyber-btn__face">{children}</span>
    </a>
);

type ButtonProps = ButtonBaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/** Botón cyberpunk. */
export const CyberButton = ({ variant, accent, className, children, type = 'button', ...rest }: ButtonProps) => (
    <button type={type} className={buttonClass({ variant, accent, className })} {...rest}>
        <span className="cyber-btn__face">{children}</span>
    </button>
);
