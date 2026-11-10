type SkeletonProps = {
    className?: string;
    /** Esquinas cortadas, igual que las cards */
    chamfer?: boolean;
    /** Si se pasa, el skeleton se desvanece cuando el contenido ya cargó */
    loaded?: boolean;
};

/** Bloque de carga con barrido cian. Decorativo: no lo leen los lectores de pantalla. */
export const Skeleton = ({ className = '', chamfer = false, loaded }: SkeletonProps) => (
    <span
        aria-hidden="true"
        data-loaded={loaded === undefined ? undefined : String(loaded)}
        className={`skeleton ${chamfer ? 'skeleton--chamfer' : ''} ${loaded === undefined ? '' : 'skeleton-fade'} ${className}`}
    />
);
