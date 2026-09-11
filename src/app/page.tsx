'use client'; 

import { ParticlesScene } from '@/components/ParticlesScene';
import { motion, Variants } from 'framer-motion';
import { Services } from '@/components/Services';
import { Projects } from '@/components/Projects';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FloatingLink } from '@/components/FloatingLink';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, 
        delayChildren: 0.5 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 }, 
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 } 
    }
  };

  return (
    <main className="relative w-full text-white">
      <ParticlesScene />
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">

        <motion.div
          className="z-10 text-center text-white pointer-events-none select-none px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="font-gibed text-6xl md:text-9xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]"
            variants={itemVariants}
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-2xl text-cyan-200/80 uppercase tracking-[0.3em] font-light"
            variants={itemVariants}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA: el resto del contenedor tiene pointer-events-none, por eso se re-habilita aquí */}
          <motion.a
            href="#proyectos"
            variants={itemVariants}
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 border border-teal-500/50 text-teal-300 font-mono text-sm uppercase tracking-widest hover:bg-teal-500/10 hover:border-teal-400 transition-colors pointer-events-auto"
          >
            {t('hero.cta')}
          </motion.a>
        </motion.div>
      </div>

      <Services />
      <Projects />
      <About />
      <Contact />
      <Footer />
      <FloatingLink />

    </main>
  );
}