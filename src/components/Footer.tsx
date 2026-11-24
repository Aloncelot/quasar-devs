'use client';

import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SiteLink } from '@/components/ui/SiteLink';
import { useReducedMotion } from 'framer-motion';
import { FaArrowUp, FaReact } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';
import { useLanguage } from '@/context/LanguageContext';
import { SpinningLogo } from '@/components/ui/SpinningLogo';

const YEAR = new Date().getFullYear();

// Estrellas del footer (three.js): se descargan aparte, solo cuando el footer se acerca a la pantalla
const WarpField = dynamic(() => import('@/components/backdrops/WarpField'), { ssr: false });

export const Footer = () => {
    const { t } = useLanguage();
    const reduceMotion = useReducedMotion();
    const footerRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    /** La escena se monta la primera vez que el footer se acerca (y ya no se desmonta). */
    const [near, setNear] = useState(false);

    useEffect(() => {
        const node = footerRef.current;
        if (!node) return;
        // Monta la escena un poco antes de que el footer aparezca
        const preload = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setNear(true);
                preload.disconnect();
            }
        }, { rootMargin: '600px 0px' });
        // Solo anima cuando el footer está en pantalla (ahorra GPU)
        const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        preload.observe(node);
        onScreen.observe(node);
        return () => {
            preload.disconnect();
            onScreen.disconnect();
        };
    }, []);

    const pathname = usePathname();
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    const links = [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.software'), href: '/software' },
        { label: t('nav.supply'), href: '/supply-chain' },
        { label: t('nav.about'), href: '/sobre-mi' },
        { label: t('nav.contact'), href: pathname === '/aviso-de-privacidad' ? '/#contacto' : '#contacto' },
    ];

    return (
        <footer ref={footerRef} className="relative overflow-hidden border-t border-violet-neon/30 bg-void">
            <div className="absolute inset-0" aria-hidden="true">
                {near && <WarpField active={visible && !reduceMotion} />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/20" />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 md:px-10">
                <div>
                    <p className="flex items-center gap-3 font-gibed text-2xl tracking-[0.08em] text-white">
                        <SpinningLogo className="h-28" />
                        <span>QUASAR <span className="text-cyan-neon">DEVS</span></span>
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-dim">{t('footer.tagline')}</p>
                </div>

                <nav aria-label="Pie de página" className="flex flex-wrap items-center content-center gap-x-8 gap-y-3 self-center md:justify-center">
                    {links.map((link) => (
                        <SiteLink key={link.href} href={link.href} className="nav-link">
                            {link.label}
                        </SiteLink>
                    ))}
                </nav>

                <div className="flex flex-col gap-4 md:items-end">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="group inline-flex items-center gap-3 font-display text-sm font-medium text-cyan-neon transition-colors hover:text-white"
                    >
                        <span>{t('footer.top')}</span>
                        <span className="rounded-sm border border-cyan-neon/40 bg-cyan-neon/10 p-2 transition-colors group-hover:bg-cyan-neon/25">
                            <FaArrowUp aria-hidden="true" />
                        </span>
                    </button>
                    <div className="flex items-center gap-3 text-dim" role="img" aria-label={t('footer.stack')}>
                        <SiNextdotjs aria-hidden="true" />
                        <FaReact aria-hidden="true" />
                        <SiTypescript aria-hidden="true" />
                        <SiTailwindcss aria-hidden="true" />
                    </div>
                    <p className="text-xs text-dim">
                        © {YEAR} Alonso Correa. {t('footer.rights')}
                    </p>
                    <p className="flex gap-4 text-xs">
                        <SiteLink href="/aviso-de-privacidad" className="text-dim underline-offset-4 transition-colors hover:text-cyan-neon hover:underline">
                            {t('footer.privacy')}
                        </SiteLink>
                        <SiteLink href="/aviso-de-privacidad#cookies" className="text-dim underline-offset-4 transition-colors hover:text-cyan-neon hover:underline">
                            {t('footer.cookies')}
                        </SiteLink>
                    </p>
                </div>
            </div>
        </footer>
    );
};
