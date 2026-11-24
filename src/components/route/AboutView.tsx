'use client';

import dynamic from 'next/dynamic';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FloatingLink } from '@/components/FloatingLink';
import { RandallLazy } from '@/components/randall/RandallLazy';

// Cinturón de asteroides (canvas): solo en el navegador
const AsteroidDrift = dynamic(() => import('@/components/backdrops/AsteroidDrift'), { ssr: false });

/** Página /sobre-mi: fondo más claro, con asteroides que cruzan de derecha a izquierda. */
export const AboutView = () => (
    <>
        <main id="contenido" className="theme-about relative w-full">
            <div aria-hidden="true" className="about-sky" />
            <AsteroidDrift />
            <About asPage />
            <Contact defaultType="software" />
        </main>
        <Footer />
        <FloatingLink />
        <RandallLazy />
    </>
);
