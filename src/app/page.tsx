import { ParticlesSceneLazy } from '@/components/ParticlesSceneLazy';
import { Hero } from '@/components/Hero';
import { RoutesSplit } from '@/components/RoutesSplit';
import { Projects } from '@/components/Projects';
import { AboutTeaser } from '@/components/AboutTeaser';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FloatingLink } from '@/components/FloatingLink';
import { RandallLazy } from '@/components/randall/RandallLazy';

export default function Home() {
  return (
    <>
      <main id="contenido" className="relative w-full">
        {/* Fondo fijo: la galaxia que recorre la página mientras haces scroll */}
        <ParticlesSceneLazy />
        <Hero />
        {/* Resumen de las dos rutas; cada una tiene su página (/software y /supply-chain) */}
        <RoutesSplit />
        <Projects />
        <AboutTeaser />
        <Contact />
      </main>
      <Footer />
      <FloatingLink />
      {/* Randall: asistente pixelado (esquina inferior izquierda) */}
      <RandallLazy />
    </>
  );
}
