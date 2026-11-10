import { memo } from 'react';
import { buildFrame, GRID, SHADOW, type FrameOptions } from './sprite';
import styles from './randall.module.css';

type Props = FrameOptions & { className?: string; /** Muestra la sombra flotante (no en el encabezado). */ shadow?: boolean };

/** Dibuja a Randall como SVG de píxeles grandes (nítido a cualquier tamaño, sin imágenes). */
export const RandallSprite = memo(function RandallSprite({ className, shadow = true, ...frame }: Props) {
    const pixels = buildFrame(frame);
    return (
        <svg
            viewBox={`0 0 ${GRID} ${GRID}`}
            className={className}
            shapeRendering="crispEdges"
            aria-hidden="true"
            focusable="false"
        >
            {shadow && (
                <g className={styles.shadow}>
                    {SHADOW.map(([x, y, color]) => (
                        <rect key={x} x={x} y={y} width={1.02} height={1.02} fill={color} />
                    ))}
                </g>
            )}
            <g className={styles.body}>
                {pixels.map(([x, y, color], i) => (
                    <rect key={i} x={x} y={y} width={1.02} height={1.02} fill={color} />
                ))}
            </g>
        </svg>
    );
});
