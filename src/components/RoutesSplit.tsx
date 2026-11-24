'use client';

import { FaCode, FaWarehouse } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberLink } from '@/components/ui/Cyber';
import { Kicker, ROUTE_STYLE, type Route } from '@/components/route/RouteParts';

/* ------------------------------------------------------------------
   "Dos rutas": resumen de cada especialidad en la página principal,
   cada panel con el color de su ruta y un botón a su página.
------------------------------------------------------------------- */

const PANELS: { route: Route; href: string; icon: React.ReactNode; panel: string }[] = [
    { route: 'sw', href: '/software', icon: <FaCode />, panel: 'route-panel route-panel--sw' },
    { route: 'sc', href: '/supply-chain', icon: <FaWarehouse />, panel: 'route-panel route-panel--sc' },
];

export const RoutesSplit = () => {
    const { t, list } = useLanguage();

    return (
        <section id="rutas" className="veil relative scroll-mt-16 py-24 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <Kicker>{t('routes.kicker')}</Kicker>
                <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                    {t('routes.title')}
                </h2>

                <div className="mt-12 grid lg:grid-cols-2">
                    {PANELS.map(({ route, href, icon, panel }) => {
                        const style = ROUTE_STYLE[route];
                        return (
                            <article key={route} className={`${panel} border ${style.border} px-7 py-10 md:px-11 md:py-12`}>
                                <span aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 -z-10 text-[11rem] opacity-[0.07] ${style.text}`}>
                                    {icon}
                                </span>
                                <Kicker route={route} meter>{t(`routes.${route}_kicker`)}</Kicker>
                                <h3 className="mt-4 font-display text-3xl font-bold text-white">{t(`routes.${route}_title`)}</h3>
                                <p className="mt-3 text-dim">{t(`routes.${route}_desc`)}</p>
                                <ul className="mb-9 mt-6 space-y-3">
                                    {list(`routes.${route}_items`).map((item) => (
                                        <li key={item} className="flex gap-3 text-ink/90">
                                            <span aria-hidden="true" className={`font-mono font-bold ${style.text}`}>›</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <CyberLink href={href} variant="solid" accent={style.accent}>
                                    {t(`routes.${route}_cta`)} →
                                </CyberLink>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
