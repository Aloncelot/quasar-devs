'use client';

import { motion } from 'framer-motion';
import { FaReact, FaRocket, FaMobileAlt, FaCode, FaCloud } from 'react-icons/fa';
import { SiNextdotjs, SiTypescript, SiDotnet } from 'react-icons/si';

const services = [
    {
        id: 1,
        title: "Ecosistemas Web & Apps",
        description: "Desarrollo de aplicaciones multiplataforma de alto rendimiento. Desde portales web progresivos hasta soluciones empresariales robustas.",
        icon: <SiDotnet className="text-4xl" />,
        tech: ["React", "Next.js", "C# .NET"]
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
        title: "Cloud & Data Intelligence",
        description: "Infraestructura escalable y gestión de datos inteligente. Desplegamos tu proyecto en la nube con seguridad y eficiencia.",
        icon: <FaCloud className="text-4xl" />,
        tech: ["AWS / Azure", "Firebase", "Python"]
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
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
            className="relative w-full min-h-screen bg-gradient-to-b from-transparent via-black/80 to-black py-24 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden"
        >

            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(20, 184, 166, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 z-10"
            >
                <h2 className="font-gibed text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
                    NUESTRAS MISIONES
                </h2>
                <p className="text-teal-500/60 mt-4 uppercase tracking-[0.2em] text-sm md:text-base font-mono">
                    Capacidades Técnicas & Servicios
                </p>
            </motion.div>

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
                        whileHover={{ scale: 1.02 }}
                        className="group relative p-8 rounded-2xl border border-teal-900/30 bg-black/40 backdrop-blur-sm hover:border-teal-500/50 transition-colors duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,255,0.02),rgba(0,255,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 rounded-2xl" />

                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full group-hover:bg-teal-400/20 transition-all duration-500" />

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="p-3 bg-teal-950/30 rounded-lg text-teal-400 border border-teal-500/20 group-hover:scale-110 group-hover:text-teal-300 transition-transform duration-300">
                                {service.icon}
                            </div>
                            <span className="text-xs font-mono text-teal-500/30 tracking-widest">
                                SYS.0{service.id}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-200 transition-colors relative z-10">
                            {service.title}
                        </h3>

                        <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors relative z-10 text-sm">
                            {service.description}
                        </p>

                        <div className="flex gap-2 flex-wrap relative z-10">
                            {service.tech.map((t, i) => (
                                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-teal-900/20 text-teal-200/70 border border-teal-500/20">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-teal-500 to-cyan-400 group-hover:w-full transition-all duration-500 ease-out" />
                    </motion.div>
                ))}
            </motion.div>

        </section>
    );
};