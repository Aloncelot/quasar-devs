import type { Metadata } from 'next';
import { SoftwareView } from '@/components/route/RouteViews';

const title = 'Desarrollo de software a la medida en CDMX | Quasar Devs';
const description =
    'Sitios web, aplicaciones web y móviles, sistemas internos y chatbots con IA (RAG). Desarrollo frontend, backend y full stack con React, Next.js, Node.js, Python y Flutter.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/software' },
    openGraph: { type: 'website', locale: 'es_MX', siteName: 'Quasar Devs', title, description, url: '/software', images: ['/og.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
};

export default function SoftwarePage() {
    return <SoftwareView />;
}
