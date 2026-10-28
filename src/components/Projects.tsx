'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    FaArrowLeft, FaArrowRight, FaChartLine, FaCode, FaCube, FaDatabase, FaExternalLinkAlt,
    FaRobot, FaShoppingCart, FaTasks, FaWarehouse,
} from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink, Chip } from '@/components/ui/Cyber';
import { PROJECTS, type ProjectItem } from '@/data/projects';

/* ------------------------------------------------------------------
   "Ruta de misiones": una trayectoria cruza la sección con un nodo por
   proyecto; las tarjetas alternan arriba y abajo. Sin fondo propio:
   el quasar de la página se ve detrás, igual que en el resto del sitio.
------------------------------------------------------------------- */

const ICONS: Record<ProjectItem['icon'], ReactNode> = {
    database: <FaDatabase />, code: <FaCode />, cube: <FaCube />, cart: <FaShoppingCart />,
    tasks: <FaTasks />, robot: <FaRobot />, warehouse: <FaWarehouse />, chart: <FaChartLine />,
};

// Geometría de la ruta (escritorio)
const TRACK_H = 720;         // alto del área de la ruta
const CENTER_Y = TRACK_H / 2;
const EDGE_PAD = 150;        // distancia del primer/último nodo al borde
const MIN_GAP = 180;         // separación mínima entre nodos (las tarjetas alternan arriba/abajo); si no caben, la ruta se desplaza
const CARD_W = 256;
const CARD_OFFSET = 64;      // distancia nodo → tarjeta
const WAVE = [36, -26, 18, -34, 12, -20];

const isLive = (url: string) => url !== '#';

/** Curva suave que pasa por todos los puntos (Catmull-Rom → Bézier). */
const smoothPath = (pts: [number, number][]) => {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
    }
    return d;
};

interface CardData {
    item: ProjectItem;
    title: string;
    category: string;
    description: string;
}

const ProjectCard = ({ data, btn, soon, onHover }: {
    data: CardData;
    btn: string;
    soon: string;
    onHover?: (on: boolean) => void;
}) => {
    const { item } = data;
    const live = isLive(item.url);
    return (
        <div onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)} onFocus={() => onHover?.(true)} onBlur={() => onHover?.(false)}>
            <CyberCard accent={item.accent} bodyClassName="flex flex-col gap-2 !p-5">
                <span className="flex items-center justify-between gap-3">
                    <Chip accent={item.accent}>{data.category}</Chip>
                    <span className="text-lg" style={{ color: item.color }} aria-hidden="true">{ICONS[item.icon]}</span>
                </span>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">{data.title}</h3>
                <p className="text-sm leading-relaxed text-dim">{data.description}</p>
                {item.tech && <p className="text-xs text-dim/80">{item.tech}</p>}
                {live ? (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex w-fit items-center gap-2 font-display text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ color: item.color }}
                    >
                        {btn} <FaExternalLinkAlt aria-hidden="true" size={11} />
                    </a>
                ) : (
                    <span className="mt-1 w-fit border border-dashed border-violet-neon/50 px-2 py-0.5 font-display text-sm text-dim">
                        {soon}
                    </span>
                )}
            </CyberCard>
        </div>
    );
};

export const Projects = () => {
    const { t } = useLanguage();
    const reduceMotion = useReducedMotion();
    const animate = !reduceMotion;

    const cards: CardData[] = PROJECTS.map((item) => ({
        item,
        title: t(`projects.${item.key}_title`),
        category: t(`projects.${item.key}_cat`),
        description: t(`projects.${item.key}_desc`),
    }));

    /* ---- medida del contenedor para repartir la ruta ---- */
    const viewportRef = useRef<HTMLDivElement>(null);
    const [viewW, setViewW] = useState(0);
    const [scroll, setScroll] = useState({ left: 0, max: 0 });
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const update = () => {
            setViewW(el.clientWidth);
            setScroll({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth });
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        el.addEventListener('scroll', update, { passive: true });
        return () => {
            observer.disconnect();
            el.removeEventListener('scroll', update);
        };
    }, []);

    const n = cards.length;
    const layout = useMemo(() => {
        if (!viewW) return null;
        const trackW = Math.max(viewW, EDGE_PAD * 2 + (n - 1) * MIN_GAP);
        const gap = n > 1 ? (trackW - EDGE_PAD * 2) / (n - 1) : 0;
        const nodes: [number, number][] = Array.from({ length: n }, (_, i) => [
            n > 1 ? EDGE_PAD + i * gap : trackW / 2,
            CENTER_Y + WAVE[i % WAVE.length],
        ]);
        const path = smoothPath([[0, CENTER_Y + 30], ...nodes, [trackW, CENTER_Y - 14]]);
        return { trackW, nodes, path };
    }, [viewW, n]);

    const overflow = scroll.max > 4;
    const scrollBy = (dir: 1 | -1) =>
        viewportRef.current?.scrollBy({ left: dir * MIN_GAP * 2, behavior: animate ? 'smooth' : 'auto' });

    const travel = Math.max(6, n * 1.6); // segundos que tarda la luz en recorrer la ruta

    return (
        <section id="proyectos" className="veil relative scroll-mt-16 py-24 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                            {t('projects.title')}
                        </h2>
                        <p className="mt-3 max-w-lg text-lg text-dim">{t('projects.subtitle')}</p>
                    </div>
                    {overflow && (
                        <div className="hidden gap-3 lg:flex">
                            <button
                                type="button"
                                onClick={() => scrollBy(-1)}
                                disabled={scroll.left <= 4}
                                aria-label={t('projects.prev')}
                                className="rounded-sm border border-violet-neon/40 p-3 text-cyan-neon transition-colors hover:border-cyan-neon disabled:opacity-30"
                            >
                                <FaArrowLeft aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollBy(1)}
                                disabled={scroll.left >= scroll.max - 4}
                                aria-label={t('projects.next')}
                                className="rounded-sm border border-violet-neon/40 p-3 text-cyan-neon transition-colors hover:border-cyan-neon disabled:opacity-30"
                            >
                                <FaArrowRight aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ---------- Escritorio: ruta horizontal ---------- */}
            <div
                ref={viewportRef}
                className={`projects-route relative mt-8 hidden lg:block ${overflow ? 'projects-route--scroll' : ''}`}
                style={{ height: TRACK_H }}
            >
                {layout && (
                    <div className="relative" style={{ width: layout.trackW, height: TRACK_H }}>
                        <svg aria-hidden="true" className="pointer-events-none absolute inset-0" width={layout.trackW} height={TRACK_H}>
                            <defs>
                                <linearGradient id="route-grad" x1="0" x2="1">
                                    <stop offset="0" stopColor="#8a63ff" stopOpacity="0.15" />
                                    <stop offset="0.5" stopColor="#8a63ff" stopOpacity="0.8" />
                                    <stop offset="1" stopColor="#8a63ff" stopOpacity="0.15" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                d={layout.path}
                                fill="none"
                                stroke="url(#route-grad)"
                                strokeWidth="1.5"
                                strokeDasharray="6 8"
                                initial={animate ? { pathLength: 0 } : false}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 1.4, ease: 'easeInOut' }}
                            />
                            {animate && (
                                <circle r="4" fill="#4debff" style={{ filter: 'drop-shadow(0 0 8px #4debff)' }}>
                                    <animateMotion dur={`${travel}s`} repeatCount="indefinite" path={layout.path} />
                                </circle>
                            )}
                            {layout.nodes.map(([x, y], i) => {
                                const up = i % 2 === 0;
                                const color = cards[i].item.color;
                                const lit = hovered === i;
                                return (
                                    <g key={cards[i].item.key}>
                                        <line
                                            x1={x} y1={up ? y - 12 : y + 12}
                                            x2={x} y2={up ? y - CARD_OFFSET : y + CARD_OFFSET}
                                            stroke={color} strokeOpacity={lit ? 0.9 : 0.5}
                                        />
                                        <circle
                                            cx={x} cy={y} r={lit ? 11 : 9}
                                            fill="#060414" stroke={color} strokeWidth="2"
                                            style={{ filter: `drop-shadow(0 0 ${lit ? 14 : 8}px ${color})`, transition: 'r .25s' }}
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {cards.map((card, i) => {
                            const [x, y] = layout.nodes[i];
                            const up = i % 2 === 0;
                            const left = Math.min(Math.max(x - CARD_W / 2, 16), layout.trackW - CARD_W - 16);
                            return (
                                <motion.div
                                    key={card.item.key}
                                    className="projects-route__card absolute"
                                    style={{
                                        width: CARD_W,
                                        left,
                                        ...(up ? { bottom: TRACK_H - (y - CARD_OFFSET) } : { top: y + CARD_OFFSET }),
                                    }}
                                    initial={animate ? { opacity: 0, y: up ? -16 : 16 } : false}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                                >
                                    <ProjectCard
                                        data={card}
                                        btn={t('projects.btn_access')}
                                        soon={t('projects.coming_soon')}
                                        onHover={(on) => setHovered(on ? i : null)}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ---------- Móvil y tablet: ruta vertical ---------- */}
            <ol className="relative mx-auto mt-10 max-w-2xl space-y-6 px-6 md:px-10 lg:hidden">
                <span
                    aria-hidden="true"
                    className="absolute bottom-4 left-[calc(1.5rem+7px)] top-4 w-px border-l border-dashed border-violet-neon/60 md:left-[calc(2.5rem+7px)]"
                />
                {cards.map((card) => (
                    <li key={card.item.key} className="relative pl-10">
                        <span
                            aria-hidden="true"
                            className="absolute left-0 top-6 h-4 w-4 rounded-full border-2 bg-void"
                            style={{ borderColor: card.item.color, boxShadow: `0 0 10px ${card.item.color}` }}
                        />
                        <ProjectCard data={card} btn={t('projects.btn_access')} soon={t('projects.coming_soon')} />
                    </li>
                ))}
            </ol>

            <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center gap-6 px-6 md:px-10">
                <p className="font-display text-lg text-white">{t('projects.cta_text')}</p>
                <CyberLink href="#contacto" variant="solid" accent="magenta">
                    {t('projects.cta')}
                </CyberLink>
            </div>
        </section>
    );
};
