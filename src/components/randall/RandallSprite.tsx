import { memo } from 'react';
import { buildFrame, GRID, type FrameOptions } from './sprite';
import styles from './randall.module.css';

type Props = FrameOptions & { className?: string };

/** Dibuja a Randall como SVG de píxeles grandes (nítido a cualquier tamaño, sin imágenes). */
export const RandallSprite = memo(function RandallSprite({ className, ...frame }: Props) {
    const pixels = buildFrame(frame);
    return (
        <svg
            viewBox={`0 0 ${GRID} ${GRID}`}
            className={className}
            shapeRendering="crispEdges"
            aria-hidden="true"
            focusable="false"
        >
            {pixels.map(([x, y, color], i) => (
                <rect
                    key={i}
                    x={x}
                    y={y}
                    width={1.02}
                    height={1.02}
                    fill={color}
                    className={x === 5 && y === 0 ? styles.antenna : undefined}
                />
            ))}
        </svg>
    );
});
