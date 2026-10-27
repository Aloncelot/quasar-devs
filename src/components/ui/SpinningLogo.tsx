import Image from 'next/image';

/**
 * Logo con el disco de acreción girando (solo CSS, ver .qspin en globals.css).
 * Capas: disco completo · chorro + núcleo · mitad frontal del disco encima.
 * Ajusta el tamaño con la altura, ej. className="h-28".
 */
export const SpinningLogo = ({ className = '' }: { className?: string }) => {
    const disk = (
        <span className="qspin__squash">
            <Image src="/logo-spin/disk.webp" alt="" width={434} height={437} className="qspin__spin" />
        </span>
    );
    return (
        <span className={`qspin ${className}`.trim()} aria-hidden="true">
            <span className="qspin__disk">{disk}</span>
            <Image src="/logo-spin/core.png" alt="" width={502} height={452} className="qspin__core" />
            <span className="qspin__disk qspin__disk--front">{disk}</span>
        </span>
    );
};
