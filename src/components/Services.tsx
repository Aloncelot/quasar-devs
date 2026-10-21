'use client';

import type { ReactNode } from 'react';
import {
    FaDesktop, FaServer, FaLayerGroup, FaRobot,
    FaWarehouse, FaProjectDiagram, FaBoxes, FaDolly, FaMicrochip, FaChartLine,
} from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CyberCard, CyberLink, Chip, type Accent } from '@/components/ui/Cyber';

interface ServiceItem {
    key: string;
    icon: ReactNode;
    /** Ocupa las dos columnas: se usa para la oferta más específica y diferenciadora. */
    featured?: boolean;
}

const SOFTWARE: ServiceItem[] = [
    { key: 'frontend', icon: <FaDesktop /> },
    { key: 'backend', icon: <FaServer /> },
    { key: 'fullstack', icon: <FaLayerGroup /> },
    { key: 'chatbots', icon: <FaRobot /> },
];

const SUPPLY: ServiceItem[] = [
    { key: 'layout', icon: <FaWarehouse />, featured: true },
    { key: 'process', icon: <FaProjectDiagram /> },
    { key: 'wms', icon: <FaBoxes /> },
    { key: 'sorter', icon: <FaDolly /> },
    { key: 'asrs', icon: <FaMicrochip /> },
    { key: 'data', icon: <FaChartLine /> },
];

const TEXT_ACCENT: Record<'cyan' | 'magenta', string> = {
    cyan: 'text-cyan-neon',
    magenta: 'text-magenta-neon',
};

interface TrackProps {
    id: string;
    group: 'sw' | 'sc';
    items: ServiceItem[];
    accent: Extract<Accent, 'cyan' | 'magenta'>;
}

const Track = ({ id, group, items, accent }: TrackProps) => {
    const { t, list } = useLanguage();

    return (
        <div id={id} className="grid scroll-mt-24 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Columna fija con el contexto del bloque */}
            <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
                <h3 className={`font-display text-3xl font-bold leading-tight md:text-4xl ${TEXT_ACCENT[accent]}`}>
                    {t(`services.${group}.title`)}
                </h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-dim">{t(`services.${group}.desc`)}</p>
                <div className="mt-6">
                    <CyberLink href="#contacto" variant="ghost" accent={accent}>
                        {t(`services.${group}.cta`)}
                    </CyberLink>
                </div>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
                {items.map((item) => (
                    <li key={item.key} className={item.featured ? 'sm:col-span-2' : ''}>
                        <CyberCard accent={accent} className="h-full" bodyClassName="flex h-full flex-col gap-4">
                            <span className={`text-3xl ${TEXT_ACCENT[accent]}`} aria-hidden="true">
                                {item.icon}
                            </span>
                            <span className="block">
                                <h4 className="font-display text-xl font-semibold leading-snug text-white">
                                    {t(`services.${group}.${item.key}_title`)}
                                </h4>
                                <span className="mt-2 block max-w-xl text-[0.95rem] leading-relaxed text-dim">
                                    {t(`services.${group}.${item.key}_desc`)}
                                </span>
                            </span>
                            <span className="mt-auto flex flex-wrap gap-2 pt-1">
                                {list(`services.${group}.${item.key}_tags`).map((tag) => (
                                    <Chip key={tag} accent={accent}>
                                        {tag}
                                    </Chip>
                                ))}
                            </span>
                        </CyberCard>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const Services = () => {
    const { t } = useLanguage();

    return (
        <section id="servicios" className="veil relative scroll-mt-16 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                    {t('services.title')}
                </h2>

                <div className="mt-16 space-y-24 md:mt-20 md:space-y-32">
                    <Track id="software" group="sw" items={SOFTWARE} accent="cyan" />
                    <Track id="supply-chain" group="sc" items={SUPPLY} accent="magenta" />
                </div>
            </div>
        </section>
    );
};
