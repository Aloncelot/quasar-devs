'use client';

import { motion } from 'framer-motion';
import { FaRocket, FaMobileAlt, FaCloud } from 'react-icons/fa';
import { SiDotnet } from 'react-icons/si';

// IMPORTAMOS EL CEREBRO BILINGÜE
import { useLanguage } from '@/context/LanguageContext';

// --- 1. COMPONENTE SCANLINES REUTILIZABLE (Mismo que en Contacto) ---
const ScanlinesOverlay = () => (
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40 rounded-2xl z-20" />
);


const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

// Limpiamos los variantes de la tarjeta para que el CSS (ignition) tome el control de los bordes y el brillo
const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const Services = () => {
    // EXTRAEMOS LA FUNCIÓN DE TRADUCCIÓN
    const { t } = useLanguage();

    const servicesData = [
        {
            id: 1,
            title: t('services.s1_title'),
            description: t('services.s1_desc'),
            icon: <SiDotnet className="text-4xl" />,
            tech: ["React", "Next.js", "C# .NET"]
        },
        {
            id: 2,
            title: t('services.s2_title'),
            description: t('services.s2_desc'),
            icon: <FaRocket className="text-4xl" />,
            tech: ["Three.js", "WebGL", "R3F"]
        },
        {
            id: 3,
            title: t('services.s1_title'), // Ejemplo, asumiendo s3_title en el dict real
            description: t('services.s1_desc'), // Ejemplo, asumiendo s3_desc en el dict real
            icon: <FaMobileAlt className="text-4xl" />,
            tech: ["Framer", "Tailwind", "Figma"]
        },
        {
            id: 4,
            title: t('services.s1_title'), // Ejemplo, asumiendo s4_title en el dict real
            description: t('services.s1_desc'), // Ejemplo, asumiendo s4_desc en el dict real
            icon: <FaCloud className="text-4xl" />,
            tech: ["AWS / Azure", "Firebase", "Python"]
        }
    ];

    return (
        <section
            id="servicios"
            className="relative w-full min-h-screen bg-gradient-to-b from-transparent via-black/80 to-black py-24 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Fondo decorativo (grid sutil) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(20, 184, 166, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Encabezado (Bilingüe) */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 z-10"
            >
                <h2 className="font-gibed text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
                    {t('services.title')}
                </h2>
                <p className="text-teal-500/60 mt-4 uppercase tracking-[0.2em] text-sm md:text-base font-mono">
                    {t('services.subtitle')}
                </p>
            </motion.div>

            {/* Grid de Tarjetas */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl z-10"
            >
                {servicesData.map((service) => (
                    <motion.div
                        key={service.id}
                        variants={cardVariants}
                        // Mantenemos la escala con Framer, pero quitamos las transiciones de borde
                        whileHover={{ scale: 1.02 }} 
                        // --- 2. APLICAMOS LA CLASE DE IGNICIÓN Y QUITAMOS TRANSICIONES VIEJAS ---
                        className="group relative p-8 rounded-2xl border border-teal-900/30 bg-black/40 backdrop-blur-sm transition-none hover-ignition overflow-hidden cursor-default"
                    >
                        {/* --- 3. INYECTAMOS LAS SCANLINES --- */}
                        <ScanlinesOverlay />

                        {/* Brillo de fondo sutil (se intensifica con el ignition del hover por CSS) */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full transition-all duration-500 z-0" />

                        {/* Icono y ID (Contenido relativo z-10 para estar sobre scanlines) */}
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="p-3 bg-teal-950/30 rounded-lg text-teal-400 border border-teal-500/20 transition-all duration-300 group-hover:scale-110 group-hover:text-teal-300">
                                {service.icon}
                            </div>
                            <span className="text-xs font-mono text-teal-500/30 tracking-widest">
                                SYS.0{service.id}
                            </span>
                        </div>

                        {/* Texto */}
                        <h3 className="text-2xl font-bold text-white mb-3 transition-colors relative z-10 group-hover:text-teal-200">
                            {service.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed mb-6 transition-colors relative z-10 text-sm group-hover:text-gray-300">
                            {service.description}
                        </p>

                        {/* Stack Tecnológico */}
                        <div className="flex gap-2 flex-wrap relative z-10">
                            {service.tech.map((t, i) => (
                                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-teal-900/20 text-teal-200/70 border border-teal-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Barra decorativa final (también brillará con el ignition) */}
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500 ease-out group-hover:w-full z-10" />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};