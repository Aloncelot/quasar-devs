import Image from 'next/image';

/** Símbolo de Quasar Devs (logo original, fondo transparente). Ajusta el tamaño con la altura: ej. "h-10 w-auto". */
export const LogoMark = ({ className = '', title }: { className?: string; title?: string }) => (
    <Image
        src="/logo-mark.png"
        alt={title ?? ''}
        aria-hidden={title ? undefined : true}
        width={442}
        height={512}
        priority
        className={className}
    />
);
