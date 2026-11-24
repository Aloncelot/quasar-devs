'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink, Chip } from '@/components/ui/Cyber';

/* ------------------------------------------------------------------
   Piezas compartidas de las páginas de ruta (/software y /supply-chain).
   Cada ruta tiene su color: software = violeta/magenta (fondo púrpura
   oscuro) y supply chain = verde azulado (fondo verde azulado oscuro).
------------------------------------------------------------------- */

export type Route = 'sw' | 'sc';

// Clases completas para que Tailwind no las elimine
export const ROUTE_STYLE = {
    sw: {
        text: 'text-[#b9a3ff]',
        line: 'bg-[#b9a3ff]',
        border: 'border-[#8a63ff]/45',
        grad: 'bg-gradient-to-r from-[#8a63ff] to-[#e055ff]',
        accent: 'violet' as const,
        hex: '#8a63ff',
    },
    sc: {
        text: 'text-[#3ee0cf]',
        line: 'bg-[#3ee0cf]',
        border: 'border-[#3ee0cf]/40',
        grad: 'bg-gradient-to-r from-[#3ee0cf] to-[#2bd4a4]',
        accent: 'teal' as const,
        hex: '#3ee0cf',
    },
};

/** Fondo fijo de la ruta (reemplaza a la galaxia de la página principal). */
export const RouteBackdrop = () => <div aria-hidden="true" className="route-backdrop" />;

/** `meter`: la línea lleva una luz que la recorre de izquierda a derecha (como las rutas del hero original). */
export const Kicker = ({ route, meter = false, children }: { route?: Route; meter?: boolean; children: ReactNode }) => (
    <p className={`flex items-center gap-3 font-display text-sm font-semibold uppercase tracking-[0.22em] ${route ? ROUTE_STYLE[route].text : 'text-cyan-neon'}`}>
        {children}
        {meter ? (
            <span
                aria-hidden="true"
                className="kicker-meter"
                style={{ ['--c' as string]: route === 'sw' ? '#c4b0ff' : route === 'sc' ? '#6ff5e6' : '#4debff', ['--delay' as string]: route === 'sc' ? '0.35s' : '0s' }}
            />
        ) : (
            <span aria-hidden="true" className={`h-px w-12 ${route ? ROUTE_STYLE[route].line : 'bg-cyan-neon'}`} />
        )}
    </p>
);

export const SectionHeading = ({ route, kicker, title }: { route: Route; kicker: string; title: string }) => (
    <div>
        <Kicker route={route}>{kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">{title}</h2>
    </div>
);

/** Migas: quasardevs.com / software */
export const Breadcrumb = ({ route, current }: { route?: Route; current: string }) => {
    const { t } = useLanguage();
    return (
        <nav aria-label="Ruta de navegación" className="font-mono text-[0.8rem] tracking-wide text-dim">
            <Link href="/" className="transition-colors hover:text-white">
                {t('pages.home')}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className={`font-semibold ${route ? ROUTE_STYLE[route].text : 'text-cyan-neon'}`}>{current}</span>
        </nav>
    );
};

interface HeroProps {
    route: Route;
    visual: ReactNode;
    secondaryHref: string;
}

/** Hero de cada ruta: título en dos tonos, cifras y un visual a la derecha. */
export const RouteHero = ({ route, visual, secondaryHref }: HeroProps) => {
    const { t } = useLanguage();
    const k = (key: string) => t(`pages.${route}.${key}`);
    const style = ROUTE_STYLE[route];

    return (
        <section className={`relative overflow-x-clip pt-28 md:pt-32 ${route === 'sc' ? 'pb-[30vh]' : 'pb-20 md:pb-24'}`}>
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <Breadcrumb route={route} current={k('crumb')} />
                <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
                    <div>
                        <Kicker route={route}>{k('kicker')}</Kicker>
                        <h1 className="mt-5 font-display text-[clamp(2.4rem,4.6vw,4rem)] font-bold leading-[1.06] text-white">
                            {k('title_a')}{' '}
                            <span className={`${style.grad} bg-clip-text text-transparent`}>{k('title_b')}</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-dim">{k('lead')}</p>
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                            <CyberLink href="#contacto" variant="solid" accent={style.accent}>
                                {k('cta_primary')}
                            </CyberLink>
                            <CyberLink href={secondaryHref} variant="ghost" accent={style.accent}>
                                {k('cta_secondary')}
                            </CyberLink>
                        </div>
                        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className={`flex flex-col-reverse border-l-2 pl-4 ${style.border}`}>
                                    <dt className="mt-1 text-xs leading-snug text-dim sm:text-sm">{k(`stat${n}_label`)}</dt>
                                    <dd className={`font-display text-2xl font-bold sm:text-3xl ${n === 1 ? style.text : 'text-white'}`}>{k(`stat${n}_value`)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="min-w-0">{visual}</div>
                </div>
            </div>
        </section>
    );
};

// Escenas WebGL: solo en el navegador
const BlackHole = dynamic(() => import('@/components/backdrops/BlackHole'), { ssr: false });

/** Visual del hero /software: el agujero negro con la terminal flotando frente al disco. */
export const SoftwareVisual = () => (
    <div className="relative">
        {/* Fijo en la pantalla (no se desplaza con el scroll), igual que los fondos de las demás páginas */}
        <BlackHole className="blackhole-fixed" />
        <div className="relative lg:pt-[68%]">
            <SoftwareTerminal />
        </div>
    </div>
);

/** Terminal con los servicios de software (visual del hero /software). */
export const SoftwareTerminal = () => {
    const { t, list } = useLanguage();
    const lines = list('pages.sw.term_lines');
    const pairs: [string, string][] = [];
    for (let i = 0; i < lines.length; i += 2) pairs.push([lines[i], lines[i + 1] ?? '']);

    return (
        <CyberCard accent="violet" bodyClassName="!p-0">
            <div aria-hidden="true">
                <div className="flex items-center justify-between bg-[#462890]/55 px-5 py-3 font-display text-sm font-semibold tracking-wide text-[#c9b8ff]">
                    <span>{t('pages.sw.term_title')}</span>
                    <span className="flex gap-2">
                        <i className="h-2.5 w-2.5 rounded-full bg-magenta-neon" />
                        <i className="h-2.5 w-2.5 rounded-full bg-violet-neon" />
                        <i className="h-2.5 w-2.5 rounded-full bg-cyan-neon" />
                    </span>
                </div>
                <div className="overflow-x-auto px-5 py-6 font-mono text-[0.72rem] leading-[2] sm:px-6 sm:text-[0.95rem] text-ink">
                    <p className="term-line"><span className="text-magenta-neon">$ </span>{t('pages.sw.term_cmd')}</p>
                    {pairs.map(([label, detail]) => (
                        <p key={label} className="term-line">
                            <span className="font-bold text-[#b9a3ff]">› </span>
                            {label.padEnd(12, ' ')}
                            <span className="text-dim">{detail}</span>
                        </p>
                    ))}
                    <p className="term-line text-cyan-neon">✓ {t('pages.sw.term_ok')}<span className="term-cursor ml-1" /></p>
                </div>
            </div>
        </CyberCard>
    );
};

/** Plano esquemático de un CEDIS (visual del hero /supply-chain). */
export const CedisPlan = () => {
    const { t, list } = useLanguage();
    const [recibo, cross, storage, picking, sorter, shipping] = list('pages.sc.plan_labels');
    const label = { fill: '#93bdbd', fontSize: 11, fontFamily: 'ui-monospace, monospace' };

    return (
        <CyberCard accent="teal" bodyClassName="!p-0">
            <div className="flex items-center justify-between bg-[#0a5054]/55 px-5 py-3 font-display text-sm font-semibold tracking-wide text-[#9ff3e6]">
                <span>{t('pages.sc.plan_title')}</span>
                <span className="font-mono text-xs font-normal">{t('pages.sc.plan_scale')}</span>
            </div>
            <svg viewBox="-10 -24 620 430" className="block w-full px-4 pb-4 pt-3" aria-hidden="true">
                <defs>
                    <marker id="cedis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                        <path d="M0 0L10 5L0 10z" fill="#2bd4a4" />
                    </marker>
                    <marker id="cedis-arrow-out" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0 0L10 5L0 10z" fill="#e055ff" />
                    </marker>
                    <pattern id="cedis-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M20 0H0V20" fill="none" stroke="#3ee0cf" strokeOpacity=".07" />
                    </pattern>
                </defs>
                <rect x="0" y="0" width="600" height="380" fill="url(#cedis-grid)" stroke="#3ee0cf" strokeWidth="2" />
                <g fill="none" stroke="#3ee0cf">
                    {[20, 80, 140].map((x) => <rect key={x} x={x} y="-14" width="40" height="14" />)}
                    {[420, 480, 540].map((x) => <rect key={x} x={x} y="380" width="40" height="14" />)}
                </g>
                <text x="20" y="22" {...label}>{recibo}</text>
                <text x="418" y="368" {...label}>{shipping}</text>
                <g fill="rgba(62,224,207,.10)" stroke="#3ee0cf" strokeWidth="1.2">
                    {[230, 270, 310, 350, 390, 430, 470, 510, 550].map((x) => <rect key={x} x={x} y="40" width="22" height="200" />)}
                </g>
                <text x="230" y="30" {...label}>{storage}</text>
                <rect x="30" y="250" width="170" height="100" fill="rgba(43,212,164,.12)" stroke="#2bd4a4" />
                <text x="42" y="272" {...label} fill="#2bd4a4">{picking}</text>
                <text x="240" y="290" {...label} fill="#e055ff">{sorter}</text>
                <rect x="30" y="60" width="170" height="150" fill="none" stroke="#3ee0cf" strokeDasharray="4 4" />
                <text x="42" y="82" {...label}>{cross}</text>
                {/* Flujo de material en movimiento: recibo → cross dock → pasillo central (entrada)
                    y pasillo central → picking → sorter → embarque (salida) */}
                <g fill="none" strokeWidth="2.5">
                    <path className="flow-dash" d="M160 -14 V135 H218 V258 H377 V52" stroke="#2bd4a4" markerEnd="url(#cedis-arrow)" />
                    <path className="flow-dash" d="M115 212 V246" stroke="#2bd4a4" markerEnd="url(#cedis-arrow)" />
                    <path className="flow-dash" d="M385 52 V268 H206 M200 300 H400 Q420 300 420 320 V340 H500 V378" stroke="#e055ff" strokeWidth="3" markerEnd="url(#cedis-arrow-out)" />
                </g>
            </svg>
        </CyberCard>
    );
};

/** Tabla de herramientas (/software). */
export const SoftwareStack = () => {
    const { t, list } = useLanguage();
    const rows = ['lang', 'fw', 'data'];
    return (
        <section className="veil relative py-20 md:py-24">
            <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.3fr]">
                <div>
                    <SectionHeading route="sw" kicker={t('pages.sw.stack_kicker')} title={t('pages.sw.stack_title')} />
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-dim">{t('pages.sw.stack_desc')}</p>
                </div>
                <dl>
                    {rows.map((row) => (
                        <div key={row} className="grid gap-3 border-b border-[#8a63ff]/20 py-4 sm:grid-cols-[170px_1fr] sm:items-center">
                            <dt className="font-display font-semibold text-[#c9b8ff]">{t(`pages.sw.stack_${row}_label`)}</dt>
                            <dd className="flex flex-wrap gap-2">
                                {list(`pages.sw.stack_${row}`).map((item) => <Chip key={item} accent="violet">{item}</Chip>)}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
};

/** Acompañamiento en licitaciones, en 5 pasos (/supply-chain). */
export const TenderFlow = () => {
    const { t } = useLanguage();
    const steps = [1, 2, 3, 4, 5];
    return (
        <section className="veil relative py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <SectionHeading route="sc" kicker={t('pages.sc.flow_kicker')} title={t('pages.sc.flow_title')} />
                {/* Mismo trazo que el proceso de /software: línea punteada en movimiento, punto y número */}
                <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
                    {steps.map((n) => (
                        <li key={n} className="relative pt-8">
                            <span aria-hidden="true" className="dash-line absolute inset-x-0 top-0 [--dash:#3ee0cf]" />
                            <span aria-hidden="true" className="absolute -top-[6px] left-0 h-3 w-3 rounded-full bg-[#3ee0cf] shadow-[0_0_12px_#3ee0cf]" />
                            <span aria-hidden="true" className="block font-display text-5xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_#2bd4a4]">
                                {n}
                            </span>
                            <h3 className="mt-4 font-display text-lg font-semibold text-white">{t(`pages.sc.f${n}_title`)}</h3>
                            <p className="mt-2 text-[0.95rem] leading-relaxed text-dim">{t(`pages.sc.f${n}_desc`)}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};

/** Franja que lleva a la otra ruta. */
export const CrossLink = ({ from }: { from: Route }) => {
    const { t } = useLanguage();
    const to: Route = from === 'sw' ? 'sc' : 'sw';
    return (
        <div className="veil-tail">
            <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
            <CyberCard
                accent={ROUTE_STYLE[to].accent}
                href={to === 'sw' ? '/software' : '/supply-chain'}
                bodyClassName={`flex flex-col gap-3 !py-6 sm:flex-row sm:items-center sm:justify-between ${to === 'sw' ? 'bg-[#281256]/60' : 'bg-[#063036]/60'}`}
            >
                <span className="font-display text-lg text-white">{t(`pages.${from}.cross_text`)}</span>
                <span className={`font-display font-semibold ${ROUTE_STYLE[to].text}`}>{t(`pages.${from}.cross_cta`)} →</span>
            </CyberCard>
            </div>
        </div>
    );
};
