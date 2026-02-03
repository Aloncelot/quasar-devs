'use client';

import { motion } from 'framer-motion';
import { FaDatabase, FaServer, FaCode, FaIndustry, FaRulerCombined } from 'react-icons/fa';
import { SiDotnet, SiReact } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const skills = [
    {
        category: "CORE SYSTEM & DATA",
        icon: <FaDatabase className="text-purple-400" />,
        items: [
            { name: "C# / .NET Ecosystem", level: 95, color: "bg-purple-500", shadow: "shadow-purple-500/50" },
            { name: "SQL & Heavy Data Architecture", level: 95, color: "bg-purple-600", shadow: "shadow-purple-600/50" },
            { name: "Cloud Infra (Azure)", level: 85, color: "bg-blue-500", shadow: "shadow-blue-500/50" },
        ]
    },
    {
        category: "INTERFACE & UX",
        icon: <FaCode className="text-cyan-400" />,
        items: [
            { name: "React / Next.js", level: 90, color: "bg-cyan-500", shadow: "shadow-cyan-500/50" },
            { name: "Three.js / WebGL", level: 70, color: "bg-cyan-700", shadow: "shadow-cyan-700/50" },
        ]
    },
    {
        category: "DOMAIN EXPERTISE (REAL WORLD)",
        icon: <FaIndustry className="text-amber-400" />,
        items: [
            { name: "Supply Chain Consulting", level: 100, color: "bg-amber-500", shadow: "shadow-amber-500/50" },
            { name: "Construction Estimation", level: 100, color: "bg-amber-600", shadow: "shadow-amber-600/50" },
        ]
    }
];

const TacticalSkillBar = ({ level, color, shadow }: { level: number, color: string, shadow: string }) => {
    const totalSegments = 20;
    const activeSegments = Math.round((level / 100) * totalSegments);

    return (
        <div className="flex gap-[2px] h-3 w-full">
            {Array.from({ length: totalSegments }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.1, scaleY: 0.5, backgroundColor: "#1f2937" }}
                    whileInView={{
                        opacity: i < activeSegments ? 1 : 0.2,
                        scaleY: 1,
                        backgroundColor: i < activeSegments ? "" : "#1f2937",
                    }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.1,
                        delay: i * 0.03,
                        type: "spring",
                        stiffness: 200
                    }}
                    className={`flex-1 rounded-[1px] transition-colors duration-300 ${i < activeSegments ? `${color} ${shadow} shadow-[0_0_8px_currentColor]` : 'bg-gray-800'
                        }`}
                />
            ))}
        </div>
    );
};

export const About = () => {
    return (
        <section id="sobre-mi" className="relative w-full min-h-screen bg-black py-24 px-6 md:px-12 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-20">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="w-[800px] h-[800px] border border-dashed border-teal-500/20 rounded-full flex items-center justify-center"
                >
                    <div className="w-[600px] h-[600px] border border-teal-500/10 rounded-full" />
                    <div className="w-[400px] h-[400px] border border-dashed border-teal-500/20 rounded-full" />
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-5 flex flex-col items-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative w-64 h-80 md:w-80 md:h-96 border-2 border-cyan-500/30 bg-gray-900/50 rounded-lg overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                        <img
                            src="AC2.jpeg"
                            alt="Alonso Correa"
                            className="w-full h-full object-cover opacity-90 transition-all duration-500 [filter:grayscale(100%)_brightness(70%)_sepia(100%)_hue-rotate(130deg)_saturate(400%)_contrast(250%)] group-hover:opacity-100"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none" />
                        <motion.div
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-[2px] bg-teal-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] opacity-50 z-30"
                        />
                        <motion.div
                            animate={{ top: ['-20%', '100%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-20 bg-gradient-to-b from-transparent via-teal-500/10 to-transparent pointer-events-none"
                        />
                        <motion.div
                            animate={{ top: ['120%', '-20%'] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-20 bg-gradient-to-b from-transparent via-teal-500/20 to-transparent pointer-events-none"
                        />
                    </motion.div>

                    <div className="mt-6 w-full max-w-xs space-y-2 font-mono text-xs text-cyan-500/80">
                        <div className="flex justify-between border-b border-cyan-900 pb-1">
                            <span>ID:</span>
                            <span className="text-white font-bold tracking-wider">ALONSO CORREA</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-900 pb-1">
                            <span>BASE:</span>
                            <span className="text-white">CDMX, MEXICO</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-900 pb-1">
                            <span>STATUS:</span>
                            <span className="text-green-400 animate-pulse">● ONLINE</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-900 pb-1">
                            <span>LANG:</span>
                            <span className="text-white">ES / EN / DE(A2)</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 text-white">

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h1 className="font-gibed text-5xl md:text-7xl mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] tracking-wider">
                            ALONSO CORREA
                        </h1>

                        <h2 className="font-mono text-xl md:text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bold">
                            SYSTEM ARCHITECT
                        </h2>
                        <h3 className="text-sm md:text-lg text-gray-400 font-mono mb-6 tracking-[0.2em] uppercase">
                            & Supply Chain Consultant
                        </h3>

                        <div className="bg-gray-900/40 border-l-4 border-amber-500 p-6 mb-10 rounded-r-lg backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <FaIndustry size={60} />
                            </div>

                            <p className="text-gray-300 leading-relaxed text-lg relative z-10">
                                "El código es solo otra forma de logística. Mi experiencia como <span className="text-amber-400 font-bold">Consultor de Supply Chain</span> y en <span className="text-amber-400 font-bold">Estimación de Construcción</span> me enseñó que un error en los datos cuesta millones."
                            </p>
                            <p className="text-gray-300 leading-relaxed mt-4 relative z-10 text-sm md:text-base">
                                No solo construyo apps; diseño sistemas. Traduzco la complejidad del mundo real —inventarios masivos, costos fluctuantes, bases de datos pesadas— en arquitecturas de software eficientes y escalables. <span className="text-white font-semibold italic block mt-2 border-t border-gray-700 pt-2">Donde otros ven tablas, yo veo flujos de optimización.</span>
                            </p>
                        </div>
                    </motion.div>

                    <div className="space-y-10">
                        {skills.map((skillGroup, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-4 text-xs font-bold tracking-[0.2em] text-gray-500 uppercase border-b border-gray-800 pb-2">
                                    {skillGroup.icon}
                                    {skillGroup.category}
                                </div>

                                <div className="space-y-5 pl-2">
                                    {skillGroup.items.map((item, i) => (
                                        <div key={i} className="relative">
                                            <div className="flex justify-between text-xs font-mono text-gray-300 mb-1 items-end">
                                                <span className="text-white font-semibold tracking-wide">{item.name}</span>
                                                <span className="text-cyan-500">{item.level}% EFFICIENCY</span>
                                            </div>

                                            <TacticalSkillBar
                                                level={item.level}
                                                color={item.color}
                                                shadow={item.shadow}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};