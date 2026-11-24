import type { Metadata } from 'next';
import { SupplyView } from '@/components/route/RouteViews';

const title = 'Consultoría de supply chain: layouts de almacén, CEDIS y licitaciones WMS | Quasar Devs';
const description =
    'Diseño de layouts de almacenes, bodegas, cross docks y CEDIS; optimización de procesos, gestión de inventarios y acompañamiento en licitaciones de WMS, sorters, conveyors y AS/RS hasta la puesta en marcha.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/supply-chain' },
    openGraph: { type: 'website', locale: 'es_MX', siteName: 'Quasar Devs', title, description, url: '/supply-chain', images: ['/og.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
};

export default function SupplyChainPage() {
    return <SupplyView />;
}
