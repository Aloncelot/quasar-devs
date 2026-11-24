import type { Metadata } from 'next';
import { AboutView } from '@/components/route/AboutView';

const title = 'Alonso Correa, fundador | Quasar Devs';
const description =
    'Desarrollador full stack y consultor de supply chain en la Ciudad de México: más de 10 años en consultoría de supply chain, 5 en desarrollo full stack y chatbots con IA.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/sobre-mi' },
    openGraph: { type: 'website', locale: 'es_MX', siteName: 'Quasar Devs', title, description, url: '/sobre-mi', images: ['/og.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
};

export default function AboutPage() {
    return <AboutView />;
}
