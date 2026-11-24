import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Enlace del sitio: las rutas internas ("/software", "/#contacto") usan next/link (navegación sin
 * recargar la página y con prefetch); las anclas de la misma página y los enlaces externos usan <a>.
 */
export const SiteLink = ({ href, ...props }: Props) =>
    href.startsWith('/') && !props.target ? <Link href={href} {...props} /> : <a href={href} {...props} />;
