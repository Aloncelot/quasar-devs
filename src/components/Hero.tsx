'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { CyberLink } from '@/components/ui/Cyber';
import { HERO_CORE_SHIFT } from '@/components/sceneLayout';

/* ------------------------------------------------------------------
   Hero "fijar destino": el quasar de fondo es el objetivo; una mira lo
   fija al cargar, el titular rota entre destinos (servicios) con efecto
   de descifrado. Las rutas se presentan en la sección "Dos rutas".
------------------------------------------------------------------- */

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&<>/';

/** Índice del destino actual: avanza cada `interval` ms. */
const useDestinationIndex = (count: number, interval: number) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = window.setInterval(() => setIndex((i) => (i + 1) % Math.max(count, 1)), interval);
        return () => window.clearInterval(timer);
    }, [count, interval]);
    return index;
};

/**
 * Texto del destino con efecto de descifrado. Vive en su propio componente porque cambia
 * en cada frame durante la animación: así solo se vuelve a pintar esta línea, no todo el Hero.
 */
const DestinationText = ({ target, animate }: { target: string; animate: boolean }) => {
    const [text, setText] = useState(target);
    const [scrambled, setScrambled] = useState('');

    useEffect(() => {
        let frame = 0;
        if (!animate) {
            // Se aplica en el siguiente frame (no de forma síncrona dentro del efecto)
            frame = requestAnimationFrame(() => {
                setText(target);
                setScrambled('');
            });
            return () => cancelAnimationFrame(frame);
        }
        const start = performance.now();
        const duration = 650;
        const tick = (now: number) => {
            const ratio = Math.min((now - start) / duration, 1);
            const solved = Math.floor(ratio * target.length);
            setText(target.slice(0, solved));
            const tail = Math.min(3, target.length - solved);
            let noise = '';
            for (let i = 0; i < tail; i++) noise += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
            setScrambled(noise);
            if (ratio < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, animate]);

    return (
        <>
            <span className="hero-dest-text">{text}</span>
            <span className="text-cyan-neon/60">{scrambled}</span>
        </>
    );
};

/** Mira de navegación centrada sobre el núcleo del quasar (solo escritorio). */
const Reticle = ({ label, animate }: { label: string; animate: boolean }) => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute z-0 hidden lg:block"
        style={{ left: `${50 + HERO_CORE_SHIFT.desktopX * 100}%`, top: '50vh', width: 460, height: 340, transform: 'translate(-50%, -50%)' }}
    >
        <svg viewBox="-230 -170 460 340" className="h-full w-full overflow-visible">
            <g className={animate ? 'hero-spin-slow' : undefined}>
                <circle r="118" fill="none" stroke="#4debff" strokeOpacity="0.5" strokeDasharray="2 10" />
            </g>
            <g className={animate ? 'hero-spin-reverse' : undefined}>
                <circle r="160" fill="none" stroke="#8a63ff" strokeOpacity="0.45" strokeDasharray="60 18 4 18" />
            </g>
            {[45, 135, 225, 315].map((deg) => {
                const a = (deg * Math.PI) / 180;
                return (
                    <line
                        key={deg}
                        x1={Math.cos(a) * 176} y1={Math.sin(a) * 176}
                        x2={Math.cos(a) * 196} y2={Math.sin(a) * 196}
                        stroke="#4debff" strokeWidth="2"
                    />
                );
            })}
            {/* Esquinas del visor: entran desde fuera y "fijan" el objetivo */}
            <motion.path
                d="M-210 -130 v-20 h20 M210 -130 v-20 h-20 M-210 130 v20 h20 M210 130 v20 h-20"
                fill="none" stroke="#e9ecff" strokeOpacity="0.7" strokeWidth="1.5"
                initial={animate ? { scale: 1.3, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
            <motion.text
                x="-210" y="-160"
                className="fill-dim font-display"
                style={{ fontSize: 12, letterSpacing: '0.04em' }}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
            >
                {label}
            </motion.text>
        </svg>
    </div>
);

export const Hero = () => {
    const { t, list } = useLanguage();
    const reduceMotion = useReducedMotion();
    const animate = !reduceMotion;

    const destinations = list('hero.destinations');
    const index = useDestinationIndex(destinations.length, 3400);

    const container: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
    };
    const item: Variants = {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <section
            id="inicio"
            className="relative flex min-h-screen items-end overflow-hidden pb-14 pt-28 lg:items-center lg:pb-12"
        >
            {/* Velos para legibilidad sobre la galaxia */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/70 to-transparent lg:bg-gradient-to-r lg:from-void/90 lg:via-void/55 lg:to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void/80 to-transparent"
            />

            <Reticle label={t('hero.locked')} animate={animate} />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
                <motion.div
                    className="max-w-[640px]"
                    variants={container}
                    initial={animate ? 'hidden' : false}
                    animate="show"
                >
                    <motion.p variants={item} className="flex items-center gap-3 font-gibed text-lg tracking-[0.14em] text-cyan-neon md:text-2xl">
                        <span className="wordmark">QUASAR DEVS</span>
                        <span aria-hidden="true" className="h-px w-12 bg-gradient-to-r from-cyan-neon to-transparent" />
                    </motion.p>

                    <h1 className="mt-5 font-display text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[1.05] tracking-[-0.01em] text-white">
                        <span className="sr-only">{t('hero.sr_headline')}</span>
                        <span aria-hidden="true">
                            <motion.span variants={item} className="block">{t('hero.lead')}</motion.span>
                            <motion.span variants={item} className="block min-h-[2.1em]">
                                <DestinationText target={destinations[index % Math.max(destinations.length, 1)] ?? ''} animate={animate} />
                                <span className="hero-caret" />
                            </motion.span>
                        </span>
                    </h1>

                    <motion.div variants={item} aria-hidden="true" className="mt-4 flex gap-1.5">
                        {destinations.map((d, i) => (
                            <span
                                key={d}
                                className={`h-[3px] w-8 transition-all duration-500 ${
                                    i === index ? 'bg-cyan-neon shadow-[0_0_8px_#4debff]' : 'bg-violet-neon/35'
                                }`}
                            />
                        ))}
                    </motion.div>

                    <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-dim">
                        {t('hero.sub')}
                    </motion.p>

                    <motion.div variants={item} className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        <CyberLink href="#contacto" variant="solid">
                            {t('hero.cta_primary')}
                        </CyberLink>
                        <CyberLink href="#rutas" variant="ghost">
                            {t('hero.cta_secondary')}
                        </CyberLink>
                    </motion.div>
                </motion.div>
            </div>

            {/* Indicador de scroll */}
            <a
                href="#rutas"
                className="absolute bottom-10 right-10 z-10 hidden items-center gap-3 text-sm text-dim transition-colors hover:text-white lg:flex"
            >
                <span aria-hidden="true" className="hero-thrust block h-12 w-px bg-gradient-to-b from-magenta-neon to-transparent" />
                {t('hero.scroll')}
            </a>
        </section>
    );
};
