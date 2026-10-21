import { ParticlesScene } from '@/components/ParticlesScene';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Process } from '@/components/Process';
import { Projects } from '@/components/Projects';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FloatingLink } from '@/components/FloatingLink';

export default function Home() {
  return (
    <>
      <main id="contenido" className="relative w-full">
        {/* Fondo fijo: la galaxia que recorre la página mientras haces scroll */}
        <ParticlesScene />
        <Hero />
        <Services />
        <Process />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingLink />
    </>
  );
}
