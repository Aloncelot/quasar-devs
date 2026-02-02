'use client'; // <-- IMPORTANTE: Framer Motion necesita 'use client'

import { ParticlesScene } from '@/components/ParticlesScene';
// 1. Importamos motion
import { motion, Variants } from 'framer-motion';
import { Services } from '@/components/Services';
import { Projects } from '@/components/Projects';

export default function Home() {

  // Definimos las variantes de la animación (el "antes" y el "después")
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Retraso entre la aparición de cada hijo
        delayChildren: 0.5 // Espera un poco a que cargue el 3D antes de empezar
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 }, // Empieza 50px abajo y transparente
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 } // Efecto rebote suave
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
            QUASAR DEVS
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-2xl text-cyan-200/80 uppercase tracking-[0.3em] font-light"
            variants={itemVariants}
          >
            Architecting the Digital Future
          </motion.p>
        </motion.div>
      </div>

      <Services />
      <Projects />

    </main>
  );
}