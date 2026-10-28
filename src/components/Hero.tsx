'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink } from '@/components/ui/Cyber';
import { HERO_CORE_SHIFT } from '@/components/ParticlesScene';

/* ------------------------------------------------------------------
   Hero "fijar destino": el quasar de fondo es el objetivo; una mira lo
   fija al cargar, el titular rota entre destinos (servicios) con efecto
   de descifrado y dos trayectorias unen las rutas con el núcleo.
------------------------------------------------------------------- */

const useMediaQuery = (query: string) =>
    useSyncExternalStore(
        (onChange) => {
            const media = window.matchMedia(query);
            media.addEventListener('change', onChange);
            return () => media.removeEventListener('change', onChange);
        },
        () => window.matchMedia(query).matches,
        () => false
    );

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&<>/';

/** Rota los destinos cada `interval` ms con un efecto de descifrado. */
const useDestination = (items: string[], interval: number, animate: boolean) => {
    const [index, setIndex] = useState(0);
    const [text, setText] = useState(items[0] ?? '');
    const [scrambled, setScrambled] = useState('');
    const itemsKey = items.join('|');

    useEffect(() => {
        const timer = window.setInterval(() => setIndex((i) => (i + 1) % Math.max(items.length, 1)), interval);
        return () => window.clearInterval(timer);
    }, [itemsKey, interval, items.length]);

    useEffect(() => {
        const target = items[index % Math.max(items.length, 1)] ?? '';
        if (!animate) {
            setText(target);
            setScrambled('');
            return;
        }
        let frame = 0;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, itemsKey, animate]);

    return { index, text, scrambled };
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

interface Trajectory {
    d: string;
    end: [number, number];
}

/** Trayectorias desde las tarjetas de ruta hasta el núcleo (solo escritorio). */
const useTrajectories = (
    sectionRef: RefObject<HTMLElement | null>,
    swRef: RefObject<HTMLElement | null>,
    scRef: RefObject<HTMLElement | null>,
    enabled: boolean
) => {
    const [state, setState] = useState<{ w: number; h: number; paths: Trajectory[] } | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const measure = () => {
            const section = sectionRef.current, sw = swRef.current, sc = scRef.current;
            if (!section || !sw || !sc) return;
            const base = section.getBoundingClientRect();
            const a = sw.getBoundingClientRect();
            const b = sc.getBoundingClientRect();
            const ox = window.innerWidth * (0.5 + HERO_CORE_SHIFT.desktopX) - base.left;
            // la sección empieza arriba del documento: el núcleo está a media altura de la primera pantalla
            const oy = window.innerHeight * 0.5;
            const s1: [number, number] = [a.right - 50 - base.left, a.top - base.top];
            const s2: [number, number] = [b.right - base.left, b.top + 28 - base.top];
            const e1: [number, number] = [ox - 150, oy + 70];
            const e2: [number, number] = [ox - 40, oy + 110];
            setState({
                w: base.width,
                h: base.height,
                paths: [
                    { d: `M${s1[0]} ${s1[1]} C ${s1[0] + 20} ${s1[1] - 50}, ${ox - 330} ${oy + 300}, ${e1[0]} ${e1[1]}`, end: e1 },
                    { d: `M${s2[0]} ${s2[1]} C ${s2[0] + 140} ${s2[1] - 10}, ${ox - 100} ${oy + 260}, ${e2[0]} ${e2[1]}`, end: e2 },
                ],
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        if (sectionRef.current) observer.observe(sectionRef.current);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [enabled, sectionRef, swRef, scRef]);

    return enabled ? state : null;
};

const COLORS = ['#4debff', '#e055ff'] as const;

export const Hero = () => {
    const { t, list } = useLanguage();
    const reduceMotion = useReducedMotion();
    const animate = !reduceMotion;
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const destinations = list('hero.destinations');
    const { index, text, scrambled } = useDestination(destinations, 3400, animate);

    const sectionRef = useRef<HTMLElement>(null);
    const swRef = useRef<HTMLAnchorElement>(null);
    const scRef = useRef<HTMLAnchorElement>(null);
    const traj = useTrajectories(sectionRef, swRef, scRef, isDesktop);
    const [hovered, setHovered] = useState<number | null>(null);

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
            ref={sectionRef}
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

            {/* Trayectorias ruta → núcleo */}
            {traj && (
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
                    width={traj.w}
                    height={traj.h}
                    viewBox={`0 0 ${traj.w} ${traj.h}`}
                >
                    <defs>
                        {COLORS.map((color, i) => (
                            <linearGradient key={color} id={`hero-traj-${i}`} x1="0" x2="1">
                                <stop offset="0" stopColor={color} stopOpacity="0.9" />
                                <stop offset="1" stopColor={color} stopOpacity="0.15" />
                            </linearGradient>
                        ))}
                    </defs>
                    {traj.paths.map((path, i) => (
                        <g key={i}>
                            <motion.path
                                d={path.d}
                                fill="none"
                                stroke={`url(#hero-traj-${i})`}
                                strokeWidth={hovered === i ? 2.5 : 1.5}
                                strokeDasharray="6 8"
                                style={{ filter: hovered === i ? `drop-shadow(0 0 6px ${COLORS[i]})` : undefined, transition: 'stroke-width .3s' }}
                                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.9, delay: 1.2 + i * 0.2, ease: 'easeInOut' }}
                            />
                            {/* Luz que viaja por la trayectoria */}
                            {animate ? (
                                <circle r="3.5" fill={COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${COLORS[i]})` }} opacity="0">
                                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.6s" begin={`${2.2 + i * 0.6}s`} repeatCount="indefinite" />
                                    <animateMotion dur="3.6s" begin={`${2.2 + i * 0.6}s`} repeatCount="indefinite" path={path.d} />
                                </circle>
                            ) : (
                                <circle cx={path.end[0]} cy={path.end[1]} r="3.5" fill={COLORS[i]} />
                            )}
                        </g>
                    ))}
                </svg>
            )}

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
                            <motion.span variants={item} className="block min-h-[2.2em] sm:min-h-[1.1em]">
                                <span className="hero-dest-text">{text}</span>
                                <span className="text-cyan-neon/60">{scrambled}</span>
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
                        <CyberLink href="#servicios" variant="ghost">
                            {t('hero.cta_secondary')}
                        </CyberLink>
                    </motion.div>
                </motion.div>

                {/* Rutas */}
                <motion.div
                    className="mt-12 grid max-w-[640px] gap-4 sm:grid-cols-2"
                    initial={animate ? { opacity: 0, y: 18 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
                >
                    {[
                        { ref: swRef, href: '#software', accent: 'cyan' as const, title: 'hero.route_sw_title', desc: 'hero.route_sw_desc', count: 'hero.route_sw_count', fill: '64%' },
                        { ref: scRef, href: '#supply-chain', accent: 'magenta' as const, title: 'hero.route_sc_title', desc: 'hero.route_sc_desc', count: 'hero.route_sc_count', fill: '40%' },
                    ].map((route, i) => (
                        <a
                            key={route.href}
                            ref={route.ref}
                            href={route.href}
                            className="block"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(i)}
                            onBlur={() => setHovered(null)}
                        >
                            <CyberCard accent={route.accent} bodyClassName="!p-5">
                                <span className="flex items-baseline justify-between gap-3">
                                    <span className="font-display text-lg font-semibold" style={{ color: COLORS[i] }}>
                                        {t(route.title)}
                                    </span>
                                    <span className="text-xs text-dim">{t(route.count)}</span>
                                </span>
                                <span className="mt-1 block text-sm leading-snug text-dim">{t(route.desc)}</span>
                                <span aria-hidden="true" className="relative mt-3 block h-0.5 bg-white/10">
                                    <span
                                        className="absolute inset-y-0 left-0"
                                        style={{ width: route.fill, background: `linear-gradient(90deg, transparent, ${COLORS[i]})`, boxShadow: `0 0 10px ${COLORS[i]}` }}
                                    />
                                </span>
                            </CyberCard>
                        </a>
                    ))}
                </motion.div>
            </div>

            {/* Indicador de scroll */}
            <a
                href="#servicios"
                className="absolute bottom-10 right-10 z-10 hidden items-center gap-3 text-sm text-dim transition-colors hover:text-white lg:flex"
            >
                <span aria-hidden="true" className="hero-thrust block h-12 w-px bg-gradient-to-b from-magenta-neon to-transparent" />
                {t('hero.scroll')}
            </a>
        </section>
    );
};
