'use client';

import { motion } from 'framer-motion';
import { FaReact, FaRocket, FaMobileAlt, FaCode, FaCloud } from 'react-icons/fa'; // Iconos clásicos
import { SiNextdotjs, SiTypescript, SiDotnet } from 'react-icons/si'; // Iconos de marcas tech

const services = [
    {
        id: 1,
        title: "Ecosistemas Web & Apps", // <-- CAMBIO AQUÍ
        description: "Desarrollo de aplicaciones multiplataforma de alto rendimiento. Desde portales web progresivos hasta soluciones empresariales robustas.",
        icon: <SiDotnet className="text-4xl" />, // Icono de .NET para denotar robustez
        tech: ["React", "Next.js", "C# .NET"] // <-- AQUI AGREGAMOS .NET
    },
    {
        id: 2,
        title: "Experiencias 3D Inmersivas",
        description: "Rompemos la barrera de la pantalla plana. Integramos modelos 3D, partículas y shaders para webs que dejan huella.",
        icon: <FaRocket className="text-4xl" />,
        tech: ["Three.js", "WebGL", "R3F"]
    },
    {
        id: 3,
        title: "UI/UX Futurista",
        description: "Diseños que no parecen de este planeta. Interfaces limpias, oscuras y con micro-interacciones que guían al usuario.",
        icon: <FaMobileAlt className="text-4xl" />,
        tech: ["Framer", "Tailwind", "Figma"]
    },
    {
        id: 4,
        title: "Cloud & Data Intelligence", // <-- CAMBIO AQUÍ
        description: "Infraestructura escalable y gestión de datos inteligente. Desplegamos tu proyecto en la nube con seguridad y eficiencia.",
        icon: <FaCloud className="text-4xl" />,
        // <-- AQUI AGREGAMOS TU STACK DE DATOS Y NUBE
        tech: ["AWS / Azure", "Firebase", "Python"]
    }
];

// Variante para animar la entrada de las tarjetas una por una
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 } // Retraso de 0.2s entre cada tarjeta
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const Services = () => {
    return (
        <section
            id="servicios"
            className="relative w-full min-h-screen bg-gradient-to-b from-transparent via-black/50 to-black py-24 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden"
        >

            {/* FONDO: Grid Sutil (CSS puro) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            {/* TÍTULO DE LA SECCIÓN */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 z-10"
            >
                <h2 className="font-gibed text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                    NUESTRAS MISIONES
                </h2>
                <p className="text-cyan-200/60 mt-4 uppercase tracking-[0.2em] text-sm md:text-base">
                    Capacidades Técnicas & Servicios
                </p>
            </motion.div>

            {/* GRID DE TARJETAS */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl z-10"
            >
                {services.map((service) => (
                    <motion.div
                        key={service.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 243, 255, 0.05)" }}
                        className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/50 transition-colors duration-300 overflow-hidden"
                    >
                        {/* Efecto de brillo en las esquinas al hacer hover (opcional) */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 blur-[40px] rounded-full group-hover:bg-cyan-400/30 transition-all duration-500" />

                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 bg-black/50 rounded-lg text-cyan-400 border border-cyan-500/20 group-hover:scale-110 group-hover:text-cyan-300 transition-transform duration-300">
                                {service.icon}
                            </div>
                            {/* ID estilo militar/técnico */}
                            <span className="text-xs font-mono text-white/30">
                                SYS.0{service.id}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
                            {service.title}
                        </h3>

                        <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                            {service.description}
                        </p>

                        {/* Tags de tecnologías */}
                        <div className="flex gap-2 flex-wrap">
                            {service.tech.map((t, i) => (
                                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-cyan-200/70 border border-white/5">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Línea decorativa animada en el borde inferior */}
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-500 ease-out" />
                    </motion.div>
                ))}
            </motion.div>

        </section>
    );
};