'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { Track, SOFTWARE, SUPPLY } from '@/components/Services';
import { Process } from '@/components/Process';
import { ProjectGrid } from '@/components/Projects';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FloatingLink } from '@/components/FloatingLink';
import { RandallLazy } from '@/components/randall/RandallLazy';
import {
    RouteBackdrop, RouteHero, SoftwareVisual, CedisPlan, SoftwareStack, TenderFlow,
    CrossLink, Kicker, SectionHeading, type Route,
} from './RouteParts';

// Escenas de fondo (WebGL / canvas): solo en el navegador
const RadioObservatory = dynamic(() => import('@/components/backdrops/RadioObservatory'), { ssr: false });

// Proyectos de cada ruta (claves de data/projects.ts)
const ROUTE_PROJECTS: Record<Route, string[]> = {
    sw: ['p1', 'p4', 'p5', 'p7'],
    sc: ['p3', 'p6'],
};

const RouteServices = ({ route }: { route: Route }) => {
    const { t } = useLanguage();
    return (
        <section id="servicios" className="veil relative scroll-mt-16 py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <Kicker route={route}>{t(`pages.${route}.services_kicker`)}</Kicker>
                <div className="mt-8">
                    {route === 'sw' ? (
                        <Track id="software" group="sw" items={SOFTWARE} accent="violet" />
                    ) : (
                        <Track id="supply-chain" group="sc" items={SUPPLY} accent="teal" />
                    )}
                </div>
            </div>
        </section>
    );
};

const RouteProjects = ({ route }: { route: Route }) => {
    const { t } = useLanguage();
    return (
        <section id="proyectos" className="veil relative scroll-mt-16 py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
                <SectionHeading route={route} kicker={t(`pages.${route}.projects_kicker`)} title={t(`pages.${route}.projects_title`)} />
                <div className="mt-12">
                    <ProjectGrid keys={ROUTE_PROJECTS[route]} route={route} />
                </div>
            </div>
        </section>
    );
};

const Shell = ({ route, backdrop, children }: { route: Route; backdrop?: React.ReactNode; children: React.ReactNode }) => (
    <>
        <main id="contenido" className={`theme-${route} relative w-full`}>
            <RouteBackdrop />
            {backdrop}
            {children}
            <Contact defaultType={route === 'sw' ? 'software' : 'supply'} tone={route === 'sw' ? 'violet' : 'teal'} />
            <CrossLink from={route} />
        </main>
        <Footer />
        <FloatingLink />
        <RandallLazy />
    </>
);

/** Página /software: fondo púrpura oscuro. */
export const SoftwareView = () => (
    <Shell route="sw">
        <RouteHero route="sw" visual={<SoftwareVisual />} secondaryHref="#proyectos" />
        <RouteServices route="sw" />
        <SoftwareStack />
        <RouteProjects route="sw" />
        <Process tone="sw" />
    </Shell>
);

/** Página /supply-chain: fondo verde azulado oscuro. */
export const SupplyView = () => (
    <Shell route="sc" backdrop={<RadioObservatory />}>
        <RouteHero route="sc" visual={<CedisPlan />} secondaryHref="#servicios" />
        <RouteServices route="sc" />
        <TenderFlow />
        <RouteProjects route="sc" />
    </Shell>
);
